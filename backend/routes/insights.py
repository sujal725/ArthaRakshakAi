from fastapi import APIRouter
from llm import ask_llm
from pydantic import BaseModel
from typing import Optional
import json

router = APIRouter()

INSIGHT_SYSTEM_PROMPT = """You are ArthaRakshak's Dashboard Insight Generator.

Given a user's real financial profile, write ONE short, warm, specific insight (max 28 words, one sentence, no markdown) that:
- References at least one real number from their profile (income, savings rate, EMI ratio, or dependents).
- Gives one concrete, actionable nudge.
- Avoids generic phrases like "save more" — be specific to their numbers.

Respond ONLY with JSON: {"insight": "<the sentence>"}
"""

class DashboardInsightRequest(BaseModel):
    device_id: str
    persona_title: str
    income_type: Optional[str] = None
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    existing_emi_total: Optional[float] = None
    has_emergency_fund: Optional[bool] = None
    dependents_count: Optional[int] = None
    language: Optional[str] = "en"

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "mr": "Marathi",
    "ta": "Tamil", "kn": "Kannada", "te": "Telugu", "bn": "Bengali",
}

@router.post("/insights/dashboard")
def dashboard_insight(payload: DashboardInsightRequest):
    profile = payload.dict(exclude={"device_id", "language"}, exclude_none=True)
    lang_name = LANGUAGE_NAMES.get(payload.language, "English")
    prompt = f"User profile: {json.dumps(profile)}\n\nRespond in {lang_name}."
    raw = ask_llm(prompt, system=INSIGHT_SYSTEM_PROMPT, json_mode=True)
    try:
        result = json.loads(raw)
        insight = result.get("insight", "")
    except json.JSONDecodeError:
        insight = ""
    if not insight:
        insight = "Keep building your profile — more data helps your Guardian give sharper advice."
    return {"insight": insight}