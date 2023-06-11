const express = require("express");
const { createProduct, getaProduct, getAllProducts } = require("../controller/productCtrl");
const router = express.Router();

router.post("/", createProduct);
router.get("/:id", getaProduct);
router.get("/", getAllProducts);


module.exports = router;