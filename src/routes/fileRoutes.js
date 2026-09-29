import { Router } from 'express';
const fileController = require("../controllers/fileController");
const upload = require('../config/multer');
const router = Router();

router.post('/file/upload', upload.single('file'), fileController.uploadFile);
router.get('/file/:id/download', fileController.downloadFile);
router.post('/file/:id/edit', fileController.editFile);
router.post('/file/:id/delete', fileController.deleteFile);

export default router; 