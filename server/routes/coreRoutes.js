const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/coreController");

router.post("/auth/register", asyncHandler(controller.register));
router.post("/auth/login", asyncHandler(controller.login));

router.get("/employees", asyncHandler(controller.listEmployees));
router.post("/employees", asyncHandler(controller.createEmployee));
router.get("/employees/:id", asyncHandler(controller.getEmployee));

router.get("/departments", asyncHandler(controller.listDepartments));
router.post("/departments", asyncHandler(controller.createDepartment));
router.put("/departments/:id", asyncHandler(controller.updateDepartment));
router.delete("/departments/:id", asyncHandler(controller.deleteDepartment));

router.get("/categories", asyncHandler(controller.listCategories));
router.post("/categories", asyncHandler(controller.createCategory));
router.delete("/categories/:id", asyncHandler(controller.deleteCategory));

router.get("/notifications", asyncHandler(controller.listNotifications));
router.post("/notifications/:id/read", asyncHandler(controller.markNotificationRead));

router.get("/config", asyncHandler(controller.getConfigEndpoint));
router.put("/config", asyncHandler(controller.updateConfig));

module.exports = router;
