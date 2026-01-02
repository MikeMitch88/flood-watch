from enum import Enum
from typing import Dict, Callable, Optional
from dataclasses import dataclass


class ConversationState(str, Enum):
    """Conversation states for bot interaction"""
    IDLE = "idle"
    
    # Report flow
    REPORT_STARTED = "report_started"
    AWAITING_LOCATION = "awaiting_location"
    AWAITING_SEVERITY = "awaiting_severity"
    AWAITING_DESCRIPTION = "awaiting_description"
    AWAITING_PHOTOS = "awaiting_photos"
    AWAITING_CONFIRMATION = "awaiting_confirmation"
    
    # Alert subscription flow
    ALERT_SETUP = "alert_setup"
    AWAITING_ALERT_LOCATION = "awaiting_alert_location"
    AWAITING_ALERT_RADIUS = "awaiting_alert_radius"
    
    # Language selection
    SELECTING_LANGUAGE = "selecting_language"


@dataclass
class FlowStep:
    """Represents a step in the conversation flow"""
    state: ConversationState
    prompt_key: str  # Key for localized prompt message
    next_state: Optional[ConversationState] = None
    validator: Optional[Callable] = None
    optional: bool = False


class ConversationFlow:
    """Manages conversation flow logic"""
    
    # Report submission flow
    REPORT_FLOW = [
        FlowStep(
            state=ConversationState.REPORT_STARTED,
            prompt_key="report.request_location",
            next_state=ConversationState.AWAITING_LOCATION
        ),
        FlowStep(
            state=ConversationState.AWAITING_LOCATION,
            prompt_key="report.request_severity",
            next_state=ConversationState.AWAITING_SEVERITY
        ),
        FlowStep(
            state=ConversationState.AWAITING_SEVERITY,
            prompt_key="report.request_description",
            next_state=ConversationState.AWAITING_DESCRIPTION
        ),
        FlowStep(
            state=ConversationState.AWAITING_DESCRIPTION,
            prompt_key="report.request_photos",
            next_state=ConversationState.AWAITING_PHOTOS,
            optional=True
        ),
        FlowStep(
            state=ConversationState.AWAITING_PHOTOS,
            prompt_key="report.confirm_submission",
            next_state=ConversationState.AWAITING_CONFIRMATION,
            optional=True
        ),
        FlowStep(
            state=ConversationState.AWAITING_CONFIRMATION,
            prompt_key="report.submitted",
            next_state=ConversationState.IDLE
        )
    ]
    
    # Alert subscription flow
    ALERT_FLOW = [
        FlowStep(
            state=ConversationState.ALERT_SETUP,
            prompt_key="alert.request_location",
            next_state=ConversationState.AWAITING_ALERT_LOCATION
        ),
        FlowStep(
            state=ConversationState.AWAITING_ALERT_LOCATION,
            prompt_key="alert.request_radius",
            next_state=ConversationState.AWAITING_ALERT_RADIUS
        ),
        FlowStep(
            state=ConversationState.AWAITING_ALERT_RADIUS,
            prompt_key="alert.subscription_confirmed",
            next_state=ConversationState.IDLE
        )
    ]
    
    @staticmethod
    def get_next_state(current_state: ConversationState, flow_type: str = "report") -> Optional[ConversationState]:
        """Get next state in the flow"""
        flow = ConversationFlow.REPORT_FLOW if flow_type == "report" else ConversationFlow.ALERT_FLOW
        
        for i, step in enumerate(flow):
            if step.state == current_state:
                return step.next_state
        
        return None
    
    @staticmethod
    def get_step(state: ConversationState, flow_type: str = "report") -> Optional[FlowStep]:
        """Get flow step by state"""
        flow = ConversationFlow.REPORT_FLOW if flow_type == "report" else ConversationFlow.ALERT_FLOW
        
        for step in flow:
            if step.state == state:
                return step
        
        return None
    
    @staticmethod
    def is_valid_severity(severity: str) -> bool:
        """Validate severity input"""
        valid_severities = ["low", "medium", "high", "critical", "1", "2", "3", "4"]
        return severity.lower() in valid_severities
    
    @staticmethod
    def normalize_severity(severity: str) -> str:
        """Convert user input to severity level"""
        severity_map = {
            "1": "low",
            "low": "low",
            "2": "medium",
            "medium": "medium",
            "3": "high",
            "high": "high",
            "4": "critical",
            "critical": "critical"
        }
        return severity_map.get(severity.lower(), "medium")
    
    @staticmethod
    def is_valid_radius(radius: str) -> bool:
        """Validate alert radius input"""
        try:
            r = int(radius)
            return 1 <= r <= 20  # 1-20 km
        except ValueError:
            return False
