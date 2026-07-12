const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/environmentalController");

router.get("/emission-factors", asyncHandler(controller.listEmissionFactors));
router.post("/emission-factors", asyncHandler(controller.createEmissionFactor));
router.delete("/emission-factors/:id", asyncHandler(controller.deleteEmissionFactor));

router.get("/carbon-transactions", asyncHandler(controller.listCarbonTransactions));
router.post("/carbon-transactions", asyncHandler(controller.createCarbonTransaction));

router.get("/goals", asyncHandler(controller.listGoals));
router.post("/goals", asyncHandler(controller.createGoal));
router.put("/goals/:id", asyncHandler(controller.updateGoal));
router.delete("/goals/:id", asyncHandler(controller.deleteGoal));

router.get("/product-profiles", asyncHandler(controller.listProductProfiles));
router.post("/product-profiles", asyncHandler(controller.createProductProfile));

module.exports = router;
