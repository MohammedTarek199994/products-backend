const cloud = require("cloudinary");
require("dotenv").config({ path: ".env" });
const cloud_name = process.env.CLOUDINARY_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;
const cloudinary = cloud.v2;
const connectCloudinary = async () => {
  await cloudinary.config({
    cloud_name: cloud_name,
    api_key: api_key,
    api_secret: api_secret,
  });
  console.log("Cloudinary Connected");
};
//--------------------------------------------------------
function uploadImageToCloudinary(tempFilePath, image) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      tempFilePath,
      { public_id: image.name, folder: "test-tarek" },
      async function (error, result) {
        if (error) {
          console.error("Error when uploading to Cloudinary:", error);
          reject(error);
        } else {
          // Image uploaded successfully, result contains Cloudinary information
          resolve(result);
        }
      }
    );
  });
}
//--------------------------------------------------------
function deleteImageFromCloudinary(public_id) {
  return new Promise((resolve, reject) => {
    //---------
    cloudinary.uploader.destroy(public_id, function (error, result) {
      if (error) {
        console.error("Error when deleting from Cloudinary:", error);
        reject(error);
      } else {
        resolve(result);
      }
    });
    //---------
  });
}
//--------------------------------------------------------
module.exports = {
  connectCloudinary,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
};
