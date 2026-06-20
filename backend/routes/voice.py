from fastapi import APIRouter
import json
from llm import ask_llm
from db import SessionLocal, get_db
from models import GuardianMemorySnapshot, User, VoiceTurnLog
from schemas import VoiceTextRequest

router = APIRouter()

VOICE_SYSTEM_PROMPT = """You are ArthaRakshak's Voice Guardian — a warm, proactive financial AI assistant for Indian users with varied income types, literacy levels and languages.

You will be given the user's financial context as JSON, plus their spoken message. Respond ONLY with a JSON object:
{
  "reply": "<plain-language response, 2-3 sentences max, no jargon>",
  "speak_text": "<same response but optimized for text-to-speech — shorter, natural spoken rhythm>",
  "suggested_route": "<one of: /scam-shield, /future-self, /financial-calendar, /government-schemes, /trusted-circle, or null>",
  "action": "<short label describing what was understood, e.g. 'loan_inquiry', 'scam_check', 'scheme_lookup', 'general'>"
}

Respond in the user's stated language if it is not English. Keep tone warm and reassuring — many users are anxious about money or unfamiliar with financial concepts.
If the message mentions a scam, OTP, suspicious link or fraud — strongly suggest /scam-shield.
If it mentions a loan, EMI, or big purchase — suggest /future-self.
If it mentions government schemes, yojana, pension — suggest /government-schemes.
If it mentions family, trust, or "what should I do" — suggest /trusted-circle.
"""

@router.post("/voice/reply")
def voice_reply(payload: VoiceTextRequest):
    db = SessionLocal()

    # Pull real Guardian context — this is what makes the agent feel "aware"
    snap = db.query(GuardianMemorySnapshot).filter(
        GuardianMemorySnapshot.device_id == payload.device_id
    ).first()
    user = db.query(User).filter(User.device_id == payload.device_id).first()

    context = {
        "language": payload.language,
        "persona": snap.persona if snap else None,
        "financial_twin": snap.financial_twin if snap else None,
        "income_type": user.income_type if user else None,
        "monthly_income": user.monthly_income if user else None,
        "scam_risk_score": snap.scam_risk_score if snap else None,
        "cash_flow_risk": snap.cash_flow_risk if snap else None,
        "future_goal": snap.future_goal if snap else None,
        "trusted_circle_size": len(snap.trusted_circle) if snap and snap.trusted_circle else 0,
    }

    prompt = f"User context: {json.dumps(context)}\n\nUser said: \"{payload.text}\""
    raw = ask_llm(prompt, system=VOICE_SYSTEM_PROMPT, json_mode=True)

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        result = {
            "reply": "I'm here to help. Could you tell me a bit more?",
            "speak_text": "I'm here to help. Could you tell me a bit more?",
            "suggested_route": None,
            "action": "general",
        }

    # Persist both turns — backs the frontend's voiceHistory list
    db.add(VoiceTurnLog(device_id=payload.device_id, role="user", text=payload.text))
    db.add(VoiceTurnLog(
        device_id=payload.device_id, role="guardian",
        text=result.get("reply", ""), suggested_route=result.get("suggested_route"),
    ))
    db.commit()
    db.close()

    return result

@router.get("/voice/history/{device_id}")
def voice_history(device_id: str):
    db = SessionLocal()
    turns = db.query(VoiceTurnLog).filter(
        VoiceTurnLog.device_id == device_id
    ).order_by(VoiceTurnLog.created_at.asc()).limit(50).all()
    db.close()
    return [{
        "id": f"v_{t.id}", "ts": t.created_at.timestamp() * 1000,
        "role": t.role, "text": t.text, "suggestedRoute": t.suggested_route,
    } for t in turns]