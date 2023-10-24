const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//-----------------------------
// Create schema for the user model
const ProductSchema = new Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  imageObject: Object,
});
//----------------------------
const Product = mongoose.model("Product", ProductSchema);
//-----------------------------
module.exports = Product;
