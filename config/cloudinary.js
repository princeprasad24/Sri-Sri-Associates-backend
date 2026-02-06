const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'leads_documents',
    resource_type: 'auto', 
    allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'], 
  },
});