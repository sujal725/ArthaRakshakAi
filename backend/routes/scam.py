from fastapi import APIRouter, UploadFile, File, Form
from PIL import Image
import pytesseract
import json
from llm import ask_llm
from db import SessionLocal
from models import ScamCheck, User

router = APIRouter()

SCAM_SYSTEM_PROMPT = """You are ArthaRakshak's fraud detection engine, built for Indian users — including gig workers, farmers, and people with low digital literacy.

Analyze the message and respond ONLY with a JSON object in this exact shape:
{
  "score": <integer 0-100>,
  "level": "<low|medium|high>",
  "pattern": "<short scam pattern name, or null if safe>",
  "reasons": [
    {"explanation": "<plain-language reason 1>", "evidence": "<exact short phrase from the message that supports this, or null>"},
    {"explanation": "<plain-language reason 2>", "evidence": "<exact short phrase from the message that supports this, or null>"},
    {"explanation": "<plain-language reason 3>", "evidence": "<exact short phrase from the message that supports this, or null>"}
  ],
  "recommendations": ["<action 1>", "<action 2>", "<action 3>"]
}

Score guide: 0-34 = low, 35-64 = medium, 65-100 = high.
Watch specifically for: OTP/PIN/CVV requests, urgency language, fake KYC updates, lottery/prize scams,
fake refund/cashback messages, shortened suspicious links, courier/customs scams, fake bank calls,
impersonation of banks/government, requests to install remote-access apps, unrealistic returns on investment.

The "evidence" field must be an exact substring copied from the message text — never invent text that isn't there.
If a reason isn't tied to a specific phrase (e.g. general pattern-matching), set evidence to null.
Always return exactly 3 reasons and 3 recommendations, even for safe messages.
"""

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "mr": "Marathi",
    "ta": "Tamil", "kn": "Kannada", "te": "Telugu", "bn": "Bengali",
}

def _analyze(text: str, language: str = "en") -> dict:
    lang_name = LANGUAGE_NAMES.get(language, "English")
    contextual_prompt = f"{text}\n\n(Respond with 'explanation' and 'recommendations' text in {lang_name}. Keep 'evidence' as the exact original-language substring from the message.)"
    raw = ask_llm(contextual_prompt, system=SCAM_SYSTEM_PROMPT, json_mode=True)
    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        result = {
            "score": 50, "level": "medium", "pattern": None,
            "reasons": [
                {"explanation": "The system had trouble fully analyzing this message", "evidence": None},
                {"explanation": "Treat with caution until verified", "evidence": None},
                {"explanation": "Verify directly with the sender through an official channel", "evidence": None},
            ],
            "recommendations": ["Do not share OTP or personal details", "Verify via official channels", "When in doubt, don't click"],
        }

    # Defensive normalisation: if the LLM still returns plain strings for reasons
    # (older format), wrap them so the frontend always gets the same shape.
    normalized_reasons = []
    for r in result.get("reasons", []):
        if isinstance(r, str):
            normalized_reasons.append({"explanation": r, "evidence": None})
        elif isinstance(r, dict):
            normalized_reasons.append({
                "explanation": r.get("explanation", ""),
                "evidence": r.get("evidence"),
            })
    result["reasons"] = normalized_reasons
    return result

def _log(db, device_id, source_type, input_text, result):
    db.add(ScamCheck(
        device_id=device_id, source_type=source_type, input_text=input_text,
        scam_score=result.get("score", 0), level=result.get("level", "low"),
        pattern=result.get("pattern"), reasons=result.get("reasons", []),
        recommendations=result.get("recommendations", []),
    ))
    db.commit()

@router.post("/scam/analyze-text")
def analyze_text(device_id: str = Form(...), message: str = Form(...), language: str = Form("en")):
    result = _analyze(message, language)
    db = SessionLocal()
    if not db.query(User).filter(User.device_id == device_id).first():
        db.add(User(device_id=device_id))
        db.commit()
    _log(db, device_id, "text", message, result)
    db.close()
    return result

@router.post("/scam/analyze-image")
def analyze_image(device_id: str = Form(...), file: UploadFile = File(...), language: str = Form("en")):
    image = Image.open(file.file)
    extracted = pytesseract.image_to_string(image).strip()

    if not extracted:
        return {
            "score": None,
            "level": None,
            "pattern": None,
            "reasons": [],
            "recommendations": [],
            "extracted_text": "",
        }

    result = _analyze(extracted, language)
    result["extracted_text"] = extracted

    # Validate evidence is actually present in the extracted text — drop any
    # hallucinated evidence so the frontend never highlights non-existent phrases.
    for reason in result.get("reasons", []):
        ev = reason.get("evidence")
        if ev and ev.lower() not in extracted.lower():
            reason["evidence"] = None

    db = SessionLocal()
    if not db.query(User).filter(User.device_id == device_id).first():
        db.add(User(device_id=device_id))
        db.commit()
    _log(db, device_id, "image", extracted, result)
    db.close()
    return result