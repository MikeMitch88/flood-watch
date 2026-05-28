import os
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel
import google.generativeai as genai
from app.config import get_settings

settings = get_settings()

class NLPVerificationResult(BaseModel):
    is_flood_related: bool
    confidence: float
    severity: int  # 1 to 4
    extracted_features: Dict[str, Any]
    reasoning: str

class NLPVerifier:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.enabled = bool(self.api_key and self.api_key != "your_gemini_api_key_here")
        
        if self.enabled:
            genai.configure(api_key=self.api_key)
            # Use gemini-1.5-flash as it's fast and suitable for text analysis
            self.model = genai.GenerativeModel('gemini-1.5-flash')

    def analyze_description(self, description: str) -> Optional[Dict[str, Any]]:
        """
        Analyze the text description of a flood report.
        Returns a dictionary with flood relevance, confidence, and severity.
        """
        if not description or len(description.strip()) < 5:
            return self._low_confidence_fallback("Description too short or empty")

        if not self.enabled:
            return self._mock_analysis(description)

        prompt = f"""
You are an expert AI disaster response analyst evaluating citizen reports for flood monitoring.
Analyze the following citizen report description and extract key information.

Report Description: "{description}"

Provide your assessment in the following strict JSON format, with no markdown formatting or extra text:
{{
    "is_flood_related": bool, // true if the text clearly describes a flood, water rising, heavy rain impact, etc.
    "confidence": float, // 0.0 to 1.0 indicating how confident you are in this assessment
    "severity": int, // 1 (Low/Advisory), 2 (Medium/Watch), 3 (High/Warning), 4 (Critical/Emergency). Default to 1 if uncertain.
    "extracted_features": {{
        "keywords_found": [string], // e.g., ["swept away", "waist deep", "submerged"]
        "mentions_infrastructure_damage": bool,
        "mentions_life_threat": bool
    }},
    "reasoning": string // Brief 1-2 sentence explanation of your severity and confidence rating
}}
"""
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up markdown if the model mistakenly included it
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
                
            result_dict = json.loads(response_text)
            
            # Ensure severity is bounded
            result_dict['severity'] = max(1, min(4, result_dict.get('severity', 1)))
            return result_dict
            
        except Exception as e:
            print(f"Error calling Gemini API for NLP Verification: {e}")
            return self._mock_analysis(description)

    def _mock_analysis(self, description: str) -> Dict[str, Any]:
        """Fallback mock analyzer when API key is missing or call fails."""
        desc_lower = description.lower()
        is_flood = any(word in desc_lower for word in ["flood", "water", "rain", "river", "submerged", "swept"])
        
        severity = 1
        if any(word in desc_lower for word in ["swept", "drowning", "trapped", "critical", "emergency"]):
            severity = 4
        elif any(word in desc_lower for word in ["house", "road blocked", "submerged"]):
            severity = 3
        elif any(word in desc_lower for word in ["knee deep", "rising", "heavy rain"]):
            severity = 2
            
        return {
            "is_flood_related": is_flood,
            "confidence": 0.6 if is_flood else 0.3,
            "severity": severity,
            "extracted_features": {
                "keywords_found": ["mocked"],
                "mentions_infrastructure_damage": "road" in desc_lower or "house" in desc_lower,
                "mentions_life_threat": severity == 4
            },
            "reasoning": "Mocked analysis based on basic keyword matching."
        }

    def _low_confidence_fallback(self, reason: str) -> Dict[str, Any]:
        return {
            "is_flood_related": False,
            "confidence": 0.0,
            "severity": 1,
            "extracted_features": {},
            "reasoning": reason
        }

nlp_verifier = NLPVerifier()
