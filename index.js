const express = require("express");
const app = express();
const mongoos = require("mongoose");
const Product = require("./models/Product"); // Product Model ...
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); // for ejs engine
// app.use(express.static("public")); //for public folder

app.set("views", __dirname + "/views"); // Specify the directory for your EJS views
app.use(express.static("public"));
// for delete request ...........
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const fileUpload = require("express-fileupload");
app.use(fileUpload());
const fs = require("fs");
const path = require("path");
const cors = require("cors");
app.use(cors());
//--------------------------------

app.use(express.json());
// connect to database :::::::::::::::::::::::::::::
mongoos
  .connect(
    "mongodb+srv://MohammedNaga:CUxGKH23pvIomDL4@cluster0.ieowrn3.mongodb.net/ecommerce?retryWrites=true&w=majority"
  )
  //mongodb+srv://MohammedNaga:<password>@cluster0.ieowrn3.mongodb.net/mydatabase?

  .then(() => {
    console.log("connecting successfully");
  })
  .catch((error) => {
    console.log("Error", error);
  });
//:::::::::::::::::::::::::::::::::::::::::::::::::::
//send Email ::
const nodemailer = require("nodemailer");

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use the email service you prefer (e.g., Gmail, SMTP)
  auth: {
    user: "m.naga199994@gmail.com", // Your email address
    pass: "razwejzulackrdrq", // Your email password
  },
});

function sendEmail(to, subject, text, res) {
  const mailOptions = {
    from: "m.naga199994@gmail.com", // Sender's email address
    to, // Recipient's email address
    subject, // Email subject
    text, // Email body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email error:", error);
      res.status(500).send("Email not sent: " + error.message);
    } else {
      console.log("Email sent:", info.response);
      res.send("Email sent successfully.");
    }
  });
}
//:::::::::::::::::::::::::::::::::::::::::::::::::::

///-----------------------------
// const cloud = require("cloudinary");
// const cloudinary = cloud.v2;
// cloudinary.config({
//   cloud_name: "dpyzuvtxl",
//   api_key: "126616754537225",
//   api_secret: "3NEfii_7msieIgCrsUZTloMFgO8",
// });
// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function(error, result) {console.log(result);});
///-----------------------------

app.get("/", (req, res) => {
  res.send("welcome");
});
//-------------------------------------------
app.post("/addProduct", async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).send("No files were uploaded.");
  }
  const image = req.files.image;
  const imageExtension = path.extname(image.name);
  const randomSuffix = Math.floor(Math.random() * 10000000000);
  image.name = randomSuffix + imageExtension;
  const uploadPath = __dirname + "/public/uploads/" + image.name;
  image.mv(uploadPath, (err) => {
    if (err) {
      res.send("Error when uploading the image");
    }
  });
  //----------
  const productName = req.body.name;
  const productDescription = req.body.description;
  const productPrice = Number(req.body.price);
  let product = new Product({
    name: productName,
    description: productDescription,
    price: productPrice,
    image: "uploads/" + image.name,
    imageObject: image,
  });
  await product.save();
  res.redirect("/products");
});

app.get("/addProduct", (req, res) => {
  res.render("addProduct");
});
//-----------------------------------------
app.delete("/deleteProduct/:productId", async (req, res) => {
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  const deletePath = __dirname + "/public/" + product.image;

  if (!product) {
    return res.status(404).send("Product not found");
  }
  fs.unlink(deletePath, (err) => {
    if (err) {
      res.send("Error deleting the file");
    }
  });

  await Product.deleteOne({ _id: productId });
  res.redirect("/products");
});

//-----------------------------------------
app.get("/updateProduct", (req, res) => {
  res.render("updateProduct", {
    product: { _id: "1", name: "tset", description: "test", price: 10 },
  });
});

app.post("/updateProduct/:productId", async (req, res) => {
  const id = req.params.productId;
  await Product.findById(id) // Corrected usage of findById
    .then((product) => {
      const imagePath = __dirname + "/public/" + product.image;
      res.render("updateProduct", { product: product, imagePath: imagePath });
    })
    .catch((error) => {
      res.send("Error when send the updated data >> ");
    });
});
//------------------------------------------------------------------------
app.put("/updateProduct/:productId", async (req, res) => {
  const productId = req.params.productId;
  const oldProduct = await Product.findOne({ _id: productId });
  //const uploadPath = __dirname + "/public/uploads/" + image.name;

  let newImage;
  let newImageObject;
  if (!req.files || !req.files.image) {
    newImage = oldProduct.image;
    newImageObject = oldProduct.imageObject;
  } else {
    // upload the new image
    const image = req.files.image;
    const imageExtension = path.extname(image.name);
    const randomSuffix = Math.floor(Math.random() * 10000000000);
    image.name = randomSuffix + imageExtension;
    newImage = "uploads/" + image.name;
    newImageObject = image;
    const uploadPath = __dirname + "/public/uploads/" + image.name;
    image.mv(uploadPath, (err) => {
      if (err) {
        res.send("Error when upload the new updated image >> ");
      }
    });

    // delete old image .......
    const product = await Product.findById(productId);
    const deletePath = __dirname + "/public/" + product.image;
    if (!product) {
      return res.status(404).send("Product not found");
    }
    fs.unlink(deletePath, (err) => {
      if (err) {
        console.error("Error deleting the file:", err);
      }
    });
  }

  // update product data ....
  const updatedProductData = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    image: newImage,
    imageObject: newImageObject,
  };

  await Product.updateOne({ _id: productId }, updatedProductData)
    .then(() => {
      res.redirect("/products");
    })
    .catch((error) => {
      res.redirect("Update not done >>>");
    });
});
//-----------------------------------------
app.get("/products", async (req, res) => {
  await Product.find()
    .then((products) => {
      res.render("products", { products: products });
    })
    .catch((error) => {
      res.send("Error when fetch tha data ");
    });
});

//-----------------------------------
app.get("/test", (req, res) => {
  const responseData = {
    message: "Ahmed Tarek",
    data: "Mohammed Tarek",
  };
  res.json(responseData);
});

app.post("/test", (req, res) => {
  const data = req.body.data;
  console.log(data);
  res.json({
    message: `Data received successfully >>> + ${data}`,
    receivedData: data,
  });
});

app.post("/sendEmail", (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Name:: ${name} >> Email :: ${email}  >>Message:: ${message}  `);
  const my_email = "m.naga199994@gmail.com";

  // Validate input and sanitize data if needed

  //to >> subject >> text
  sendEmail(my_email, email, message, res);
  res.send("Email sent successfully.");
});

app.listen(process.env.PORT, () => {
  console.log("server is running on port 3000");
});
