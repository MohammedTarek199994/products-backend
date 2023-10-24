const mongoos = require("mongoose");
const password = process.env.DB_PASSWORD;
//---------------------------------------------------------------------
const connectDB = async () => {
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
