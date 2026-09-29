const multer = require('multer');
const path = require('path');

// local storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save on public/uploads
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
 
        //Add timestamp on the original file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;