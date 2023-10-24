const express = require("express");
const app = express();
app.use(express.json()); // Parsed JSON data from body ....
require("dotenv").config({ path: ".env" }); //connect to .env file ....
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); // for ejs engine
app.set("views", __dirname + "/views"); // Specify the directory for your EJS views ...
app.use(express.static("public")); // make the public folder static folder ...
//==========================
const cors = require("cors");
app.use(cors());
//=========================
// const Product = require("./models/Product"); // Product Model ...
const connectDB = require("./config/database");
const cloudinary = require("./config/cloudinary");
//========================
//connect to DB &&& Cloudinary ....
connectDB();
cloudinary.connectCloudinary();
//========================
// for Handle body request that include files ...........
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const fileUpload = require("express-fileupload");
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
//========================
const productRoutes = require("./routes/productRoutes"); // Import the productRoutes module
app.use("/products", productRoutes);
//========================

//send Email ....
//:::::::::::::::::::::::::::::::::::::::::::::::::::
app.get("/", (req, res) => {
  res.redirect("/products");
});
//========================
app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
//========================
