const mongoose = require("mongoose");

const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true, sparse: true },
  head_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  parent_department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  status: { type: String, default: "active" },
}, schemaOptions);

DepartmentSchema.virtual("employee_count", {
  ref: "Employee",
  localField: "_id",
  foreignField: "department_id",
  count: true,
});

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  xp_total: { type: Number, default: 0 },
  points_balance: { type: Number, default: 0 },
  is_department_head: { type: Boolean, default: false },
}, schemaOptions);

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["csr_activity", "challenge"], required: true },
  status: { type: String, default: "active" },
}, schemaOptions);

const EmissionFactorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  co2e_value: { type: Number, required: true },
  unit: { type: String, required: true },
  source: String,
  active: { type: Boolean, default: true },
}, schemaOptions);

const ProductESGProfileSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  carbon_footprint: { type: Number, default: 0 },
  sustainability_rating: String,
}, schemaOptions);

const EnvironmentalGoalSchema = new mongoose.Schema({
  target_metric: { type: String, required: true },
  target_value: { type: Number, required: true },
  current_value: { type: Number, default: 0 },
  deadline: Date,
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
}, schemaOptions);

EnvironmentalGoalSchema.virtual("progress").get(function progress() {
  if (!this.target_value) return 0;
  return Math.round(Math.min(100, (this.current_value / this.target_value) * 100) * 100) / 100;
});

const CarbonTransactionSchema = new mongoose.Schema({
  source_document_type: String,
  source_document_ref: String,
  emission_factor_id: { type: mongoose.Schema.Types.ObjectId, ref: "EmissionFactor" },
  quantity: { type: Number, required: true },
  co2e_calculated: Number,
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  date: { type: Date, default: Date.now },
}, schemaOptions);

const CSRActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  date: Date,
  description: String,
  evidence_required: { type: Boolean, default: false },
}, schemaOptions);

const EmployeeParticipationSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "CSRActivity", required: true },
  proof_url: String,
  approval_status: { type: String, enum: ["draft", "submitted", "approved", "rejected"], default: "draft" },
  points_earned: { type: Number, default: 0 },
  completion_date: Date,
}, schemaOptions);

const TrainingCompletionSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  training_name: { type: String, required: true },
  provider: String,
  due_date: Date,
  completion_date: Date,
  status: { type: String, enum: ["assigned", "in_progress", "completed", "overdue"], default: "assigned" },
  score: Number,
  certificate_url: String,
}, schemaOptions);

const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  unlock_metric: { type: String, enum: ["xp_total", "completed_challenges", "csr_participations"], required: true },
  unlock_comparator: { type: String, default: ">=" },
  unlock_threshold: { type: Number, required: true },
  icon: String,
}, schemaOptions);

const EmployeeBadgeSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  badge_id: { type: mongoose.Schema.Types.ObjectId, ref: "Badge", required: true },
  awarded_date: { type: Date, default: Date.now },
}, schemaOptions);

EmployeeBadgeSchema.index({ employee_id: 1, badge_id: 1 }, { unique: true });

const RewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  points_required: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, schemaOptions);

const RewardRedemptionSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  reward_id: { type: mongoose.Schema.Types.ObjectId, ref: "Reward", required: true },
  points_deducted: Number,
  date: { type: Date, default: Date.now },
}, schemaOptions);

const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  description: String,
  xp: { type: Number, default: 0 },
  difficulty: String,
  evidence_required: { type: Boolean, default: false },
  deadline: Date,
  status: { type: String, enum: ["draft", "active", "under_review", "completed", "archived"], default: "draft" },
}, schemaOptions);

const ChallengeParticipationSchema = new mongoose.Schema({
  challenge_id: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  progress: { type: Number, default: 0 },
  proof_url: String,
  approval_status: { type: String, enum: ["draft", "submitted", "approved", "rejected"], default: "draft" },
  xp_awarded: { type: Number, default: 0 },
}, schemaOptions);

const ESGPolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  document_url: String,
  version: { type: String, default: "1.0" },
  status: { type: String, default: "active" },
  department_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
}, schemaOptions);

const PolicyAcknowledgementSchema = new mongoose.Schema({
  policy_id: { type: mongoose.Schema.Types.ObjectId, ref: "ESGPolicy", required: true },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  acknowledged_date: Date,
  reminder_sent: { type: Boolean, default: false },
}, schemaOptions);

const AuditSchema = new mongoose.Schema({
  title: { type: String, required: true },
  auditor: String,
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  date: Date,
  findings_summary: String,
}, schemaOptions);

const ComplianceIssueSchema = new mongoose.Schema({
  audit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Audit" },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
  description: String,
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  due_date: { type: Date, required: true },
  status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
}, schemaOptions);

ComplianceIssueSchema.virtual("is_overdue").get(function isOverdue() {
  return !["resolved", "closed"].includes(this.status) && this.due_date && this.due_date < new Date();
});

const DepartmentScoreSchema = new mongoose.Schema({
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  environmental_score: { type: Number, default: 0 },
  social_score: { type: Number, default: 0 },
  governance_score: { type: Number, default: 0 },
  total_score: { type: Number, default: 0 },
  period: { type: Date, default: Date.now },
}, schemaOptions);

const NotificationSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  type: String,
  message: String,
  read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
}, schemaOptions);

const ESGConfigSchema = new mongoose.Schema({
  singleton: { type: String, default: "main", unique: true },
  auto_emission_calculation: { type: Boolean, default: false },
  evidence_required: { type: Boolean, default: true },
  badge_auto_award: { type: Boolean, default: true },
  weight_environmental: { type: Number, default: 40 },
  weight_social: { type: Number, default: 30 },
  weight_governance: { type: Number, default: 30 },
  notify_compliance_issue: { type: Boolean, default: true },
  notify_approval_decision: { type: Boolean, default: true },
  notify_policy_reminder: { type: Boolean, default: true },
  notify_badge_unlock: { type: Boolean, default: true },
}, schemaOptions);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, default: "member" },
}, schemaOptions);

module.exports = {
  Employee: mongoose.model("Employee", EmployeeSchema),
  Department: mongoose.model("Department", DepartmentSchema),
  Category: mongoose.model("Category", CategorySchema),
  EmissionFactor: mongoose.model("EmissionFactor", EmissionFactorSchema),
  ProductESGProfile: mongoose.model("ProductESGProfile", ProductESGProfileSchema),
  EnvironmentalGoal: mongoose.model("EnvironmentalGoal", EnvironmentalGoalSchema),
  CarbonTransaction: mongoose.model("CarbonTransaction", CarbonTransactionSchema),
  CSRActivity: mongoose.model("CSRActivity", CSRActivitySchema),
  EmployeeParticipation: mongoose.model("EmployeeParticipation", EmployeeParticipationSchema),
  TrainingCompletion: mongoose.model("TrainingCompletion", TrainingCompletionSchema),
  Badge: mongoose.model("Badge", BadgeSchema),
  EmployeeBadge: mongoose.model("EmployeeBadge", EmployeeBadgeSchema),
  Reward: mongoose.model("Reward", RewardSchema),
  RewardRedemption: mongoose.model("RewardRedemption", RewardRedemptionSchema),
  Challenge: mongoose.model("Challenge", ChallengeSchema),
  ChallengeParticipation: mongoose.model("ChallengeParticipation", ChallengeParticipationSchema),
  ESGPolicy: mongoose.model("ESGPolicy", ESGPolicySchema),
  PolicyAcknowledgement: mongoose.model("PolicyAcknowledgement", PolicyAcknowledgementSchema),
  Audit: mongoose.model("Audit", AuditSchema),
  ComplianceIssue: mongoose.model("ComplianceIssue", ComplianceIssueSchema),
  DepartmentScore: mongoose.model("DepartmentScore", DepartmentScoreSchema),
  Notification: mongoose.model("Notification", NotificationSchema),
  ESGConfig: mongoose.model("ESGConfig", ESGConfigSchema),
  User: mongoose.model("User", UserSchema),
};
