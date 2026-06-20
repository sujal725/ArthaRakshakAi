from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from models import User, GuardianMemorySnapshot
from schemas import MemorySyncPayload, OnboardingPayload, AccessibilityPayload
import models as m

router = APIRouter()

def _ensure_user(db: Session, device_id: str) -> User:
    user = db.query(User).filter(User.device_id == device_id).first()
    if not user:
        user = User(device_id=device_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.post("/onboarding")
def save_onboarding(payload: OnboardingPayload, db: Session = Depends(get_db)):
    user = _ensure_user(db, payload.device_id)
    for field, value in payload.dict(exclude_unset=True, exclude={"device_id"}).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return {"status": "saved", "user": {
        "device_id": user.device_id,
        "income_type": user.income_type,
        "monthly_income": user.monthly_income,
        "income_frequency": user.income_frequency,
        "monthly_expenses_estimate": user.monthly_expenses_estimate,
        "existing_emi_total": user.existing_emi_total,
        "has_emergency_fund": user.has_emergency_fund,
        "dependents_count": user.dependents_count,
    }}

@router.get("/onboarding/{device_id}")
def get_onboarding(device_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.device_id == device_id).first()
    if not user:
        return {"exists": False}
    return {
        "exists": True,
        "income_type": user.income_type,
        "monthly_income": user.monthly_income,
        "income_frequency": user.income_frequency,
        "monthly_expenses_estimate": user.monthly_expenses_estimate,
        "existing_emi_total": user.existing_emi_total,
        "has_emergency_fund": user.has_emergency_fund,
        "dependents_count": user.dependents_count,
    }

@router.put("/accessibility")
def save_accessibility(payload: AccessibilityPayload, db: Session = Depends(get_db)):
    _ensure_user(db, payload.device_id)
    settings = db.query(m.AccessibilitySettings).filter(
        m.AccessibilitySettings.device_id == payload.device_id
    ).first()
    if not settings:
        settings = m.AccessibilitySettings(device_id=payload.device_id)
        db.add(settings)
    for field, value in payload.dict(exclude_unset=True, exclude={"device_id"}).items():
        setattr(settings, field, value)
    db.commit()
    return {"status": "saved"}

@router.put("/memory")
def sync_memory(payload: MemorySyncPayload, db: Session = Depends(get_db)):
    """
    Full-state sync — frontend calls this (debounced) every time GuardianMemory's
    apply() reducer updates state. We overwrite the whole JSON blob, matching the
    frontend's own localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) pattern.
    """
    _ensure_user(db, payload.device_id)
    snap = db.query(GuardianMemorySnapshot).filter(
        GuardianMemorySnapshot.device_id == payload.device_id
    ).first()
    if not snap:
        snap = GuardianMemorySnapshot(device_id=payload.device_id)
        db.add(snap)

    state = payload.state
    snap.persona = state.get("persona")
    snap.financial_twin = state.get("financialTwin")
    snap.guardian_score = state.get("guardianScore", 0)
    snap.guardian_level = state.get("guardianLevel", "Protected")
    snap.risk_tolerance = state.get("riskTolerance", "low")
    snap.top_concerns = state.get("topConcerns", [])
    snap.scam_risk_score = state.get("scamRiskScore", 12)
    snap.cash_flow_risk = state.get("cashFlowRisk", "low")
    snap.recommended_schemes = state.get("recommendedSchemes", [])
    snap.future_goal = state.get("futureGoal")
    snap.trusted_circle = state.get("trustedCircle", [])
    snap.voice_history = state.get("voiceHistory", [])
    snap.action_history = state.get("actionHistory", [])
    snap.guardian_notifications = state.get("guardianNotifications", [])
    snap.journey = state.get("journey", [])
    snap.dismissed_notification_ids = state.get("dismissedNotificationIds", [])

    db.commit()
    return {"status": "synced"}

@router.get("/memory/{device_id}")
def get_memory(device_id: str, db: Session = Depends(get_db)):
    """
    Frontend calls this once on app load (in GuardianMemoryProvider's hydrate effect)
    to restore state from backend if localStorage is empty — e.g. new device, cleared cache.
    """
    snap = db.query(GuardianMemorySnapshot).filter(
        GuardianMemorySnapshot.device_id == device_id
    ).first()
    if not snap:
        return {"exists": False}
    return {
        "exists": True,
        "persona": snap.persona,
        "financialTwin": snap.financial_twin,
        "guardianScore": snap.guardian_score,
        "guardianLevel": snap.guardian_level,
        "riskTolerance": snap.risk_tolerance,
        "topConcerns": snap.top_concerns,
        "scamRiskScore": snap.scam_risk_score,
        "cashFlowRisk": snap.cash_flow_risk,
        "recommendedSchemes": snap.recommended_schemes,
        "futureGoal": snap.future_goal,
        "trustedCircle": snap.trusted_circle,
        "voiceHistory": snap.voice_history,
        "actionHistory": snap.action_history,
        "guardianNotifications": snap.guardian_notifications,
        "journey": snap.journey,
        "dismissedNotificationIds": snap.dismissed_notification_ids,
    }