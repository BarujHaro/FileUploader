import { Router } from 'express';
import * as fileController from "../controllers/fileController.js";
import {upload} from '../config/multer.js';
const router = Router();

router.post('/files/upload', upload.single('file'), fileController.uploadFile);
router.get('/files/:id/download', fileController.downloadFile);
router.post('/files/:id/edit', fileController.editFile);
router.post('/files/:id/delete', fileController.deleteFile);

export default router;  