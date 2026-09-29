import { Router } from 'express';
const folderController = require("../controllers/folderController");
const router = Router();

router.get('/folders', folderController.getFolders);
router.post('/folders', folderController.postFolders);
router.get('/folders/:id', folderController.getFolderContent);
router.post('/folders/:id/edit', folderController.editFolder);
router.post('/folders/:id/delete', folderController.deleteFolder);

export default router; 