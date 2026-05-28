import os
import africastalking
from typing import List, Dict, Any

class AfricasTalkingService:
    def __init__(self):
        self.username = os.getenv("AFRICAS_TALKING_USERNAME", "sandbox")
        self.api_key = os.getenv("AFRICAS_TALKING_API_KEY", "")
        
        # Initialize the SDK
        if self.api_key:
            africastalking.initialize(self.username, self.api_key)
            self.sms = africastalking.SMS
        else:
            self.sms = None
            print("Africa's Talking API Key not found. Running in mock mode.")
            
    def send_sms(self, phone_numbers: List[str], message: str) -> Dict[str, Any]:
        """
        Send SMS to a list of phone numbers using Africa's Talking.
        Phone numbers should be in E.164 format (e.g. +254700000000).
        """
        if not self.sms:
            print(f"[MOCK SMS] To: {phone_numbers} | Msg: {message}")
            return {
                "success": True,
                "recipients_count": len(phone_numbers),
                "mocked": True
            }
            
        try:
            # The SDK expects a list of phone numbers and the message string
            response = self.sms.send(message, phone_numbers)
            
            # The response usually looks like:
            # {'SMSMessageData': {'Message': 'Sent to 1/1 Total Cost: KES 0.8000', 'Recipients': [{'statusCode': 101, 'number': '+2547...', 'status': 'Success', 'cost': 'KES 0.8000', 'messageId': 'ATXid_...'}]}}
            
            message_data = response.get('SMSMessageData', {})
            recipients = message_data.get('Recipients', [])
            
            success_count = sum(1 for r in recipients if r.get('statusCode') in [100, 101, 102])
            
            print(f"AT SMS Response: {response}")
            
            return {
                "success": True,
                "recipients_count": success_count,
                "total_requested": len(phone_numbers),
                "raw_response": response
            }
            
        except Exception as e:
            print(f"Error sending SMS via Africa's Talking: {e}")
            return {
                "success": False,
                "error": str(e),
                "recipients_count": 0
            }

africas_talking_service = AfricasTalkingService()
