const express = require("express");
const router = express.Router();
productController = require("../controllers/productController");
//###########################################################
// list of products ...
router.get("/", productController.getAllProducts);
//Render Add-Products ...
router.get("/add", productController.renderAddProductPage);
//Add - Product from form..
router.post("/", productController.createProduct);
//#############################################################
// Render Update page ... take update button from the form
router.post("/update/:productId", productController.renderUpdateProductPage);
// Update images and DB ....
router.put("/update/:productId", productController.updateProduct);
//#############################################################
//-----------------------------------------
//delete product ..
router.delete("/:productId", productController.deleteProduct);
//############################################################
// Export the router
module.exports = router;
