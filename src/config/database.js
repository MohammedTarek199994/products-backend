const mongoos = require("mongoose");
require("dotenv").config({
  path: ".env",
  // , debug:true
});
const password = process.env.DB_PASSWORD;

//---------------------------------------------------------------------
const connectDB = async () => {
  // console.log("DB - Password >>", password);
  await mongoos
    .connect(
      `mongodb+srv://MohammedNaga:${password}@cluster0.ieowrn3.mongodb.net/ecommerce?retryWrites=true&w=majority`
    )
    //mongodb+srv://MohammedNaga:<password>@cluster0.ieowrn3.mongodb.net/mydatabase?
    // `mongodb+srv://MohammedNaga:${password}@cluster0.ieowrn3.mongodb.net/ecommerce?retryWrites=true&w=majority`
    .then(() => {
      console.log("connecting successfully");
    })
    .catch((error) => {
      console.log("Error", error);
    });
};
//---------------------------------------------------------------------
module.exports = connectDB;
