const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/socialController");

router.get("/dashboard", asyncHandler(controller.socialDashboard));

router.get("/activities", asyncHandler(controller.listActivities));
router.post("/activities", asyncHandler(controller.createActivity));
router.delete("/activities/:id", asyncHandler(controller.deleteActivity));

router.get("/participations", asyncHandler(controller.listParticipations));
router.post("/participations", asyncHandler(controller.createParticipation));
router.post("/participations/:id/decision", asyncHandler(controller.decideParticipation));

router.get("/diversity-metrics", asyncHandler(controller.diversityMetrics));

router.get("/training-completions", asyncHandler(controller.listTrainingCompletions));
router.post("/training-completions", asyncHandler(controller.createTrainingCompletion));
router.put("/training-completions/:id", asyncHandler(controller.updateTrainingCompletion));
router.delete("/training-completions/:id", asyncHandler(controller.deleteTrainingCompletion));

module.exports = router;
