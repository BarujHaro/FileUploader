import { Router } from 'express';
import * as folderController from "../controllers/folderController.js";
const router = Router();

router.get('/folders', folderController.getFolders);
router.post('/folders', folderController.postFolders);
router.get('/folders/:id', folderController.getFolderContent);
router.post('/folders/:id/edit', folderController.editFolder);
router.post('/folders/:id/delete', folderController.deleteFolder);

export default router; 