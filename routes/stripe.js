const express = require("express");
const router = express.Router();
const { authCheck } = require("../middleware/authCheck");
const { payment } = require("../controllers/stripe");
// import controller
router.post("/user/create-payment-intent", authCheck, payment);
module.exports = router;
