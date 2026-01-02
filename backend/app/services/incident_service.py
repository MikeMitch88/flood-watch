from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional, List, Tuple
from datetime import datetime
from geoalchemy2.functions import ST_GeogFromText, ST_DWithin, ST_Centroid, ST_Union
from app.models import Incident, Report, IncidentReport, IncidentStatus, SeverityLevel, VerificationStatus
from app.schemas import IncidentCreate, IncidentUpdate
from app.services.report_service import ReportService


class IncidentService:
    """Service for managing flood incidents (clustered reports)"""
    
    @staticmethod
    def create_incident(db: Session, incident_data: IncidentCreate) -> Incident:
        """Create a new incident"""
        lat = incident_data.location['lat']
        lon = incident_data.location['lon']
        location_wkt = f'POINT({lon} {lat})'
        
        incident = Incident(
            location=location_wkt,
            severity=incident_data.severity,
            affected_radius_km=incident_data.affected_radius_km,
            report_count=incident_data.report_count
        )
        
        db.add(incident)
        db.commit()
        db.refresh(incident)
        return incident
    
    @staticmethod
    def get_incident_by_id(db: Session, incident_id: str) -> Optional[Incident]:
        """Get incident by ID"""
        return db.query(Incident).filter(Incident.id == incident_id).first()
    
    @staticmethod
    def update_incident(db: Session, incident_id: str, incident_update: IncidentUpdate) -> Optional[Incident]:
        """Update incident"""
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return None
        
        update_data = incident_update.dict(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(incident, key, value)
        
        # If status changed to resolved, set resolved_at
        if 'status' in update_data and update_data['status'] == IncidentStatus.RESOLVED:
            incident.resolved_at = datetime.utcnow()
        
        db.commit()
        db.refresh(incident)
        return incident
    
    @staticmethod
    def add_report_to_incident(db: Session, incident_id: str, report_id: str) -> bool:
        """Link a report to an incident"""
        incident_report = IncidentReport(
            incident_id=incident_id,
            report_id=report_id
        )
        
        try:
            db.add(incident_report)
            
            # Update incident report count
            incident = db.query(Incident).filter(Incident.id == incident_id).first()
            if incident:
                incident.report_count += 1
            
            db.commit()
            return True
        except:
            db.rollback()
            return False
    
    @staticmethod
    def create_incident_from_reports(
        db: Session,
        reports: List[Report],
        clustering_radius_km: float = 0.5
    ) -> Optional[Incident]:
        """Create an incident from clustered reports"""
        if not reports:
            return None
        
        # Calculate centroid of all report locations
        # For simplicity, use the first report's location
        # In production, calculate actual centroid from all locations
        primary_report = reports[0]
        
        # Determine highest severity
        severity_order = {
            SeverityLevel.LOW: 1,
            SeverityLevel.MEDIUM: 2,
            SeverityLevel.HIGH: 3,
            SeverityLevel.CRITICAL: 4
        }
        max_severity = max(reports, key=lambda r: severity_order[r.severity]).severity
        
        # Create incident
        incident_data = IncidentCreate(
            location={"lat": 0, "lon": 0},  # Will be set from WKT
            severity=max_severity,
            affected_radius_km=clustering_radius_km,
            report_count=len(reports)
        )
        
        lat = 0  # Extract from primary_report.location
        lon = 0  # Extract from primary_report.location
        location_wkt = primary_report.location
        
        incident = Incident(
            location=location_wkt,
            severity=max_severity,
            affected_radius_km=clustering_radius_km,
            report_count=len(reports)
        )
        
        db.add(incident)
        db.flush()
        
        # Link all reports to this incident
        for report in reports:
            incident_report = IncidentReport(
                incident_id=incident.id,
                report_id=report.id
            )
            db.add(incident_report)
        
        db.commit()
        db.refresh(incident)
        return incident
    
    @staticmethod
    def find_or_create_incident(
        db: Session,
        report: Report,
        clustering_radius_km: float = 0.5
    ) -> Optional[Incident]:
        """Find existing nearby incident or create new one"""
        # Find nearby verified reports
        nearby_reports = ReportService.find_nearby_reports(
            db,
            lat=0,  # Extract from report.location
            lon=0,  # Extract from report.location
            radius_km=clustering_radius_km,
            time_window_hours=24
        )
        
        if not nearby_reports:
            return None
        
        # Check if any of these reports are already linked to an incident
        for nearby_report in nearby_reports:
            incident_report = db.query(IncidentReport).filter(
                IncidentReport.report_id == nearby_report.id
            ).first()
            
            if incident_report:
                # Add current report to existing incident
                incident = db.query(Incident).filter(
                    Incident.id == incident_report.incident_id
                ).first()
                
                if incident and incident.status == IncidentStatus.ACTIVE:
                    IncidentService.add_report_to_incident(db, incident.id, report.id)
                    return incident
        
        # No existing incident found, create new one
        all_reports = nearby_reports + [report]
        return IncidentService.create_incident_from_reports(db, all_reports, clustering_radius_km)
    
    @staticmethod
    def get_active_incidents(db: Session, limit: int = 100) -> List[Incident]:
        """Get all active incidents"""
        return db.query(Incident).filter(
            Incident.status == IncidentStatus.ACTIVE
        ).order_by(Incident.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def get_incidents_in_bounds(
        db: Session,
        north: float,
        south: float,
        east: float,
        west: float
    ) -> List[Incident]:
        """Get incidents within map bounds (for map view)"""
        # Simplified bounding box query
        # In production, use ST_MakeEnvelope and ST_Intersects
        return db.query(Incident).filter(
            Incident.status.in_([IncidentStatus.ACTIVE, IncidentStatus.MONITORING])
        ).all()
    
    @staticmethod
    def resolve_incident(db: Session, incident_id: str) -> Optional[Incident]:
        """Mark incident as resolved"""
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return None
        
        incident.status = IncidentStatus.RESOLVED
        incident.resolved_at = datetime.utcnow()
        db.commit()
        db.refresh(incident)
        return incident
    
    @staticmethod
    def get_incident_reports(db: Session, incident_id: str) -> List[Report]:
        """Get all reports linked to an incident"""
        incident_reports = db.query(IncidentReport).filter(
            IncidentReport.incident_id == incident_id
        ).all()
        
        report_ids = [ir.report_id for ir in incident_reports]
        return db.query(Report).filter(Report.id.in_(report_ids)).all()
    
    @staticmethod
    def get_incidents_count(db: Session, status: Optional[IncidentStatus] = None) -> int:
        """Get count of incidents"""
        query = db.query(func.count(Incident.id))
        
        if status:
            query = query.filter(Incident.status == status)
        
        return query.scalar()
