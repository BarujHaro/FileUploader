import { Router } from 'express';
import * as fileController from "../controllers/fileController.js";
import {upload} from '../config/multer.js';
const router = Router();

router.post('/file/upload', upload.single('file'), fileController.uploadFile);
router.get('/file/:id/download', fileController.downloadFile);
router.post('/file/:id/edit', fileController.editFile);
router.post('/file/:id/delete', fileController.deleteFile);

export default router; 