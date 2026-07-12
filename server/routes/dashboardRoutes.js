const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/dashboardController");

router.post("/dashboard/recalculate", asyncHandler(controller.recalculateScores));
router.get("/dashboard/overview", asyncHandler(controller.dashboardOverview));
router.get("/dashboard/department-scores", asyncHandler(controller.departmentScoreHistory));
router.get("/reports/custom", asyncHandler(controller.customReport));

module.exports = router;
