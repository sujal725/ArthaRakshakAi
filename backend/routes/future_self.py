from fastapi import APIRouter
from llm import ask_llm
from schemas import FutureSelfAdviceRequest

router = APIRouter()

ADVICE_SYSTEM_PROMPT = """You are ArthaRakshak's Future Self Advisor — an AI that helps Indian users compare taking a loan now versus delaying it and investing instead (or projects an investment's growth).

You will receive the user's scenario numbers as JSON. Write a short, warm, plain-language advice paragraph (3-5 sentences, no markdown, no headers, no bullet points) that:
- States clearly which option works out better financially and roughly by how much, using the rupee figures given.
- If monthly_income is present and this is a loan scenario, comments on whether the EMI looks manageable relative to income.
- Ends with one concrete, practical next step the user can take this week.
Keep the tone encouraging and simple — avoid financial jargon.
"""

@router.post("/future-self/advice")
def future_self_advice(payload: FutureSelfAdviceRequest):
    context = payload.dict(exclude={"device_id"}, exclude_none=True)
    prompt = f"Scenario data: {context}"
    advice = ask_llm(prompt, system=ADVICE_SYSTEM_PROMPT)
    return {"advice": advice.strip()}