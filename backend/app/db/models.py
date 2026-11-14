"""SQLAlchemy Relational Models for ASTRA.

Implements the conceptual data model from PRD Section 12.4 with exact field names,
plus browser_id for anonymous student session isolation.
"""

from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Mission(Base):
    __tablename__ = "missions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    browser_id = Column(String(64), nullable=False, index=True)
    label = Column(String(100), nullable=False, default="Lunar Outpost Alpha")
    difficulty_mode = Column(String(20), nullable=False)  # EXPLORER / COMMANDER
    seed = Column(String(64), nullable=False)
    status = Column(String(20), nullable=False, default="IN_PROGRESS")  # IN_PROGRESS / COMPLETED / FAILED
    current_day = Column(Integer, nullable=False, default=1)
    failure_reason = Column(Text, nullable=True)
    total_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    crew_members = relationship("CrewMember", back_populates="mission", cascade="all, delete-orphan")
    snapshots = relationship(
        "DailySnapshot",
        back_populates="mission",
        order_by="DailySnapshot.day_number",
        cascade="all, delete-orphan",
    )
    events = relationship(
        "MissionEvent",
        back_populates="mission",
        order_by="MissionEvent.day_number",
        cascade="all, delete-orphan",
    )
    score_breakdown = relationship(
        "ScoreBreakdown",
        back_populates="mission",
        uselist=False,
        cascade="all, delete-orphan",
    )


class CrewMember(Base):
    __tablename__ = "crew_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mission_id = Column(String(36), ForeignKey("missions.id", ondelete="CASCADE"), nullable=False, index=True)
    astronaut_id = Column(String(20), nullable=False)  # crew_1..crew_4
    astronaut_name = Column(String(100), nullable=False)
    role_title = Column(String(100), nullable=False)
    health = Column(Float, nullable=False, default=100.0)
    stress = Column(Float, nullable=False, default=15.0)
    cumulative_radiation = Column(Float, nullable=False, default=0.0)
    survival_status = Column(String(20), nullable=False, default="ALIVE")  # ALIVE / CRITICAL / DECEASED

    mission = relationship("Mission", back_populates="crew_members")


class DailySnapshot(Base):
    __tablename__ = "daily_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mission_id = Column(String(36), ForeignKey("missions.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    oxygen_level = Column(Float, nullable=False)
    water_level = Column(Float, nullable=False)
    energy_generated = Column(Float, nullable=False)
    battery_level = Column(Float, nullable=False)
    food_level = Column(Float, nullable=False)
    greenhouse_progress = Column(Integer, nullable=False, default=0)
    radiation_daily_dose = Column(Float, nullable=False, default=0.0)
    submitted_allocations_summary = Column(Text, nullable=True)  # JSON text
    educational_feedback_keys = Column(Text, nullable=True)  # JSON list
    state_checksum = Column(String(32), nullable=False, default="")
    created_at = Column(DateTime, default=utc_now)

    __table_args__ = (UniqueConstraint("mission_id", "day_number", name="uq_mission_day"),)
    mission = relationship("Mission", back_populates="snapshots")


class MissionEvent(Base):
    __tablename__ = "mission_events"

    id = Column(String(64), primary_key=True)
    mission_id = Column(String(36), ForeignKey("missions.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    event_type = Column(String(30), nullable=False)  # ENVIRONMENTAL / EQUIPMENT_FAILURE
    event_code = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)  # MINOR / MODERATE / SEVERE
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    affected_systems = Column(Text, nullable=False)  # JSON list
    requires_decision = Column(Boolean, nullable=False, default=False)
    options_json = Column(Text, nullable=True)  # JSON list of options
    resolution_status = Column(String(20), nullable=False, default="RESOLVED")  # PENDING / RESOLVED
    chosen_option_code = Column(String(50), nullable=True)
    outcome_summary = Column(Text, nullable=True)

    mission = relationship("Mission", back_populates="events")


class ScoreBreakdown(Base):
    __tablename__ = "score_breakdowns"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mission_id = Column(
        String(36),
        ForeignKey("missions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    crew_survival_score = Column(Float, nullable=False, default=0.0)
    duration_score = Column(Float, nullable=False, default=0.0)
    resource_stewardship_score = Column(Float, nullable=False, default=0.0)
    radiation_safety_score = Column(Float, nullable=False, default=0.0)
    decision_quality_score = Column(Float, nullable=False, default=0.0)
    difficulty_multiplier_applied = Column(Float, nullable=False, default=1.0)
    total_score = Column(Float, nullable=False, default=0.0)

    mission = relationship("Mission", back_populates="score_breakdown")
