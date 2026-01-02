from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from datetime import datetime
from app.models import (
    Alert, AlertRecipient, Incident, User, AlertLevel, 
    AlertDeliveryStatus, PlatformType
)
from app.schemas import AlertCreate
from app.services.user_service import UserService
from app.services.incident_service import IncidentService
from app.integrations.weather import weather_service
import uuid


class AlertService:
    """Service for managing flood alerts and warnings"""
    
    @staticmethod
    def generate_alert_from_incident(
        db: Session,
        incident_id: str,
        alert_level: Optional[AlertLevel] = None
    ) -> Alert:
        """
        Generate alert from verified incident
        
        Automatically determines alert level if not provided
        """
        incident = IncidentService.get_incident_by_id(db, incident_id)
        if not incident:
            raise ValueError("Incident not found")
        
        # Determine alert level from incident severity
        if not alert_level:
            severity_to_alert = {
                'low': AlertLevel.ADVISORY,
                'medium': AlertLevel.WATCH,
                'high': AlertLevel.WARNING,
                'critical': AlertLevel.EMERGENCY
            }
            alert_level = severity_to_alert.get(
                incident.severity.value, 
                AlertLevel.WARNING
            )
        
        # Generate alert message
        message = AlertService._generate_alert_message(
            incident, 
            alert_level, 
            language='en'
        )
        
        # Get affected radius (with buffer)
        affected_radius = incident.affected_radius_km or 5.0
        
        # Create alert
        alert = Alert(
            id=str(uuid.uuid4()),
            incident_id=incident_id,
            severity=alert_level,
            message=message,
            affected_radius_km=affected_radius,
            delivery_status=AlertDeliveryStatus.PENDING,
            recipients_count=0
        )
        
        db.add(alert)
        db.commit()
        db.refresh(alert)
        
        return alert
    
    @staticmethod
    def _generate_alert_message(
        incident: Incident,
        alert_level: AlertLevel,
        language: str = 'en'
    ) -> str:
        """Generate localized alert message"""
        # Get incident location info (would extract from PostGIS)
        # For now using placeholder
        location = "affected area"
        
        templates = {
            'en': {
                AlertLevel.ADVISORY: "🌊 FLOOD ADVISORY\n\nFlood reported in {location}. {report_count} reports received. Water levels rising. Stay alert and monitor conditions.",
                AlertLevel.WATCH: "⚠️ FLOOD WATCH\n\nFLOODING IN PROGRESS near {location}. {report_count} confirmed reports. Avoid the area. Prepare for possible evacuation.",
                AlertLevel.WARNING: "🚨 FLOOD WARNING\n\nSIGNIFICANT FLOODING at {location}. {report_count} reports. DANGEROUS CONDITIONS. Avoid area immediately. Move to higher ground if nearby.",
                AlertLevel.EMERGENCY: "🆘 FLOOD EMERGENCY\n\nCRITICAL FLOOD SITUATION at {location}. LIFE-THREATENING CONDITIONS. EVACUATE IMMEDIATELY if in area. Seek higher ground NOW. Emergency services notified."
            },
            'sw': {  # Swahili
                AlertLevel.ADVISORY: "🌊 TAHADHARI YA MAFURIKO\n\nMafuriko yameripotiwa {location}. Ripoti {report_count} zimepokelewa. Maji yanaongezeka. Kuwa macho.",
                AlertLevel.WARNING: "🚨 ONYO LA MAFURIKO\n\nMAFURIKO MAKUBWA {location}. Ripoti {report_count}. HALI HATARI. Epuka eneo mara moja.",
                AlertLevel.EMERGENCY: "🆘 DHARURA YA MAFURIKO\n\nHALI YA HATARI {location}. HAMISHA MARA MOJA. Nenda mahali pa juu SASA."
            }
        }
        
        template = templates.get(language, templates['en']).get(
            alert_level,
            templates['en'][AlertLevel.WARNING]
        )
        
        return template.format(
            location=location,
            report_count=incident.report_count
        )
    
    @staticmethod
    def get_affected_users(
        db: Session,
        alert: Alert
    ) -> List[User]:
        """
        Get users who should receive this alert
        Uses geofencing based on alert radius
        """
        # Get incident location (extract from PostGIS)
        # Placeholder coordinates
        lat = -1.2921
        lon = 36.8219
        
        # Find users within affected radius
        users = UserService.get_users_within_radius(
            db,
            lat=lat,
            lon=lon,
            radius_km=alert.affected_radius_km,
            alert_subscribed_only=True
        )
        
        return users
    
    @staticmethod
    def deliver_alert(db: Session, alert_id: str) -> Dict:
        """
        Deliver alert to all affected users
        Multi-channel delivery: WhatsApp → Telegram → SMS
        """
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            raise ValueError("Alert not found")
        
        # Get affected users
        users = AlertService.get_affected_users(db, alert)
        
        # Update recipients count
        alert.recipients_count = len(users)
        
        # Create recipient records
        delivery_stats = {
            'total': len(users),
            'whatsapp': 0,
            'telegram': 0,
            'sms': 0,
            'failed': 0
        }
        
        for user in users:
            # Create recipient record
            recipient = AlertRecipient(
                alert_id=alert_id,
                user_id=user.id,
                delivered=False
            )
            db.add(recipient)
            
            # Get user's preferred language
            language = user.language_code or 'en'
            
            # Regenerate message in user's language
            message = AlertService._generate_alert_message(
                alert.incident,
                alert.severity,
                language
            )
            
            # Try multi-channel delivery
            delivered = False
            
            # Try WhatsApp first
            if user.platform == PlatformType.WHATSAPP:
                from app.bots.whatsapp_api import whatsapp
                success = whatsapp.send_message(user.platform_id, message)
                if success:
                    delivered = True
                    delivery_stats['whatsapp'] += 1
            
            # Try Telegram
            elif user.platform == PlatformType.TELEGRAM:
                from app.bots.telegram_api import telegram
                success = telegram.send_message(user.platform_id, message)
                if success:
                    delivered = True
                    delivery_stats['telegram'] += 1
            
            # Fallback to SMS (if configured)
            if not delivered:
                # TODO: Implement Twilio SMS
                # success = send_sms(user.phone_number, message)
                delivery_stats['failed'] += 1
            
            # Update recipient status
            if delivered:
                recipient.delivered = True
                recipient.delivered_at = datetime.utcnow()
            
        # Update alert status
        if delivery_stats['failed'] == 0:
            alert.delivery_status = AlertDeliveryStatus.SENT
        elif delivery_stats['failed'] < delivery_stats['total']:
            alert.delivery_status = AlertDeliveryStatus.SENT
        else:
            alert.delivery_status = AlertDeliveryStatus.FAILED
        
        alert.sent_at = datetime.utcnow()
        
        db.commit()
        
        return {
            'alert_id': alert_id,
            'status': alert.delivery_status.value,
            'delivery_stats': delivery_stats,
            'recipients': alert.recipients_count
        }
    
    @staticmethod
    def retry_failed_deliveries(db: Session, alert_id: str) -> int:
        """Retry failed alert deliveries"""
        # Get failed recipients
        failed_recipients = db.query(AlertRecipient).filter(
            AlertRecipient.alert_id == alert_id,
            AlertRecipient.delivered == False
        ).all()
        
        retried = 0
        
        for recipient in failed_recipients:
            user = recipient.user
            alert = recipient.alert
            
            # Get user's language
            language = user.language_code or 'en'
            message = AlertService._generate_alert_message(
                alert.incident,
                alert.severity,
                language
            )
            
            # Retry delivery
            delivered = False
            
            if user.platform == PlatformType.WHATSAPP:
                from app.bots.whatsapp_api import whatsapp
                success = whatsapp.send_message(user.platform_id, message)
                delivered = success
            elif user.platform == PlatformType.TELEGRAM:
                from app.bots.telegram_api import telegram
                success = telegram.send_message(user.platform_id, message)
                delivered = success
            
            if delivered:
                recipient.delivered = True
                recipient.delivered_at = datetime.utcnow()
                retried += 1
        
        db.commit()
        return retried
    
    @staticmethod
    def get_alert_by_id(db: Session, alert_id: str) -> Optional[Alert]:
        """Get alert by ID"""
        return db.query(Alert).filter(Alert.id == alert_id).first()
    
    @staticmethod
    def get_alerts_for_incident(db: Session, incident_id: str) -> List[Alert]:
        """Get all alerts for an incident"""
        return db.query(Alert).filter(
            Alert.incident_id == incident_id
        ).order_by(Alert.created_at.desc()).all()
    
    @staticmethod
    def get_recent_alerts(db: Session, limit: int = 50) -> List[Alert]:
        """Get recent alerts"""
        return db.query(Alert).order_by(
            Alert.created_at.desc()
        ).limit(limit).all()
    
    @staticmethod
    def get_user_alerts(db: Session, user_id: str, limit: int = 20) -> List[Alert]:
        """Get alerts received by a user"""
        return db.query(Alert).join(AlertRecipient).filter(
            AlertRecipient.user_id == user_id
        ).order_by(Alert.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def mark_alert_read(db: Session, alert_id: str, user_id: str) -> bool:
        """Mark alert as read by user"""
        recipient = db.query(AlertRecipient).filter(
            AlertRecipient.alert_id == alert_id,
            AlertRecipient.user_id == user_id
        ).first()
        
        if recipient:
            recipient.read = True
            recipient.read_at = datetime.utcnow()
            db.commit()
            return True
        
        return False
