const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isConfigured() {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  return (
    cloud_name &&
    cloud_name !== 'your_cloud_name' &&
    api_key &&
    api_key !== 'your_api_key' &&
    api_secret &&
    api_secret !== 'your_api_secret'
  );
}

module.exports = { cloudinary, isConfigured };
