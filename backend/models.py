from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from datetime import datetime
from db import Base

class User(Base):
    """Identified purely by deviceId — no password, no email verification for the demo."""
    __tablename__ = "users"

    device_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    language = Column(String, default="en")
    income_type = Column(String, nullable=True)
    # NEW — the missing onboarding fields you flagged
    monthly_income = Column(Float, nullable=True)
    income_frequency = Column(String, nullable=True)   # "monthly" | "weekly" | "irregular" | "seasonal"
    monthly_expenses_estimate = Column(Float, nullable=True)
    existing_emi_total = Column(Float, nullable=True)
    has_emergency_fund = Column(Boolean, nullable=True)
    dependents_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AccessibilitySettings(Base):
    __tablename__ = "accessibility_settings"

    device_id = Column(String, ForeignKey("users.device_id"), primary_key=True)
    large_text = Column(String, default="normal")       # normal | large | extraLarge
    high_contrast = Column(Boolean, default=False)
    screen_reader = Column(Boolean, default=False)
    voice_navigation = Column(Boolean, default=False)
    dyslexia_mode = Column(Boolean, default=False)
    color_blind_mode = Column(Boolean, default=False)
    senior_mode = Column(Boolean, default=False)


class GuardianMemorySnapshot(Base):
    """
    One row per user holding the full GuardianMemoryState as JSON.
    This mirrors your frontend's single-localStorage-blob pattern exactly —
    simplest possible sync, no relational decomposition needed for the demo.
    """
    __tablename__ = "guardian_memory"

    device_id = Column(String, ForeignKey("users.device_id"), primary_key=True)
    persona = Column(JSON, nullable=True)
    financial_twin = Column(JSON, nullable=True)
    guardian_score = Column(Integer, default=0)
    guardian_level = Column(String, default="Protected")
    risk_tolerance = Column(String, default="low")
    top_concerns = Column(JSON, default=list)
    scam_risk_score = Column(Integer, default=12)
    cash_flow_risk = Column(String, default="low")
    recommended_schemes = Column(JSON, default=list)
    future_goal = Column(String, nullable=True)
    trusted_circle = Column(JSON, default=list)
    voice_history = Column(JSON, default=list)
    action_history = Column(JSON, default=list)
    guardian_notifications = Column(JSON, default=list)
    journey = Column(JSON, default=list)
    dismissed_notification_ids = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ScamCheck(Base):
    __tablename__ = "scam_checks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String, ForeignKey("users.device_id"), index=True)
    source_type = Column(String)          # "text" | "image" | "voice"
    input_text = Column(Text)
    scam_score = Column(Integer)
    level = Column(String)                # low | medium | high
    pattern = Column(String, nullable=True)
    reasons = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)


class VoiceTurnLog(Base):
    """Persisted voice conversation turns — backs the frontend's VoiceTurn list."""
    __tablename__ = "voice_turns"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String, ForeignKey("users.device_id"), index=True)
    role = Column(String)                 # "user" | "guardian"
    text = Column(Text)
    suggested_route = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)