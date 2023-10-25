const Product = require("../models/Product"); // Import the Product model
const cloudinary = require("../config/cloudinary");
const fileController = require("../controllers/fileController");
//=====================================
const fs = require("fs");
const path = require("path");
//define the tmp file and create it if not founded ...
const tempFolder = path.join(__dirname, "tmp");
// Ensure the temporary folder exists, or create it if not
// if (!fs.existsSync(tempFolder)) {
//   fs.mkdirSync(tempFolder);
// }
//=====================================
const getAllProducts = async (req, res) => {
  await Product.find()
    .then((products) => {
      res.render("products", { products: products });
    })
    .catch((error) => {
      res.send("Error when fetch tha data ");
    });
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
const createProduct = async (req, res) => {
  //---------------------------------------------------
  if (!req.files || !req.files.image) {
    return res.status(400).send("No files were uploaded.");
  }
  //----------------------------------------------------
  const image = req.files.image;
  const imageExtension = path.extname(image.name);
  const randomSuffix = Math.floor(Math.random() * 10000000000);
  image.name = randomSuffix + imageExtension;
  const tempFileName = `/temp_${Date.now()}.jpg`;
  const tempFilePath = path.join(tempFolder, tempFileName);
  //----------------------------------------------
  fileController.saveFileToTemp(image, tempFilePath);
  //------------------------------------------------
  let imageUploaded;
  await cloudinary
    .uploadImageToCloudinary(tempFilePath, image)
    .then((result) => {
      imageUploaded = result;
    })
    .catch((error) => {
      return res
        .status(500)
        .send(`Error when uploading the image to Cloudinary + ${error}`);
    });
  //--------------------------------------------------
  const productName = req.body.name;
  const productDescription = req.body.description;
  const productPrice = Number(req.body.price);
  const product = new Product({
    name: productName,
    description: productDescription,
    price: productPrice,
    image: imageUploaded.url,
    imageObject: imageUploaded,
  });
  // Save the product to your database
  try {
    await product.save();
    fileController.deleteFile(tempFilePath);
    res.redirect("/products");
  } catch (err) {
    console.error("Error when saving the product:", err);
    return res.status(500).send("Error when saving the product.");
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
const deleteProduct = async (req, res) => {
  const productId = req.params.productId;
  // Find the product by ID
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).send("Product not found");
  }
  // Delete the image from Cloudinary if it exists
  if (product.imageObject && product.imageObject.public_id) {
    cloudinary.deleteImageFromCloudinary(product.imageObject.public_id);
  }
  await Product.deleteOne({ _id: productId });
  res.redirect("/products");
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
const updateProduct = async (req, res) => {
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
    const tempFileName = `/temp_${Date.now()}.jpg`;
    const tempFilePath = path.join(tempFolder, tempFileName);
    fileController.saveFileToTemp(image, tempFilePath);
    // Upload the image to Cloudinary
    let imageUploaded;
    await cloudinary
      .uploadImageToCloudinary(tempFilePath, image)
      .then((result) => {
        imageUploaded = result;
        newImage = imageUploaded.url;
        newImageObject = imageUploaded;
      })
      .catch((error) => {
        return res
          .status(500)
          .send(`Error when uploading the image to Cloudinary + ${error}`);
      });
    fileController.deleteFile(tempFilePath);

    // delete old image .......
    cloudinary.deleteImageFromCloudinary(product.imageObject.public_id);

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
      // Clean up the temporary file
      res.redirect("/products");
    })
    .catch((error) => {
      res.redirect("Update not done >>>");
    });
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
const renderUpdateProductPage = async (req, res) => {
  const id = req.params.productId;
  await Product.findById(id) // Corrected usage of findById
    .then((product) => {
      const imagePath = __dirname + "/public/" + product.image;
      res.render("updateProduct", { product: product, imagePath: imagePath });
    })
    .catch((error) => {
      res.send("Error when send the updated data >> ");
    });
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
const renderAddProductPage = (req, res) => {
  res.render("addProduct");
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//===========================

module.exports = {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  renderUpdateProductPage,
  renderAddProductPage,
};
