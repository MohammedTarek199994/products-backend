const fs = require("fs");
const path = require("path");

// Function to save the uploaded image to a temporary file
function saveFileToTemp(image, destination) {
  return new Promise((resolve, reject) => {
    image.mv(destination, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(destination);
      }
    });
  });
}

// Function to delete a file
function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  saveFileToTemp,
  deleteFile,
};
