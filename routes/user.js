const express = require("express");
const router = express.Router();
const {
  getAllUser,
  changeStatus,
  changeRole,
  userCart,
  getUserCart,
  removeUserCart,
  addressUserCart,
  order,
  getOrder,
} = require("../controllers/user");
const { authCheck, adminCheck } = require("../middleware/authCheck");
router.get("/users", authCheck, adminCheck, getAllUser);
router.post("/change-status", authCheck, adminCheck, changeStatus);
router.post("/change-role", authCheck, adminCheck, changeRole);
router.post("/user/cart", authCheck, userCart);
router.get("/user/cart", authCheck, getUserCart);
router.delete("/user/cart", authCheck, removeUserCart);
router.post("/user/address", authCheck, addressUserCart);
router.post("/user/order", authCheck, order);
router.get("/user/order", authCheck, getOrder);
module.exports = router;
