from fastapi import APIRouter
import json
from llm import ask_llm
from schemas import SchemeMatchRequest

router = APIRouter()

SCHEME_MATCH_SYSTEM_PROMPT = """You are ArthaRakshak's Government Scheme Matcher.

You will receive a user's profile and a list of candidate government schemes (each with id, name, eligibility text, and tags).
For EACH candidate scheme, score how well it matches the user's profile from 0-100, and give a one-sentence reason.

Respond ONLY with a JSON object in this exact shape:
{
  "results": [
    {"id": "<scheme id exactly as given>", "match": <integer 0-100>, "reason": "<one sentence, specific to this user>"}
  ]
}

Scoring guide:
- 90-100: scheme's tags/eligibility directly match the user's income type or stated category
- 60-89: plausible secondary fit (e.g. general-purpose insurance/pension schemes)
- Below 60: weak or no real fit — but only include schemes from the candidate list given, do not invent new ones or drop any.

Be honest and varied in scoring — do not give every scheme the same score. Base it on genuine eligibility match, not enthusiasm.
"""

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "mr": "Marathi",
    "ta": "Tamil", "kn": "Kannada", "te": "Telugu", "bn": "Bengali",
}

@router.post("/schemes/match")
def match_schemes(payload: SchemeMatchRequest):
    candidates_text = json.dumps([
        {"id": s.id, "name": s.name, "eligibility": s.eligibility, "tags": s.tags}
        for s in payload.candidates
    ])
    profile_text = json.dumps({
        "income_type": payload.income_type,
        "category": payload.category,
        "concerns": payload.concerns,
    })
    lang_name = LANGUAGE_NAMES.get(payload.language, "English")
    prompt = f"User profile: {profile_text}\n\nCandidate schemes: {candidates_text}\n\nWrite the 'reason' field in {lang_name}."

    raw = ask_llm(prompt, system=SCHEME_MATCH_SYSTEM_PROMPT, json_mode=True)
    try:
        result = json.loads(raw)
        results = result.get("results", [])
    except json.JSONDecodeError:
        results = []

    # Defensive fallback: if the LLM dropped a scheme or returned nothing usable,
    # fill in a deterministic score so the frontend never breaks.
    returned_ids = {r.get("id") for r in results}
    for s in payload.candidates:
        if s.id not in returned_ids:
            results.append({"id": s.id, "match": 55, "reason": "General eligibility — verify specific criteria on the official site."})

    return {"results": results}