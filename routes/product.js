const express = require("express");
const router = express.Router();
const {
  create,
  list,
  read,
  update,
  remove,
  listBy,
  searchFilters,
  createImages,
  removeImage,
} = require("../controllers/product");
const { adminCheck, authCheck } = require("../middleware/authCheck");
router.post("/product", create);
router.get("/products/:count", list);
router.get("/product/:id", read);
router.put("/product/:id", update);
router.delete("/product/:id", remove);
router.post("/productby", listBy);
router.post("/search/filters", searchFilters);
router.post("/images", authCheck, adminCheck, createImages);
router.post("/removeimages", authCheck, adminCheck, removeImage);
module.exports = router;
