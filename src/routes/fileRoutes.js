import { Router } from 'express';
import * as fileController from "../controllers/fileController.js";
import {isAuth} from './middleware/Auth.js';
import {upload} from '../config/multer.js';
const router = Router();

router.post('/files/upload', isAuth, upload.single('file'), fileController.uploadFile);
router.get('/files/:id/download', isAuth, fileController.downloadFile);
router.post('/files/:id/edit', isAuth, fileController.editFile);
router.post('/files/:id/delete', isAuth, fileController.deleteFile);
router.get('/files/:id/preview', isAuth, fileController.previewFile);

export default router;  