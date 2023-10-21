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

// Define a temporary folder to store the uploaded files
const tempFolder = path.join(__dirname,"tmp");

// Ensure the temporary folder exists, or create it if not
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder);
}
//---------------------------------

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

// /-----------------------------
const cloud = require("cloudinary");
const cloudinary = cloud.v2;
cloudinary.config({
  cloud_name: "dpyzuvtxl",
  api_key: "126616754537225",
  api_secret: "3NEfii_7msieIgCrsUZTloMFgO8",
});
// cloudinary.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag", folder: "test-tarek" },
//   function (error, result) {
//     console.log(result);
//   }
// );
// /-----------------------------

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
  // Assuming image is an object containing the image data
  const imageBuffer = image.data;
  const tempFileName = `/temp_${Date.now()}.jpg`;
  const tempFilePath = path.join(tempFolder, tempFileName);
  image.mv(tempFilePath, (err) => {
    if (err) {
      return res
        .status(500)
        .send("Error when saving the image to the temporary folder.");
    }
  });
  //fs.writeFileSync(tempFileName, imageBuffer);

  // Upload the image to Cloudinary
  cloudinary.uploader.upload(
    tempFilePath,
    { public_id: image.name, folder: "test-tarek" },
    async function (error, result) {
      if (error) {
        console.error("Error when uploading to Cloudinary:", error);
        return res
          .status(500)
          .send("Error when uploading the image to Cloudinary.");
      }

      // Image uploaded successfully, result contains Cloudinary information
      const imageUploaded = result;

      // Now, create the Product with the image information
      const productName = req.body.name;
      const productDescription = req.body.description;
      const productPrice = Number(req.body.price);

      const product = new Product({
        name: productName,
        description: productDescription,
        price: productPrice,
        image: imageUploaded.url,
        imageObject: imageUploaded, // Cloudinary result
      });

      // Save the product to your database
      try {
        await product.save();
        res.redirect("/products");
      } catch (err) {
        console.error("Error when saving the product:", err);
        return res.status(500).send("Error when saving the product.");
      }

      // Clean up the temporary file
      // fs.unlinkSync(tempFileName);
    }
  );
});

app.get("/addProduct", (req, res) => {
  res.render("addProduct");
});
//-----------------------------------------
//delete product ..
app.delete("/deleteProduct/:productId", async (req, res) => {
  const productId = req.params.productId;
  // Find the product by ID
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).send("Product not found");
  }
  // Delete the image from Cloudinary if it exists
  if (product.imageObject && product.imageObject.public_id) {
    cloudinary.uploader.destroy(
      product.imageObject.public_id,
      function (error, result) {
        if (error) {
          console.error("Error deleting image from Cloudinary:", error);
          return res.status(500).send("Error deleting the product and image.");
        }
        // Image deleted from Cloudinary, now delete the product from the database
        Product.deleteOne({ _id: productId }).then(() => {
          res.redirect("/products");
        });
      }
    );
  } else {
    // If there's no image in Cloudinary, delete the product from the database directly
    await Product.deleteOne({ _id: productId });
    res.redirect("/products");
  }
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
  const product = await Product.findOne({ _id: productId });
  let newImage;
  let newImageObject;

  if (!req.files || !req.files.image) {
    newImage = product.image;
    newImageObject = product.imageObject;
  } else {
    // Upload New Image to the cloudnary ....
    const image = req.files.image;
    const imageExtension = path.extname(image.name);
    const randomSuffix = Math.floor(Math.random() * 10000000000);
    image.name = randomSuffix + imageExtension;
    // Assuming image is an object containing the image data
    const imageBuffer = image.data;
    const tempFileName = `temp_${Date.now()}.jpg`;
    fs.writeFileSync(tempFileName, imageBuffer);
    // Upload the image to Cloudinary
    cloudinary.uploader.upload(
      tempFileName,
      { public_id: image.name, folder: "test-tarek" },
      async function (error, result) {
        if (error) {
          console.error("Error when uploading to Cloudinary:", error);
          return res
            .status(500)
            .send("Error when uploading the image to Cloudinary.");
        }

        // Image uploaded successfully, result contains Cloudinary information
        const imageUploaded = result;
        newImage = imageUploaded.url;
        newImageObject = imageUploaded;
        // Clean up the temporary file
        fs.unlinkSync(tempFileName);
      }
    );

    // delete old image .......
    cloudinary.uploader.destroy(
      product.imageObject.public_id,
      function (error, result) {
        if (error) {
          console.error("Error deleting image from Cloudinary:", error);
          return res.status(500).send("Error deleting the product and image.");
        }
      }
    );

    //--------------------------------
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

app.listen(3000, () => {
  console.log(`server is running on port 3000`);
});
