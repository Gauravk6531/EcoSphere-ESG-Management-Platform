require("dotenv").config();
const connectDB = require("../config/db");
const {
  Department,
  Employee,
  Category,
  EmissionFactor,
  CarbonTransaction,
  EnvironmentalGoal,
  CSRActivity,
  EmployeeParticipation,
  TrainingCompletion,
  ESGPolicy,
  PolicyAcknowledgement,
  Audit,
  ComplianceIssue,
  Badge,
  Reward,
  Challenge,
  ESGConfig,
} = require("../models");

async function getOrCreate(Model, filter, defaults = {}) {
  let row = await Model.findOne(filter);
  if (row) return row;
  row = await Model.create({ ...filter, ...defaults });
  return row;
}

async function seed() {
  await connectDB();
  await ESGConfig.findOneAndUpdate({ singleton: "main" }, { $setOnInsert: { singleton: "main" } }, { upsert: true });

  const engineering = await getOrCreate(Department, { code: "ENG" }, { name: "Engineering" });
  const sales = await getOrCreate(Department, { code: "SAL" }, { name: "Sales" });
  const operations = await getOrCreate(Department, { code: "OPS" }, { name: "Operations" });

  const alice = await getOrCreate(Employee, { email: "alice@ecosphere.io" }, { name: "Alice Chen", department_id: engineering.id, is_department_head: true });
  const bob = await getOrCreate(Employee, { email: "bob@ecosphere.io" }, { name: "Bob Martins", department_id: sales.id, points_balance: 50 });
  const carol = await getOrCreate(Employee, { email: "carol@ecosphere.io" }, { name: "Carol Singh", department_id: operations.id, is_department_head: true });

  engineering.head_id = alice.id;
  operations.head_id = carol.id;
  await Promise.all([engineering.save(), operations.save()]);

  const csrCategory = await getOrCreate(Category, { name: "Community Volunteering", type: "csr_activity" });
  const challengeCategory = await getOrCreate(Category, { name: "Energy Reduction", type: "challenge" });

  const diesel = await getOrCreate(EmissionFactor, { name: "Diesel Fuel" }, { category: "fleet", co2e_value: 2.68, unit: "litre", source: "DEFRA 2024" });
  await getOrCreate(EmissionFactor, { name: "Grid Electricity" }, { category: "utility", co2e_value: 0.45, unit: "kWh", source: "DEFRA 2024" });

  await getOrCreate(CarbonTransaction, { source_document_ref: "FLEET-001" }, {
    source_document_type: "fleet",
    emission_factor_id: diesel.id,
    quantity: 120,
    co2e_calculated: 321.6,
    department_id: operations.id,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  });

  await getOrCreate(EnvironmentalGoal, { target_metric: "Reduce fleet emissions (kg CO2e)" }, {
    target_value: 1000,
    current_value: 400,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    department_id: operations.id,
  });

  const activity = await getOrCreate(CSRActivity, { title: "Beach Cleanup Drive" }, {
    category_id: csrCategory.id,
    department_id: sales.id,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    description: "Community coastal cleanup event",
    evidence_required: true,
  });

  await getOrCreate(EmployeeParticipation, { employee_id: bob.id, activity_id: activity.id }, {
    proof_url: "https://example.com/proof.jpg",
    approval_status: "approved",
    points_earned: 50,
    completion_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  });

  await getOrCreate(TrainingCompletion, { employee_id: alice.id, training_name: "Inclusive Workplace Basics" }, {
    provider: "EcoSphere Academy",
    due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    completion_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "completed",
    score: 92,
    certificate_url: "https://example.com/certificates/inclusive-workplace",
  });
  await getOrCreate(TrainingCompletion, { employee_id: carol.id, training_name: "CSR Reporting Standards" }, {
    provider: "EcoSphere Academy",
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: "assigned",
  });

  const policy = await getOrCreate(ESGPolicy, { name: "Code of Conduct" }, {
    document_url: "https://example.com/policy.pdf",
    version: "2.1",
    department_ids: [engineering.id, sales.id, operations.id],
  });
  await getOrCreate(PolicyAcknowledgement, { policy_id: policy.id, employee_id: alice.id }, { acknowledged_date: new Date() });

  const audit = await getOrCreate(Audit, { title: "Q2 Governance Audit" }, {
    auditor: "External Auditor Co.",
    department_id: operations.id,
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    findings_summary: "Minor documentation gaps identified.",
  });
  await getOrCreate(ComplianceIssue, { audit_id: audit.id, owner_id: carol.id }, {
    severity: "medium",
    description: "Missing signed acknowledgement records for 2 employees",
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });

  await getOrCreate(Badge, { name: "Green Champion" }, {
    description: "Awarded for reaching 100 XP",
    unlock_metric: "xp_total",
    unlock_comparator: ">=",
    unlock_threshold: 100,
  });
  await getOrCreate(Reward, { name: "Eco Water Bottle" }, {
    description: "Reusable insulated bottle",
    points_required: 50,
    stock: 25,
  });
  await getOrCreate(Challenge, { title: "No-Print Week" }, {
    category_id: challengeCategory.id,
    description: "Avoid printing documents for one full week",
    xp: 100,
    difficulty: "easy",
    evidence_required: false,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "active",
  });

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
