const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/gamificationController");

router.get("/badges", asyncHandler(controller.listBadges));
router.post("/badges", asyncHandler(controller.createBadge));
router.delete("/badges/:id", asyncHandler(controller.deleteBadge));
router.get("/employees/:employeeId/badges", asyncHandler(controller.employeeBadges));
router.post("/employees/:employeeId/check-badges", asyncHandler(controller.forceCheckBadges));

router.get("/rewards", asyncHandler(controller.listRewards));
router.post("/rewards", asyncHandler(controller.createReward));
router.put("/rewards/:id", asyncHandler(controller.updateReward));
router.delete("/rewards/:id", asyncHandler(controller.deleteReward));
router.post("/rewards/redeem", asyncHandler(controller.redeemReward));
router.get("/redemptions", asyncHandler(controller.listRedemptions));

router.get("/challenges", asyncHandler(controller.listChallenges));
router.post("/challenges", asyncHandler(controller.createChallenge));
router.put("/challenges/:id", asyncHandler(controller.updateChallenge));
router.put("/challenges/:id/status", asyncHandler(controller.updateChallengeStatus));
router.delete("/challenges/:id", asyncHandler(controller.deleteChallenge));

router.get("/challenge-participations", asyncHandler(controller.listChallengeParticipations));
router.post("/challenge-participations", asyncHandler(controller.createChallengeParticipation));
router.post("/challenge-participations/:id/decision", asyncHandler(controller.decideChallengeParticipation));

router.get("/leaderboard", asyncHandler(controller.leaderboard));

module.exports = router;
