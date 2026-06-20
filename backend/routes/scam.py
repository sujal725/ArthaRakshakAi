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
  "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"],
  "recommendations": ["<action 1>", "<action 2>", "<action 3>"]
}

Score guide: 0-34 = low, 35-64 = medium, 65-100 = high.
Watch specifically for: OTP/PIN/CVV requests, urgency language, fake KYC updates, lottery/prize scams,
fake refund/cashback messages, shortened suspicious links, courier/customs scams, fake bank calls.
Always return exactly 3 reasons and 3 recommendations, even for safe messages.
"""

def _analyze(text: str) -> dict:
    raw = ask_llm(text, system=SCAM_SYSTEM_PROMPT, json_mode=True)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "score": 50, "level": "medium", "pattern": None,
            "reasons": ["Could not fully analyze this message", "Treat with caution", "Verify with the sender directly"],
            "recommendations": ["Do not share OTP or personal details", "Verify via official channels", "When in doubt, don't click"],
        }

def _log(db, device_id, source_type, input_text, result):
    db.add(ScamCheck(
        device_id=device_id, source_type=source_type, input_text=input_text,
        scam_score=result.get("score", 0), level=result.get("level", "low"),
        pattern=result.get("pattern"), reasons=result.get("reasons", []),
        recommendations=result.get("recommendations", []),
    ))
    db.commit()

@router.post("/scam/analyze-text")
def analyze_text(device_id: str = Form(...), message: str = Form(...)):
    result = _analyze(message)
    db = SessionLocal()
    if not db.query(User).filter(User.device_id == device_id).first():
        db.add(User(device_id=device_id))
        db.commit()
    _log(db, device_id, "text", message, result)
    db.close()
    return result

@router.post("/scam/analyze-image")
def analyze_image(device_id: str = Form(...), file: UploadFile = File(...)):
    image = Image.open(file.file)
    extracted = pytesseract.image_to_string(image).strip()

    if not extracted:
        return {
            "score": 0, "level": "low", "pattern": None,
            "reasons": ["No readable text found in the image"] * 1 + ["Try a clearer screenshot", "Or paste the message text directly"],
            "recommendations": ["Upload a clearer image", "Or use the text input instead"],
            "extracted_text": "",
        }

    result = _analyze(extracted)
    result["extracted_text"] = extracted

    db = SessionLocal()
    if not db.query(User).filter(User.device_id == device_id).first():
        db.add(User(device_id=device_id))
        db.commit()
    _log(db, device_id, "image", extracted, result)
    db.close()
    return result