import enum
import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey,
    Enum, Text, Table
)
from sqlalchemy.orm import relationship
from .database import Base


# ---------- Enums ----------

class CategoryType(str, enum.Enum):
    csr_activity = "csr_activity"
    challenge = "challenge"


class ApprovalStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"


class ChallengeStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    under_review = "under_review"
    completed = "completed"
    archived = "archived"


class Severity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ComplianceStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class RewardStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"


# ---------- Association tables ----------

policy_department = Table(
    "policy_department",
    Base.metadata,
    Column("policy_id", ForeignKey("esg_policy.id"), primary_key=True),
    Column("department_id", ForeignKey("department.id"), primary_key=True),
)


# ---------- Core / master data ----------

class Employee(Base):
    __tablename__ = "employee"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    department_id = Column(Integer, ForeignKey("department.id"))
    xp_total = Column(Integer, default=0)
    points_balance = Column(Integer, default=0)
    is_department_head = Column(Boolean, default=False)

    department = relationship("Department", back_populates="employees", foreign_keys=[department_id])


class Department(Base):
    __tablename__ = "department"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    code = Column(String(30), unique=True)
    head_id = Column(Integer, ForeignKey("employee.id"))
    parent_department_id = Column(Integer, ForeignKey("department.id"))
    status = Column(String(20), default="active")

    employees = relationship("Employee", back_populates="department", foreign_keys=[Employee.department_id])
    head = relationship("Employee", foreign_keys=[head_id])

    @property
    def employee_count(self):
        return len(self.employees) if self.employees else 0


class Category(Base):
    __tablename__ = "category"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    type = Column(Enum(CategoryType), nullable=False)
    status = Column(String(20), default="active")


class EmissionFactor(Base):
    __tablename__ = "emission_factor"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    category = Column(String(80))
    co2e_value = Column(Float, nullable=False)
    unit = Column(String(30), nullable=False)
    source = Column(String(120))
    active = Column(Boolean, default=True)


class ProductESGProfile(Base):
    __tablename__ = "product_esg_profile"
    id = Column(Integer, primary_key=True)
    product_name = Column(String(120), nullable=False)
    carbon_footprint = Column(Float, default=0)
    sustainability_rating = Column(String(10))


class EnvironmentalGoal(Base):
    __tablename__ = "environmental_goal"
    id = Column(Integer, primary_key=True)
    target_metric = Column(String(120), nullable=False)
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0)
    deadline = Column(Date)
    department_id = Column(Integer, ForeignKey("department.id"))

    department = relationship("Department")

    @property
    def progress(self):
        if not self.target_value:
            return 0
        return round(min(100, (self.current_value / self.target_value) * 100), 2)


class ESGPolicy(Base):
    __tablename__ = "esg_policy"
    id = Column(Integer, primary_key=True)
    name = Column(String(160), nullable=False)
    document_url = Column(String(255))
    version = Column(String(20), default="1.0")
    status = Column(String(20), default="active")

    departments = relationship("Department", secondary=policy_department)


class Badge(Base):
    __tablename__ = "badge"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    description = Column(Text)
    # unlock_rule: JSON-like text e.g. {"metric": "xp_total", "comparator": ">=", "threshold": 500}
    unlock_metric = Column(String(60), nullable=False)  # xp_total | completed_challenges | csr_participations
    unlock_comparator = Column(String(5), default=">=")
    unlock_threshold = Column(Float, nullable=False)
    icon = Column(String(255))


class EmployeeBadge(Base):
    __tablename__ = "employee_badge"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employee.id"))
    badge_id = Column(Integer, ForeignKey("badge.id"))
    awarded_date = Column(DateTime, default=datetime.datetime.utcnow)

    employee = relationship("Employee")
    badge = relationship("Badge")


class Reward(Base):
    __tablename__ = "reward"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    description = Column(Text)
    points_required = Column(Integer, nullable=False)
    stock = Column(Integer, default=0)
    status = Column(Enum(RewardStatus), default=RewardStatus.active)


# ---------- Transactional data ----------

class CarbonTransaction(Base):
    __tablename__ = "carbon_transaction"
    id = Column(Integer, primary_key=True)
    source_document_type = Column(String(60))  # purchase/manufacturing/expense/fleet
    source_document_ref = Column(String(120))
    emission_factor_id = Column(Integer, ForeignKey("emission_factor.id"))
    quantity = Column(Float, nullable=False)
    co2e_calculated = Column(Float)
    department_id = Column(Integer, ForeignKey("department.id"))
    date = Column(Date, default=datetime.date.today)

    emission_factor = relationship("EmissionFactor")
    department = relationship("Department")


class CSRActivity(Base):
    __tablename__ = "csr_activity"
    id = Column(Integer, primary_key=True)
    title = Column(String(160), nullable=False)
    category_id = Column(Integer, ForeignKey("category.id"))
    department_id = Column(Integer, ForeignKey("department.id"))
    date = Column(Date)
    description = Column(Text)
    evidence_required = Column(Boolean, default=False)

    category = relationship("Category")
    department = relationship("Department")


class EmployeeParticipation(Base):
    __tablename__ = "employee_participation"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employee.id"))
    activity_id = Column(Integer, ForeignKey("csr_activity.id"))
    proof_url = Column(String(255))
    approval_status = Column(Enum(ApprovalStatus), default=ApprovalStatus.draft)
    points_earned = Column(Integer, default=0)
    completion_date = Column(Date)

    employee = relationship("Employee")
    activity = relationship("CSRActivity")


class TrainingCompletion(Base):
    __tablename__ = "training_completion"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employee.id"))
    training_name = Column(String(160), nullable=False)
    provider = Column(String(120))
    due_date = Column(Date)
    completion_date = Column(Date)
    status = Column(String(30), default="assigned")
    score = Column(Float)
    certificate_url = Column(String(255))

    employee = relationship("Employee")


class Challenge(Base):
    __tablename__ = "challenge"
    id = Column(Integer, primary_key=True)
    title = Column(String(160), nullable=False)
    category_id = Column(Integer, ForeignKey("category.id"))
    description = Column(Text)
    xp = Column(Integer, default=0)
    difficulty = Column(String(20))
    evidence_required = Column(Boolean, default=False)
    deadline = Column(Date)
    status = Column(Enum(ChallengeStatus), default=ChallengeStatus.draft)

    category = relationship("Category")


class ChallengeParticipation(Base):
    __tablename__ = "challenge_participation"
    id = Column(Integer, primary_key=True)
    challenge_id = Column(Integer, ForeignKey("challenge.id"))
    employee_id = Column(Integer, ForeignKey("employee.id"))
    progress = Column(Float, default=0)
    proof_url = Column(String(255))
    approval_status = Column(Enum(ApprovalStatus), default=ApprovalStatus.draft)
    xp_awarded = Column(Integer, default=0)

    challenge = relationship("Challenge")
    employee = relationship("Employee")


class PolicyAcknowledgement(Base):
    __tablename__ = "policy_acknowledgement"
    id = Column(Integer, primary_key=True)
    policy_id = Column(Integer, ForeignKey("esg_policy.id"))
    employee_id = Column(Integer, ForeignKey("employee.id"))
    acknowledged_date = Column(DateTime)
    reminder_sent = Column(Boolean, default=False)

    policy = relationship("ESGPolicy")
    employee = relationship("Employee")


class Audit(Base):
    __tablename__ = "audit"
    id = Column(Integer, primary_key=True)
    title = Column(String(160), nullable=False)
    auditor = Column(String(120))
    department_id = Column(Integer, ForeignKey("department.id"))
    date = Column(Date)
    findings_summary = Column(Text)

    department = relationship("Department")


class ComplianceIssue(Base):
    __tablename__ = "compliance_issue"
    id = Column(Integer, primary_key=True)
    audit_id = Column(Integer, ForeignKey("audit.id"))
    severity = Column(Enum(Severity), default=Severity.low)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey("employee.id"), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(Enum(ComplianceStatus), default=ComplianceStatus.open)

    audit = relationship("Audit")
    owner = relationship("Employee")

    @property
    def is_overdue(self):
        if self.status in (ComplianceStatus.resolved, ComplianceStatus.closed):
            return False
        return self.due_date is not None and self.due_date < datetime.date.today()


class DepartmentScore(Base):
    __tablename__ = "department_score"
    id = Column(Integer, primary_key=True)
    department_id = Column(Integer, ForeignKey("department.id"))
    environmental_score = Column(Float, default=0)
    social_score = Column(Float, default=0)
    governance_score = Column(Float, default=0)
    total_score = Column(Float, default=0)
    period = Column(Date, default=datetime.date.today)

    department = relationship("Department")


class RewardRedemption(Base):
    __tablename__ = "reward_redemption"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employee.id"))
    reward_id = Column(Integer, ForeignKey("reward.id"))
    points_deducted = Column(Integer)
    date = Column(DateTime, default=datetime.datetime.utcnow)

    employee = relationship("Employee")
    reward = relationship("Reward")


class Notification(Base):
    __tablename__ = "notification"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employee.id"), nullable=True)  # null = broadcast/admin
    type = Column(String(60))
    message = Column(Text)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    employee = relationship("Employee")


class ESGConfig(Base):
    """Singleton settings row (id=1)."""
    __tablename__ = "esg_config"
    id = Column(Integer, primary_key=True)
    auto_emission_calculation = Column(Boolean, default=False)
    evidence_required = Column(Boolean, default=True)
    badge_auto_award = Column(Boolean, default=True)
    weight_environmental = Column(Float, default=40.0)
    weight_social = Column(Float, default=30.0)
    weight_governance = Column(Float, default=30.0)
    notify_compliance_issue = Column(Boolean, default=True)
    notify_approval_decision = Column(Boolean, default=True)
    notify_policy_reminder = Column(Boolean, default=True)
    notify_badge_unlock = Column(Boolean, default=True)
