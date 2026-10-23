import { Router } from 'express';
import {isAuth} from './middleware/Auth.js';
import * as folderController from "../controllers/folderController.js";
const router = Router();

router.get('/folders', isAuth, folderController.getFolders);
router.get('/folders/:id', isAuth, folderController.getFolders);
router.post('/folders', isAuth, folderController.postFolders);
router.post('/folders/:id/edit', isAuth, folderController.editFolder);
router.post('/folders/:id/delete', isAuth, folderController.deleteFolder);

router.post('/share/:folderId', isAuth, folderController.generateShareLink);
router.get('/share/:token', folderController.viewSharedFolder);

export default router; 