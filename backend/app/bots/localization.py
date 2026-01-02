from typing import Dict, Any
import json
import os


class Localization:
    """Multi-language support for bot messages"""
    
    def __init__(self):
        self.translations: Dict[str, Dict[str, str]] = {}
        self.default_language = "en"
        self._load_translations()
    
    def _load_translations(self):
        """Load translation files"""
        # For now, define translations inline
        # In production, load from JSON files in locales/ directory
        self.translations = {
            "en": {
                # Welcome & Language
                "welcome": "🌊 Welcome to Flood Watch! I'll help you report and receive alerts about flooding in your area.",
                "select_language": "Please select your language:\n1️⃣ English\n2️⃣ Swahili (Kiswahili)\n3️⃣ French (Français)\n4️⃣ Spanish (Español)",
                "language_changed": "✅ Language changed to English",
                
                # Commands
                "help_menu": """
📋 *Flood Watch Commands*

/start - Start or restart bot
/report - Report flooding in your area
/alerts - Subscribe to flood alerts
/status - Check flood status near you
/safety - Get safety information
/help - Show this help menu
/language - Change language

💙 Together we can save lives!
""",
                
                # Report flow
                "report.request_location": "📍 Please share your location where flooding is occurring.\n\nYou can:\n• Share your live location\n• Send a pin on the map\n• Type an address",
                "report.request_severity": "⚠️ How severe is the flooding?\n\n1️⃣ Low - Minor water accumulation\n2️⃣ Medium - Water rising, roads affected\n3️⃣ High - Significant flooding, danger to property\n4️⃣ Critical - Life-threatening, immediate evacuation needed\n\nReply with a number (1-4)",
                "report.request_description": "📝 Please describe what you're seeing (optional).\n\nExamples:\n• Water depth\n• Affected areas\n• Number of people affected\n• Road conditions\n\nType 'skip' to skip this step.",
                "report.request_photos": "📸 You can send photos or videos of the flooding (optional).\n\nThis helps us verify the report faster.\n\nType 'done' when finished or 'skip' to skip.",
                "report.confirm_submission": "✅ Report Summary:\n📍 Location: {location}\n⚠️ Severity: {severity}\n📝 Description: {description}\n\nSend 'confirm' to submit or 'cancel' to discard.",
                "report.submitted": "✅ Thank you! Your flood report has been submitted.\n\n🔍 Our team will verify it shortly.\n📢 Nearby users will be alerted if confirmed.\n\nReport ID: {report_id}",
                "report.cancelled": "❌ Report cancelled.",
                "report.invalid_severity": "⚠️ Invalid input. Please reply with a number 1-4.",
                
                # Alert subscription
                "alert.request_location": "📍 Share your location to receive flood alerts for your area.",
                "alert.request_radius": "📏 How far around you should we monitor? (in kilometers)\n\nRecommended: 5-10 km\nMaximum: 20 km\n\nReply with a number.",
                "alert.subscription_confirmed": "✅ Alert subscription activated!\n\n📍 Location: {location}\n📏 Radius: {radius} km\n\nYou'll receive alerts when flooding is reported in your area.",
                "alert.subscription_exists": "✅ You're already subscribed to alerts.\n\nUse /alerts to update your preferences.",
                "alert.invalid_radius": "⚠️ Please enter a valid radius between 1-20 km.",
                
                # Status
                "status.checking": "🔍 Checking flood status in your area...",
                "status.no_reports": "✅ No active flood reports in your area (within {radius} km).\n\nStay safe! 💙",
                "status.active_incidents": """
⚠️ *Active Flood Alerts*

{incidents}

Stay safe and follow local emergency guidance.
""",
                
                # Safety info
                "safety.info": """
🛟 *Flood Safety Guidelines*

*Before Flooding:*
• Know your evacuation routes
• Prepare emergency supplies
• Move valuables to higher ground

*During Flooding:*
• ⚠️ Never walk/drive through flood water
• Move to higher ground immediately
• Follow evacuation orders
• Stay away from power lines

*After Flooding:*
• Wait for all-clear from authorities
• Avoid flood water (contamination risk)
• Document damage for insurance

*Emergency Numbers:*
Police: 999
Ambulance: 999
Disaster Management: +254-20-2729200

💙 Stay safe!
""",
                
                # Errors
                "error.general": "❌ Sorry, something went wrong. Please try again or contact support.",
                "error.location_required": "📍 Location is required. Please share your location.",
                "error.invalid_location": "❌ Invalid location format. Please share a valid location.",
            },
            
            "sw": {  # Swahili
                "welcome": "🌊 Karibu Flood Watch! Nitakusaidia kuripoti na kupokea tahadhari kuhusu mafuriko katika eneo lako.",
                "language_changed": "✅ Lugha imebadilishwa kuwa Kiswahili",
                "help_menu": """
📋 *Amri za Flood Watch*

/start - Anza au anzisha upya
/report - Ripoti mafuriko
/alerts - Jiandikishe kupokea tahadhari
/status - Angalia hali ya mafuriko
/safety - Pata maelekezo ya usalama
/help - Onyesha menyu hii
/language - Badilisha lugha

💙 Pamoja tunaweza kuokoa maisha!
""",
                "report.request_location": "📍 Tafadhali shiriki eneo lako ambapo kuna mafuriko.",
                # Add more Swahili translations...
            }
        }
    
    def get(self, key: str, language: str = "en", **kwargs) -> str:
        """Get translated message"""
        lang = language if language in self.translations else self.default_language
        message = self.translations[lang].get(key, self.translations[self.default_language].get(key, key))
        
        # Format with variables if provided
        if kwargs:
            try:
                message = message.format(**kwargs)
            except KeyError:
                pass  # If formatting fails, return unformatted message
        
        return message
    
    def get_available_languages(self) -> Dict[str, str]:
        """Get list of available languages"""
        return {
            "en": "English",
            "sw": "Kiswahili",
            "fr": "Français",
            "es": "Español",
            "ar": "العربية",
            "hi": "हिन्दी",
            "bn": "বাংলা",
            "pt": "Português"
        }


# Global instance
i18n = Localization()
