from sqlalchemy.orm import Session
from typing import Dict, Optional, List
from datetime import datetime
from app.models import Report, Verification, VerificationType, VerificationResult, SeverityLevel, VerificationStatus
from app.schemas import AIVerificationResult
from app.ml.flood_detector import flood_detector
from app.integrations.weather import weather_service
from app.services.report_service import ReportService
from app.services.user_service import UserService
from app.config import get_settings

settings = get_settings()


class VerificationService:
    """
    Multi-layer verification system combining:
    - AI image analysis
    - Weather data correlation
    - Historical pattern matching
    - Community verification
    - Duplicate detection
    """
    
    @staticmethod
    def verify_report_automated(db: Session, report_id: str) -> Dict:
        """
        Automated verification combining multiple signals
        
        Returns verification decision and confidence score
        """
        report = ReportService.get_report_by_id(db, report_id)
        if not report:
            return {'error': 'Report not found'}
        
        # Initialize verification scores
        scores = {
            'ai': 0.0,
            'weather': 0.0,
            'duplicate': 0.0,
            'overall': 0.0
        }
        
        # 1. AI Image Analysis (40% weight)
        ai_result = VerificationService._verify_with_ai(db, report)
        scores['ai'] = ai_result['confidence'] if ai_result else 0.0
        
        # 2. Weather Correlation (30% weight)
        weather_result = VerificationService._verify_with_weather(db, report)
        scores['weather'] = weather_result['correlation_confidence'] if weather_result else 0.0
        
        # 3. Duplicate Detection (30% weight)
        duplicate_result = VerificationService._check_duplicates(db, report)
        scores['duplicate'] = duplicate_result['confidence']
        
        # Calculate weighted overall score
        scores['overall'] = (
            scores['ai'] * 0.4 +
            scores['weather'] * 0.3 +
            scores['duplicate'] * 0.3
        )
        
        # Make verification decision
        threshold = settings.VERIFICATION_CONFIDENCE_THRESHOLD
        
        if scores['overall'] >= threshold:
            decision = VerificationStatus.verified
            ReportService.verify_report(db, report_id, scores['overall'])
        elif scores['overall'] >= 0.4:
            # Medium confidence - request community verification
            decision = VerificationStatus.pending
            # TODO: Trigger community verification requests
        else:
            # Low confidence - flag for manual review
            decision = VerificationStatus.flagged
        
        return {
            'report_id': report_id,
            'decision': decision.value,
            'confidence': scores['overall'],
            'scores_breakdown': scores,
            'ai_result': ai_result,
            'weather_result': weather_result,
            'duplicate_result': duplicate_result
        }
    
    @staticmethod
    def _verify_with_ai(db: Session, report: Report) -> Optional[Dict]:
        """Verify report using AI image analysis"""
        if not report.image_urls:
            return None
        
        try:
            # Analyze all images and take average confidence
            results = []
            for image_url in report.image_urls:
                result = flood_detector.analyze_image(image_url)
                results.append(result)
            
            if not results:
                return None
            
            # Average confidence across all images
            avg_confidence = sum(r['confidence'] for r in results) / len(results)
            avg_severity = int(sum(r['severity'] for r in results) / len(results))
            
            # Log verification
            verification = Verification(
                report_id=report.id,
                verification_type=VerificationType.AI,
                result=VerificationResult.CONFIRMED if avg_confidence > 0.5 else VerificationResult.UNCERTAIN,
                confidence_score=avg_confidence,
                notes=f"AI analyzed {len(results)} images. Avg severity: {avg_severity}"
            )
            db.add(verification)
            db.commit()
            
            return {
                'confidence': avg_confidence,
                'detected_severity': avg_severity,
                'images_analyzed': len(results),
                'all_results': results
            }
            
        except Exception as e:
            print(f"AI verification error: {e}")
            return None
    
    @staticmethod
    def _verify_with_weather(db: Session, report: Report) -> Optional[Dict]:
        """Verify report using weather data correlation"""
        try:
            # Extract coordinates from report location
            # For now, using placeholder coordinates
            # In production, extract from PostGIS geography type
            lat = -1.2921  # Placeholder
            lon = 36.8219  # Placeholder
            
            # Get weather correlation
            correlation = weather_service.correlate_with_report(
                lat, lon, report.severity.value
            )
            
            # Log verification
            result = VerificationResult.CONFIRMED if correlation['supports_report'] else VerificationResult.UNCERTAIN
            
            verification = Verification(
                report_id=report.id,
                verification_type=VerificationType.WEATHER,
                result=result,
                confidence_score=correlation['correlation_confidence'],
                notes=f"Weather risk: {correlation['risk_score']:.2f}, Rainfall 24h: {correlation['rainfall_24h']}mm"
            )
            db.add(verification)
            db.commit()
            
            return correlation
            
        except Exception as e:
            print(f"Weather verification error: {e}")
            return None
    
    @staticmethod
    def _check_duplicates(db: Session, report: Report) -> Dict:
        """
        Check for duplicate reports in same area
        
        Multiple nearby reports increase confidence
        """
        # Find nearby reports (within 500m, last 24 hours)
        # Using ReportService's existing duplicate detection
        lat = -1.2921  # Placeholder
        lon = 36.8219  # Placeholder
        
        nearby_reports = ReportService.find_nearby_reports(
            db, lat, lon, radius_km=0.5, time_window_hours=24
        )
        
        # Filter out the current report
        nearby_reports = [r for r in nearby_reports if r.id != report.id]
        
        # Calculate confidence based on nearby verified reports
        verified_nearby = [r for r in nearby_reports if r.verification_status == VerificationStatus.verified]
        
        if len(verified_nearby) >= 3:
            confidence = 0.9  # Very high confidence
        elif len(verified_nearby) >= 2:
            confidence = 0.7  # High confidence
        elif len(verified_nearby) >= 1:
            confidence = 0.5  # Medium confidence
        elif len(nearby_reports) >= 1:
            confidence = 0.3  # Low confidence (unverified nearby)
        else:
            confidence = 0.0  # No nearby reports
        
        return {
            'confidence': confidence,
            'nearby_reports_count': len(nearby_reports),
            'verified_nearby_count': len(verified_nearby),
            'nearby_report_ids': [r.id for r in nearby_reports]
        }
    
    @staticmethod
    def request_community_verification(db: Session, report_id: str, radius_km: float = 5) -> int:
        """
        Request community verification from nearby users
        
        Returns: number of verification requests sent
        """
        report = ReportService.get_report_by_id(db, report_id)
        if not report:
            return 0
        
        # Find nearby users (within radius)
        lat = -1.2921  # Placeholder
        lon = 36.8219  # Placeholder
        
        nearby_users = UserService.get_users_within_radius(
            db, lat, lon, radius_km, alert_subscribed_only=False
        )
        
        # Exclude the report's author
        nearby_users = [u for u in nearby_users if u.id != report.user_id]
        
        # Send verification requests (via bot)
        # TODO: Implement bot notification
        requests_sent = 0
        
        for user in nearby_users[:10]:  # Limit to 10 users
            # Send verification request message
            # message = f"⚠️ Verification needed: Is there flooding at {report.address}?"
            # send_bot_message(user, message)
            requests_sent += 1
        
        return requests_sent
    
    @staticmethod
    def record_community_verification(
        db: Session,
        report_id: str,
        verifier_user_id: str,
        result: str
    ) -> bool:
        """Record a community verification response"""
        verification = Verification(
            report_id=report_id,
            verifier_user_id=verifier_user_id,
            verification_type=VerificationType.COMMUNITY,
            result=VerificationResult.CONFIRMED if result == 'confirmed' else VerificationResult.REJECTED,
            confidence_score=1.0,
            notes=f"Community verification: {result}"
        )
        
        db.add(verification)
        
        # Increment community verification count on report
        report = ReportService.get_report_by_id(db, report_id)
        if report:
            report.community_verifications += 1
            
            # If threshold met, auto-verify
            if report.community_verifications >= 3:
                ReportService.verify_report(db, report_id, 0.8)
            
            db.commit()
            return True
        
        return False
    
    @staticmethod
    def update_user_credibility(db: Session, user_id: str, report_verified: bool):
        """Update user's credibility score based on report verification"""
        if report_verified:
            # Accurate report - increase credibility
            UserService.update_credibility_score(db, user_id, +10)
        else:
            # False report - decrease credibility
            UserService.update_credibility_score(db, user_id, -20)
    
    @staticmethod
    def get_verification_history(db: Session, report_id: str) -> List[Verification]:
        """Get all verifications for a report"""
        return db.query(Verification).filter(
            Verification.report_id == report_id
        ).all()
