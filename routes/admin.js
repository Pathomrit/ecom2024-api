const express = require("express");
const router = express.Router();
const { getOrder, changeOrderStatus } = require("../controllers/admin");
const { authCheck } = require("../middleware/authCheck");
router.put("/admin/order-status", authCheck, changeOrderStatus);
router.get("/admin/orders", authCheck, getOrder);
module.exports = router;
