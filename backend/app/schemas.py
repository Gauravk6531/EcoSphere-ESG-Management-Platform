import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- Employee / Department ----------

class EmployeeCreate(BaseModel):
    name: str
    email: str
    department_id: Optional[int] = None
    is_department_head: bool = False


class EmployeeOut(ORMBase):
    id: int
    name: str
    email: str
    department_id: Optional[int] = None
    xp_total: int
    points_balance: int
    is_department_head: bool


class DepartmentCreate(BaseModel):
    name: str
    code: Optional[str] = None
    head_id: Optional[int] = None
    parent_department_id: Optional[int] = None
    status: str = "active"


class DepartmentOut(ORMBase):
    id: int
    name: str
    code: Optional[str] = None
    head_id: Optional[int] = None
    parent_department_id: Optional[int] = None
    status: str
    employee_count: int


class CategoryCreate(BaseModel):
    name: str
    type: str  # csr_activity | challenge
    status: str = "active"


class CategoryOut(ORMBase):
    id: int
    name: str
    type: str
    status: str


# ---------- Environmental ----------

class EmissionFactorCreate(BaseModel):
    name: str
    category: Optional[str] = None
    co2e_value: float
    unit: str
    source: Optional[str] = None
    active: bool = True


class EmissionFactorOut(ORMBase):
    id: int
    name: str
    category: Optional[str] = None
    co2e_value: float
    unit: str
    source: Optional[str] = None
    active: bool


class CarbonTransactionCreate(BaseModel):
    source_document_type: str
    source_document_ref: Optional[str] = None
    emission_factor_id: int
    quantity: float
    department_id: int
    date: Optional[datetime.date] = None


class CarbonTransactionOut(ORMBase):
    id: int
    source_document_type: str
    source_document_ref: Optional[str] = None
    emission_factor_id: int
    quantity: float
    co2e_calculated: Optional[float] = None
    department_id: int
    date: Optional[datetime.date] = None


class ProductESGProfileCreate(BaseModel):
    product_name: str
    carbon_footprint: float = 0
    sustainability_rating: Optional[str] = None


class ProductESGProfileOut(ORMBase):
    id: int
    product_name: str
    carbon_footprint: float
    sustainability_rating: Optional[str] = None


class EnvironmentalGoalCreate(BaseModel):
    target_metric: str
    target_value: float
    current_value: float = 0
    deadline: Optional[datetime.date] = None
    department_id: int


class EnvironmentalGoalOut(ORMBase):
    id: int
    target_metric: str
    target_value: float
    current_value: float
    deadline: Optional[datetime.date] = None
    department_id: int
    progress: float


# ---------- Social ----------

class CSRActivityCreate(BaseModel):
    title: str
    category_id: Optional[int] = None
    department_id: Optional[int] = None
    date: Optional[datetime.date] = None
    description: Optional[str] = None
    evidence_required: bool = False


class CSRActivityOut(ORMBase):
    id: int
    title: str
    category_id: Optional[int] = None
    department_id: Optional[int] = None
    date: Optional[datetime.date] = None
    description: Optional[str] = None
    evidence_required: bool


class EmployeeParticipationCreate(BaseModel):
    employee_id: int
    activity_id: int
    proof_url: Optional[str] = None
    completion_date: Optional[datetime.date] = None


class EmployeeParticipationOut(ORMBase):
    id: int
    employee_id: int
    activity_id: int
    proof_url: Optional[str] = None
    approval_status: str
    points_earned: int
    completion_date: Optional[datetime.date] = None


class ParticipationDecision(BaseModel):
    approve: bool
    points_earned: Optional[int] = 0


class TrainingCompletionCreate(BaseModel):
    employee_id: int
    training_name: str
    provider: Optional[str] = None
    due_date: Optional[datetime.date] = None
    completion_date: Optional[datetime.date] = None
    status: str = "assigned"
    score: Optional[float] = None
    certificate_url: Optional[str] = None


class TrainingCompletionOut(ORMBase):
    id: int
    employee_id: int
    training_name: str
    provider: Optional[str] = None
    due_date: Optional[datetime.date] = None
    completion_date: Optional[datetime.date] = None
    status: str
    score: Optional[float] = None
    certificate_url: Optional[str] = None


# ---------- Governance ----------

class ESGPolicyCreate(BaseModel):
    name: str
    document_url: Optional[str] = None
    version: str = "1.0"
    status: str = "active"
    department_ids: List[int] = []


class ESGPolicyOut(ORMBase):
    id: int
    name: str
    document_url: Optional[str] = None
    version: str
    status: str


class PolicyAcknowledgementCreate(BaseModel):
    policy_id: int
    employee_id: int


class PolicyAcknowledgementOut(ORMBase):
    id: int
    policy_id: int
    employee_id: int
    acknowledged_date: Optional[datetime.datetime] = None
    reminder_sent: bool


class AuditCreate(BaseModel):
    title: str
    auditor: Optional[str] = None
    department_id: Optional[int] = None
    date: Optional[datetime.date] = None
    findings_summary: Optional[str] = None


class AuditOut(ORMBase):
    id: int
    title: str
    auditor: Optional[str] = None
    department_id: Optional[int] = None
    date: Optional[datetime.date] = None
    findings_summary: Optional[str] = None


class ComplianceIssueCreate(BaseModel):
    audit_id: Optional[int] = None
    severity: str = "low"
    description: Optional[str] = None
    owner_id: int
    due_date: datetime.date
    status: str = "open"


class ComplianceIssueOut(ORMBase):
    id: int
    audit_id: Optional[int] = None
    severity: str
    description: Optional[str] = None
    owner_id: int
    due_date: datetime.date
    status: str
    is_overdue: bool


# ---------- Gamification ----------

class BadgeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    unlock_metric: str  # xp_total | completed_challenges | csr_participations
    unlock_comparator: str = ">="
    unlock_threshold: float
    icon: Optional[str] = None


class BadgeOut(ORMBase):
    id: int
    name: str
    description: Optional[str] = None
    unlock_metric: str
    unlock_comparator: str
    unlock_threshold: float
    icon: Optional[str] = None


class RewardCreate(BaseModel):
    name: str
    description: Optional[str] = None
    points_required: int
    stock: int = 0
    status: str = "active"


class RewardOut(ORMBase):
    id: int
    name: str
    description: Optional[str] = None
    points_required: int
    stock: int
    status: str


class RewardRedemptionCreate(BaseModel):
    employee_id: int
    reward_id: int


class RewardRedemptionOut(ORMBase):
    id: int
    employee_id: int
    reward_id: int
    points_deducted: int
    date: datetime.datetime


class ChallengeCreate(BaseModel):
    title: str
    category_id: Optional[int] = None
    description: Optional[str] = None
    xp: int = 0
    difficulty: Optional[str] = None
    evidence_required: bool = False
    deadline: Optional[datetime.date] = None
    status: str = "draft"


class ChallengeOut(ORMBase):
    id: int
    title: str
    category_id: Optional[int] = None
    description: Optional[str] = None
    xp: int
    difficulty: Optional[str] = None
    evidence_required: bool
    deadline: Optional[datetime.date] = None
    status: str


class ChallengeStatusUpdate(BaseModel):
    status: str


class ChallengeParticipationCreate(BaseModel):
    challenge_id: int
    employee_id: int
    progress: float = 0
    proof_url: Optional[str] = None


class ChallengeParticipationOut(ORMBase):
    id: int
    challenge_id: int
    employee_id: int
    progress: float
    proof_url: Optional[str] = None
    approval_status: str
    xp_awarded: int


class ChallengeParticipationDecision(BaseModel):
    approve: bool


class EmployeeBadgeOut(ORMBase):
    id: int
    employee_id: int
    badge_id: int
    awarded_date: datetime.datetime


# ---------- Dashboard / Scores ----------

class DepartmentScoreOut(ORMBase):
    id: int
    department_id: int
    environmental_score: float
    social_score: float
    governance_score: float
    total_score: float
    period: datetime.date


# ---------- Notifications ----------

class NotificationOut(ORMBase):
    id: int
    employee_id: Optional[int] = None
    type: str
    message: str
    read: bool
    created_at: datetime.datetime


# ---------- Config ----------

class ESGConfigUpdate(BaseModel):
    auto_emission_calculation: Optional[bool] = None
    evidence_required: Optional[bool] = None
    badge_auto_award: Optional[bool] = None
    weight_environmental: Optional[float] = None
    weight_social: Optional[float] = None
    weight_governance: Optional[float] = None
    notify_compliance_issue: Optional[bool] = None
    notify_approval_decision: Optional[bool] = None
    notify_policy_reminder: Optional[bool] = None
    notify_badge_unlock: Optional[bool] = None


class ESGConfigOut(ORMBase):
    id: int
    auto_emission_calculation: bool
    evidence_required: bool
    badge_auto_award: bool
    weight_environmental: float
    weight_social: float
    weight_governance: float
    notify_compliance_issue: bool
    notify_approval_decision: bool
    notify_policy_reminder: bool
    notify_badge_unlock: bool
