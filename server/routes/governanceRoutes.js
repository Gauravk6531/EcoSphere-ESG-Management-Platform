const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/governanceController");

router.get("/policies", asyncHandler(controller.listPolicies));
router.post("/policies", asyncHandler(controller.createPolicy));
router.delete("/policies/:id", asyncHandler(controller.deletePolicy));

router.get("/acknowledgements", asyncHandler(controller.listAcknowledgements));
router.post("/acknowledgements", asyncHandler(controller.acknowledgePolicy));
router.post("/acknowledgements/:id/send-reminder", asyncHandler(controller.sendReminder));

router.get("/audits", asyncHandler(controller.listAudits));
router.post("/audits", asyncHandler(controller.createAudit));
router.delete("/audits/:id", asyncHandler(controller.deleteAudit));

router.get("/compliance-issues/overdue", asyncHandler(controller.overdueIssues));
router.get("/compliance-issues", asyncHandler(controller.listComplianceIssues));
router.post("/compliance-issues", asyncHandler(controller.createComplianceIssue));
router.put("/compliance-issues/:id", asyncHandler(controller.updateComplianceIssue));

module.exports = router;
