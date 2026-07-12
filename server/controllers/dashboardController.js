const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const {
  Department,
  Employee,
  ComplianceIssue,
  CarbonTransaction,
  Challenge,
  DepartmentScore,
  EmployeeParticipation,
  TrainingCompletion,
  ChallengeParticipation,
} = require("../models");
const { computeAllDepartmentScores, computeOverallESGScore } = require("../services/scoringService");

function rowToPlain(row) {
  const obj = row.toJSON ? row.toJSON() : row;
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
}

async function filteredRows({ module, department_id, employee_id, challenge_id, date_from, date_to }) {
  if (module === "environmental") {
    const filter = {};
    if (department_id) filter.department_id = department_id;
    if (date_from || date_to) filter.date = {};
    if (date_from) filter.date.$gte = new Date(date_from);
    if (date_to) filter.date.$lte = new Date(date_to);
    return (await CarbonTransaction.find(filter)).map(rowToPlain);
  }
  if (module === "social") {
    const filter = {};
    if (employee_id) filter.employee_id = employee_id;
    if (date_from || date_to) filter.completion_date = {};
    if (date_from) filter.completion_date.$gte = new Date(date_from);
    if (date_to) filter.completion_date.$lte = new Date(date_to);
    return (await EmployeeParticipation.find(filter)).map(rowToPlain);
  }
  if (module === "social_training") {
    const filter = {};
    if (employee_id) filter.employee_id = employee_id;
    if (date_from || date_to) filter.completion_date = {};
    if (date_from) filter.completion_date.$gte = new Date(date_from);
    if (date_to) filter.completion_date.$lte = new Date(date_to);
    return (await TrainingCompletion.find(filter)).map(rowToPlain);
  }
  if (module === "social_challenges") {
    const filter = {};
    if (employee_id) filter.employee_id = employee_id;
    if (challenge_id) filter.challenge_id = challenge_id;
    return (await ChallengeParticipation.find(filter)).map(rowToPlain);
  }
  if (module === "governance") {
    const filter = {};
    if (date_from || date_to) filter.due_date = {};
    if (date_from) filter.due_date.$gte = new Date(date_from);
    if (date_to) filter.due_date.$lte = new Date(date_to);
    return (await ComplianceIssue.find(filter)).map(rowToPlain);
  }
  if (module === "esg_summary") {
    const filter = department_id ? { department_id } : {};
    return (await DepartmentScore.find(filter)).map(rowToPlain);
  }
  const err = new Error(`Unknown module '${module}'.`);
  err.status = 400;
  throw err;
}

const recalculateScores = async (req, res) => {
  const records = await computeAllDepartmentScores();
  res.json({ recalculated: records.length });
};

const dashboardOverview = async (req, res) => {
  const departments = await Department.find();
  const deptRows = [];
  for (const department of departments) {
    const latest = await DepartmentScore.findOne({ department_id: department.id }).sort({ period: -1, createdAt: -1 });
    deptRows.push({
      department_id: department.id,
      department_name: department.name,
      environmental_score: latest?.environmental_score ?? null,
      social_score: latest?.social_score ?? null,
      governance_score: latest?.governance_score ?? null,
      total_score: latest?.total_score ?? null,
    });
  }
  const openIssues = await ComplianceIssue.find({ status: { $in: ["open", "in_progress"] } });
  const overdue = openIssues.filter((issue) => issue.is_overdue).length;
  res.json({
    overall_esg_score: await computeOverallESGScore(),
    departments: deptRows,
    open_compliance_issues: openIssues.length,
    overdue_compliance_issues: overdue,
    total_employees: await Employee.countDocuments(),
    total_carbon_transactions: await CarbonTransaction.countDocuments(),
    active_challenges: await Challenge.countDocuments({ status: "active" }),
  });
};

const departmentScoreHistory = async (req, res) => {
  const filter = req.query.department_id ? { department_id: req.query.department_id } : {};
  res.json(await DepartmentScore.find(filter).sort({ period: 1 }));
};

function sendCsv(res, rows, module) {
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => JSON.stringify(row[column] ?? "")).join(","));
  }
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${module}_report.csv`);
  res.send(lines.join("\n"));
}

async function sendXlsx(res, rows, module) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");
  const columns = rows.length ? Object.keys(rows[0]) : ["message"];
  sheet.columns = columns.map((key) => ({ header: key, key, width: 24 }));
  if (rows.length) sheet.addRows(rows);
  else sheet.addRow({ message: "No matching records" });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=${module}_report.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
}

function sendPdf(res, rows, module) {
  const doc = new PDFDocument({ margin: 36, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${module}_report.pdf`);
  doc.pipe(res);
  doc.fontSize(18).text(`EcoSphere ${module} Report`);
  doc.moveDown();
  if (!rows.length) {
    doc.fontSize(11).text("No matching records.");
  } else {
    rows.slice(0, 100).forEach((row, idx) => {
      doc.fontSize(10).text(`${idx + 1}. ${JSON.stringify(row)}`);
      doc.moveDown(0.4);
    });
  }
  doc.end();
}

const customReport = async (req, res) => {
  const module = req.query.module;
  const rows = await filteredRows(req.query);
  if (req.query.export === "csv") return sendCsv(res, rows, module);
  if (req.query.export === "xlsx") return sendXlsx(res, rows, module);
  if (req.query.export === "pdf") return sendPdf(res, rows, module);
  res.json({ module, count: rows.length, rows });
};

module.exports = {
  recalculateScores,
  dashboardOverview,
  departmentScoreHistory,
  customReport,
};
