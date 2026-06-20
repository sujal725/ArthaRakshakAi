from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# ---------- Onboarding / User ----------

class OnboardingPayload(BaseModel):
    device_id: str
    name: Optional[str] = None
    language: Optional[str] = "en"
    income_type: Optional[str] = None
    monthly_income: Optional[float] = None
    income_frequency: Optional[str] = None
    monthly_expenses_estimate: Optional[float] = None
    existing_emi_total: Optional[float] = None
    has_emergency_fund: Optional[bool] = None
    dependents_count: Optional[int] = None

class AccessibilityPayload(BaseModel):
    device_id: str
    large_text: Optional[str] = "normal"
    high_contrast: Optional[bool] = False
    screen_reader: Optional[bool] = False
    voice_navigation: Optional[bool] = False
    dyslexia_mode: Optional[bool] = False
    color_blind_mode: Optional[bool] = False
    senior_mode: Optional[bool] = False

# ---------- Guardian Memory sync ----------

class MemorySyncPayload(BaseModel):
    device_id: str
    state: Dict[str, Any]   # whole GuardianMemoryState blob, frontend shape unchanged

# ---------- Scam Shield ----------

class ScamTextRequest(BaseModel):
    device_id: str
    message: str

class ScamVerdictResponse(BaseModel):
    score: int
    level: str
    reasons: List[str]
    recommendations: List[str]
    pattern: Optional[str] = None

# ---------- Voice Agent ----------

class VoiceTextRequest(BaseModel):
    device_id: str
    text: str
    language: Optional[str] = "en"

class VoiceReplyResponse(BaseModel):
    reply: str
    speak_text: str
    suggested_route: Optional[str] = None
    action: Optional[str] = None