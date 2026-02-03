from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.bots.session_manager import SessionManager
from app.bots.conversation_flow import ConversationState, ConversationFlow
from app.bots.localization import i18n
from app.services.user_service import UserService
from app.services.report_service import ReportService
from app.services.incident_service import IncidentService
from app.models import PlatformType, SeverityLevel
from app.integrations.geocoding import geocoding


class CommandHandler:
    """Handle bot commands and conversation flow"""
    
    def __init__(self, db: Session):
        self.db = db
        self.session_manager = SessionManager()
    
    def handle_command(
        self,
        command: str,
        user_id: str,
        platform: PlatformType,
        message_data: Dict[str, Any]
    ) -> str:
        """Route command to appropriate handler"""
        try:
            # Get user's language preference
            user = UserService.get_user_by_platform_id(self.db, platform, user_id)
            language = user.language_code if user else "en"
            
            handlers = {
                '/start': self.handle_start,
                '/help': self.handle_help,
                '/report': self.handle_report,
                '/alerts': self.handle_alerts,
                '/status': self.handle_status,
                '/safety': self.handle_safety,
                '/language': self.handle_language,
            }
            
            handler = handlers.get(command.lower())
            if handler:
                return handler(user_id, platform, language, message_data)
            
            return i18n.get("help_menu", language)
        except Exception as e:
            print(f"Error in handle_command: {e}")
            import traceback
            traceback.print_exc()
            return "Sorry, an error occurred. Please try again."
    
    def handle_start(self, user_id: str, platform: PlatformType, language: str, message_data: Dict) -> str:
        """Handle /start command"""
        # Create or update user
        user = UserService.get_user_by_platform_id(self.db, platform, user_id)
        
        if not user:
            # Extract phone number if available (WhatsApp provides this)
            phone_number = message_data.get('phone_number', f'platform_{user_id}')
            
            from app.schemas import UserCreate
            user_data = UserCreate(
                phone_number=phone_number,
                platform=platform,
                platform_id=user_id,
                language_code=language
            )
            user = UserService.create_user(self.db, user_data)
        
        # Clear any existing session (with error handling)
        try:
            self.session_manager.clear_session(user_id, platform.value)
        except Exception as e:
            print(f"Warning: Could not clear session: {e}")
        
        return i18n.get("welcome", language)
    
    def handle_help(self, user_id: str, platform: PlatformType, language: str, message_data: Dict) -> str:
        """Handle /help command"""
        return i18n.get("help_menu", language)
    
    def handle_report(self, user_id: str, platform: PlatformType, language: str, message_data: Dict) -> str:
        """Handle /report command - start report flow"""
        # Initialize report session
        self.session_manager.set_session(user_id, platform.value, {
            'state': ConversationState.AWAITING_LOCATION.value,
            'temp_data': {}
        })
        
        return i18n.get("report.request_location", language)
    
    def handle_alerts(self, user_id: str, platform: PlatformType, language: str, message_data: Dict) -> str:
        """Handle /alerts command - setup alert subscription"""
        user = UserService.get_user_by_platform_id(self.db, platform, user_id)
        
        if user and user.alert_subscribed and user.location:
            # User already has alerts set up
            return i18n.get("alert.subscription_exists", language)
        
        # Start alert setup flow
        self.session_manager.set_session(user_id, platform.value, {
            'state': ConversationState.AWAITING_ALERT_LOCATION.value,
            'temp_data': {}
        })
        
        return i18n.get("alert.request_location", language)
    
    def handle_status(self, user_id: str, platform: PlatformType, language: str, message_data: Dict) -> str:
        """Handle /status command - check flood status in area"""
        user = UserService.get_user_by_platform_id(self.db, platform, user_id)
        
        if not user or not user.location:
            return i18n.get("error.location_required", language)
        
        # Get user's coordinates (would need to extract from PostGIS geography type)
        # For now, return a placeholder
        radius = user.alert_radius_km or 5
        
        # Check for nearby incidents
        incidents = IncidentService.get_active_incidents(self.db, limit=10)
        
        if not incidents:
            return i18n.get("status.no_reports", language, radius=radius)
        
        # Format incidents
        incident_text = ""
        for inc in incidents:
            incident_text += f"⚠️ {inc.severity.value.upper()} severity - {inc.report_count} reports\n"
        
        return i18n.get("status.active_incidents", language, incidents=incident_text)
    
    def handle_safety(self, user_id: str, platform: PlatformType, language: str, message_data: Dict) -> str:
        """Handle /safety command - provide safety information"""
        return i18n.get("safety.info", language)
    
    def handle_language(self, user_id: str, platform: PlatformType, language: str, message_data: Dict) -> str:
        """Handle /language command - change language"""
        self.session_manager.set_session(user_id, platform.value, {
            'state': ConversationState.SELECTING_LANGUAGE.value,
            'temp_data': {}
        })
        
        return i18n.get("select_language", language)
    
    def handle_message(
        self,
        user_id: str,
        platform: PlatformType,
        message_text: Optional[str],
        location: Optional[Dict],
        media_urls: list,
        message_data: Dict
    ) -> str:
        """Handle regular message based on conversation state"""
        # Get current state
        state = self.session_manager.get_state(user_id, platform.value)
        
        print(f"DEBUG: Current state for user {user_id}: {state}")
        
        if not state:
            state = ConversationState.IDLE.value
            print(f"DEBUG: No state found, defaulting to IDLE")
        
        # Get user's language
        user = UserService.get_user_by_platform_id(self.db, platform, user_id)
        language = user.language_code if user else "en"
        
        print(f"DEBUG: Routing message based on state: {state}")
        
        # Route to appropriate handler based on state
        if state == ConversationState.AWAITING_LOCATION.value:
            print(f"DEBUG: Calling _handle_location_input")
            return self._handle_location_input(user_id, platform, language, location, message_text)
        
        elif state == ConversationState.AWAITING_SEVERITY.value:
            return self._handle_severity_input(user_id, platform, language, message_text)
        
        elif state == ConversationState.AWAITING_DESCRIPTION.value:
            return self._handle_description_input(user_id, platform, language, message_text)
        
        elif state == ConversationState.AWAITING_PHOTOS.value:
            return self._handle_photos_input(user_id, platform, language, media_urls, message_text)
        
        elif state == ConversationState.AWAITING_CONFIRMATION.value:
            return self._handle_confirmation(user_id, platform, language, message_text)
        
        elif state == ConversationState.AWAITING_ALERT_LOCATION.value:
            return self._handle_alert_location(user_id, platform, language, location, message_text)
        
        elif state == ConversationState.AWAITING_ALERT_RADIUS.value:
            return self._handle_alert_radius(user_id, platform, language, message_text)
        
        elif state == ConversationState.SELECTING_LANGUAGE.value:
            return self._handle_language_selection(user_id, platform, language, message_text)
        
        # Default: show help
        return i18n.get("help_menu", language)
    
    def _handle_location_input(self, user_id: str, platform: PlatformType, language: str, location: Optional[Dict], message_text: Optional[str]) -> str:
        """Handle location input during report flow"""
        from app.utils.location_parser import extract_location
        
        coords = None
        address = None
        
        # First, try native Telegram location
        if location:
            coords = geocoding.parse_location(location)
            if coords:
                lat, lon = coords
                address = geocoding.reverse_geocode(lat, lon)
        
        # If no native location, try parsing text (Google Maps links, coordinates, or address)
        elif message_text:
            coords = extract_location(message_text)
            if coords:
                lat, lon = coords
                # Try to get address name
                address = geocoding.reverse_geocode(lat, lon) or message_text
        
        # If we got coordinates, proceed
        if coords:
            lat, lon = coords
            
            # Store location in session
            self.session_manager.store_temp_data(user_id, platform.value, 'location', {'lat': lat, 'lon': lon})
            self.session_manager.store_temp_data(user_id, platform.value, 'address', address)
            
            # Move to next state
            self.session_manager.set_state(user_id, platform.value, ConversationState.AWAITING_SEVERITY.value)
            
            return i18n.get("report.request_severity", language)
        
        # No valid location found
        return i18n.get("error.invalid_location", language)
    
    def _handle_severity_input(self, user_id: str, platform: PlatformType, language: str, message_text: str) -> str:
        """Handle severity input"""
        if not ConversationFlow.is_valid_severity(message_text):
            return i18n.get("report.invalid_severity", language)
        
        severity = ConversationFlow.normalize_severity(message_text)
        self.session_manager.store_temp_data(user_id, platform.value, 'severity', severity)
        
        # Move to description
        self.session_manager.set_state(user_id, platform.value, ConversationState.AWAITING_DESCRIPTION.value)
        
        return i18n.get("report.request_description", language)
    
    def _handle_description_input(self, user_id: str, platform: PlatformType, language: str, message_text: str) -> str:
        """Handle description input"""
        if message_text.lower() != 'skip':
            self.session_manager.store_temp_data(user_id, platform.value, 'description', message_text)
        
        # Move to photos
        self.session_manager.set_state(user_id, platform.value, ConversationState.AWAITING_PHOTOS.value)
        
        return i18n.get("report.request_photos", language)
    
    def _handle_photos_input(self, user_id: str, platform: PlatformType, language: str, media_urls: list, message_text: Optional[str]) -> str:
        """Handle photo/video uploads"""
        if media_urls:
            existing_images = self.session_manager.get_temp_data(user_id, platform.value, 'image_urls') or []
            existing_images.extend(media_urls)
            self.session_manager.store_temp_data(user_id, platform.value, 'image_urls', existing_images)
            
            return "📸 Photo received. Send more or type 'done' to continue."
        
        if message_text and message_text.lower() in ['done', 'skip']:
            # Get all stored data
            location = self.session_manager.get_temp_data(user_id, platform.value, 'location')
            address = self.session_manager.get_temp_data(user_id, platform.value, 'address')
            severity = self.session_manager.get_temp_data(user_id, platform.value, 'severity')
            description = self.session_manager.get_temp_data(user_id, platform.value, 'description') or "No description provided"
            
            # Move to confirmation
            self.session_manager.set_state(user_id, platform.value, ConversationState.AWAITING_CONFIRMATION.value)
            
            return i18n.get("report.confirm_submission", language,
                          location=address,
                          severity=severity.upper(),
                          description=description)
        
        return "Send photos/videos or type 'done' to continue."
    
    def _handle_confirmation(self, user_id: str, platform: PlatformType, language: str, message_text: str) -> str:
        """Handle report confirmation"""
        if message_text.lower() == 'confirm':
            # Create the report
            user = UserService.get_user_by_platform_id(self.db, platform, user_id)
            
            location = self.session_manager.get_temp_data(user_id, platform.value, 'location')
            address = self.session_manager.get_temp_data(user_id, platform.value, 'address')
            severity = self.session_manager.get_temp_data(user_id, platform.value, 'severity')
            description = self.session_manager.get_temp_data(user_id, platform.value, 'description')
            image_urls = self.session_manager.get_temp_data(user_id, platform.value, 'image_urls') or []
            
            from app.schemas import ReportCreate
            report_data = ReportCreate(
                user_id=user.id,
                location=location,
                address=address,
                severity=SeverityLevel(severity),
                description=description,
                image_urls=image_urls,
                video_urls=[]
            )
            
            report = ReportService.create_report(self.db, report_data)
            
            # Clear session
            self.session_manager.clear_session(user_id, platform.value)
            
            return i18n.get("report.submitted", language, report_id=report.id[:8])
        
        elif message_text.lower() == 'cancel':
            self.session_manager.clear_session(user_id, platform.value)
            return i18n.get("report.cancelled", language)
        
        return "Please send 'confirm' to submit or 'cancel' to discard."
    
    def _handle_alert_location(self, user_id: str, platform: PlatformType, language: str, location: Optional[Dict], message_text: Optional[str]) -> str:
        """Handle alert location setup"""
        from app.utils.location_parser import extract_location
        
        coords = None
        address = None
        
        # First, try native Telegram location
        if location:
            coords = geocoding.parse_location(location)
            if coords:
                lat, lon = coords
                address = geocoding.reverse_geocode(lat, lon)
        
        # If no native location, try parsing text (Google Maps links, coordinates, or address)
        elif message_text:
            coords = extract_location(message_text)
            if coords:
                lat, lon = coords
                # Try to get address name
                address = geocoding.reverse_geocode(lat, lon) or message_text
        
        # If we got coordinates, proceed
        if coords:
            lat, lon = coords
            
            # Store location in session
            self.session_manager.store_temp_data(user_id, platform.value, 'location', {'lat': lat, 'lon': lon})
            self.session_manager.set_state(user_id, platform.value, ConversationState.AWAITING_ALERT_RADIUS.value)
            
            return i18n.get("alert.request_radius", language)
        
        # No valid location found
        return i18n.get("error.invalid_location", language)
    
    def _handle_alert_radius(self, user_id: str, platform: PlatformType, language: str, message_text: str) -> str:
        """Handle alert radius setup"""
        if not ConversationFlow.is_valid_radius(message_text):
            return i18n.get("alert.invalid_radius", language)
        
        radius = int(message_text)
        location = self.session_manager.get_temp_data(user_id, platform.value, 'location')
        
        # Update user with alert preferences
        user = UserService.get_user_by_platform_id(self.db, platform, user_id)
        
        from app.schemas import UserUpdate
        UserService.update_user(self.db, user.id, UserUpdate(
            location=location,
            alert_subscribed=True,
            alert_radius_km=radius
        ))
        
        # Clear session
        self.session_manager.clear_session(user_id, platform.value)
        
        address = geocoding.reverse_geocode(location['lat'], location['lon'])
        return i18n.get("alert.subscription_confirmed", language, location=address, radius=radius)
    
    def _handle_language_selection(self, user_id: str, platform: PlatformType, language: str, message_text: str) -> str:
        """Handle language selection"""
        lang_map = {
            "1": "en",
            "2": "sw",
            "3": "fr",
            "4": "es"
        }
        
        new_lang = lang_map.get(message_text, "en")
        
        # Update user language
        user = UserService.get_user_by_platform_id(self.db, platform, user_id)
        if user:
            from app.schemas import UserUpdate
            UserService.update_user(self.db, user.id, UserUpdate(language_code=new_lang))
        
        # Clear session
        self.session_manager.clear_session(user_id, platform.value)
        
        return i18n.get("language_changed", new_lang)
