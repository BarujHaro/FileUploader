import prisma from '../db/db.js';
import jwt from 'jsonwebtoken';

export const getFolders = async (req, res) => {
    try{
        const userId = req.user.id;

        const foldersPage = parseInt(req.query.p_folders) || 1;
        const foldersLimit = 8;
        const foldersSkip = (foldersPage-1) * foldersLimit;

        const totalFolders = await prisma.folder.count({
            where: {userId: userId, parentId: null}
        });
        const foldersTotalPages = Math.ceil(totalFolders / foldersLimit);

        const userFolders = await prisma.folder.findMany({
            where: {userId: userId, parentId: null},
            orderBy: {name: 'asc'},
            take: foldersLimit,
            skip: foldersSkip
        });


        const filesPage = parseInt(req.query.p_files) || 1;
        const filesLimit = 8;
        const filesSkip = (filesPage-1)*filesLimit;
        const totalFilesCount = await prisma.file.count({
            where: { folderId: null, userId: userId }
        });
        const filesTotalPages = Math.ceil(totalFilesCount / filesLimit);


        const userFiles = await prisma.file.findMany({
            where: { userId: userId, folderId: null },
            orderBy: { createdAt: 'desc' },
            take: filesLimit,
            skip: filesSkip
        });
     
        const allUserFolders = await prisma.folder.findMany({
            where: {userId: userId},
            orderBy: {name: 'asc'}
        });

        res.render("folder/folders", {
            title: "My Files",
            folders: userFolders,          
            files: userFiles,              
            allFolders: allUserFolders,    
            currentFolder: null,
            error: null,
            foldersPage: foldersPage,  
            foldersTotalPages: foldersTotalPages,
            filesPage: filesPage,
            filesTotalPages: filesTotalPages,
        });

    }catch(error){
        console.error("Error in getFolders:", error);
        res.status(500).render("folder/folders", {
            title: "My Files",
            folders: [],        
            files: [],             
            allFolders: [],   
            currentFolder: null,
            error: "Error getting the files",
            foldersPage: 1,  
            foldersTotalPages: 1,
            filesPage: 1,
            filesTotalPages: 1,
        });
    }
 
};

export const postFolders = async (req, res) => {
    try{
        const {name, parentId} = req.body;
        const userId = req.user.id;

        const folderName = name ? name.trim() : '';

        if (!folderName) {
            return res.status(400).send("Folder name is required");
        }

        await prisma.folder.create({
            data: {
                name: folderName,
                userId: userId,
                parentId: parentId && !isNaN(parseInt(parentId)) ? parseInt(parentId) : null
            }
        });

        if(parentId && !isNaN(parseInt(perentId))){
            return res.redirect(`/folder/folders/${parentId}`);
        }

        res.redirect('/folder/folders');
    }catch(error){
        console.error("Error creating the folder:", error);
        res.status(500).send("Error creating the folder");
    }

};


export const getFolderContent = async (req, res) => {
    try {
        const folderId = parseInt(req.params.id);
        const userId = req.user.id;

        const currentFolder = await prisma.folder.findFirst({
            where: {id: folderId, userId: userId}
        });

        if(!currentFolder){
            return res.status(404).send('Folder not found');
        }

        //Pagination
        const foldersPage = parseInt(req.query.p_folders) || 1;
        const foldersLimit = 8;
        const foldersSkip = (foldersPage - 1) * foldersLimit;

        const totalFoldersCount = await prisma.folder.count({
            where: { parentId: folderId, userId: userId }
        });
        const foldersTotalPages = Math.ceil(totalFoldersCount / foldersLimit);

        const folders = await prisma.folder.findMany({
            where: { parentId: folderId, userId: userId },
            orderBy: { name: 'asc' },
            take: foldersLimit,
            skip: foldersSkip

        });

        const filesPage = parseInt(req.query.p_files) || 1;
        const filesLimit = 8;
        const filesSkip = (filesPage - 1) * filesLimit;

        const totalFilesCount = await prisma.file.count({
            where: { folderId: folderId, userId: userId }
        });
        const filesTotalPages = Math.ceil(totalFilesCount / filesLimit);

        const files = await prisma.file.findMany({
            where: { folderId: folderId, userId: userId },
            orderBy: { createdAt: 'desc' }
        });

        const allFolders = await prisma.folder.findMany({
            where: { userId: userId },
            orderBy: { name: 'asc' },
            take: filesLimit,
            skip: filesSkip
        });

        res.render('folder/folders', {
            title: currentFolder.name,
            currentFolder,
            folders,
            files,
            allFolders,
            foldersPage,
            foldersTotalPages,
            filesPage,
            filesTotalPages
        });

    } catch (error) {
        console.error('Error loading the file:', error);
        res.status(500).send('Error loading the file');
    }
};

export const editFolder = async (req, res) => {
    try {
        const folderId = parseInt(req.params.id);
        const { name } = req.body;
        const userId = req.user.id;

        await prisma.folder.updateMany({
            where: { id: folderId, userId: userId },
            data: { name: name.trim() }
        });

        res.redirect('back');

    } catch (error) {
        console.error('Error editing the Folder:', error);
        res.status(500).send('Error editing the Folder');
    }
};

export const deleteFolder = async (req, res) => {
    try {
        const folderId = parseInt(req.params.id);
        const userId = req.user.id;

        await prisma.folder.deleteMany({
            where: { id: folderId, userId: userId }
        });

        res.redirect('/folder/folders');
    } catch (error) {
        console.error('Error Deleting the folder:', error);
        res.status(500).send('Error Deleting the folder');
    }
};

export const generateShareLink = async (req, res) => {
    try{
        const { folderId } = req.params;
        const { duration } = req.body;

        const token = jwt.sign(
            {folderId: folderId},
            process.env.JWT_SHARE_SECRET,
            {expiresIn: duration}
        );
 

        const shareLink = `${req.protocol}://${req.get('host')}/folder/share/${token}`;
        
        res.redirect(`/folder/folders?shareLink=${encodeURIComponent(shareLink)}`);
    }catch (error){
        res.status(500).send("Error generating the link");
    }
};

export const viewSharedFolder = async (req, res) => {
 
    
    try {
        const {token} = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SHARE_SECRET);
        const folderId = decoded.folderId;

        const folder = await prisma.folder.findUnique({
            where: { id: parseInt(folderId) },  
            include: { files: true }
        });

        if (!folder) {
            return res.status(404).send("Folder doesn't exist");
        }

        
        res.render('folder/public-folder', { folder });



    }catch(error){
        if(error.name==='TokenExpiredError'){
            return res.status(410).send("Link expired.");
        }
        res.status(400).send("Invalid Link");
    }
};