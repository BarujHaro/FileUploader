import prisma from '../db/db.js';

export const getFolders = async (req, res) => {
    try{
        const userId = req.user.id;

        const userFolders = await prisma.folder.findMany({
            where: {userId: userId, parentId: null},
            orderBy: {name: 'asc'}
        });

        const userFiles = await prisma.file.findMany({
            where: { userId: userId, folderId: null },
            orderBy: { createdAt: 'desc' }
        });
     
        const allUserFolders = await prisma.folder.findMany({
            where: {userId: userId},
            orderBy: {name: 'asc'}
        });

        res.render("folder/folders", {
            title: "My Files",
            folders: userFolders,         // Lista de carpetas a mostrar
            files: userFiles,             // Lista de archivos a mostrar
            allFolders: allUserFolders,   // Opcional: Para llenar el <select> del modal de subida
            currentFolder: null,
            error: null
        });

    }catch(error){
        console.error("Error in getFolders:", error);
        res.status(500).render("folder/folders", {
            title: "My Files",
            folders: [],         // Lista de carpetas a mostrar
            files: [],             // Lista de archivos a mostrar
            allFolders: [],   // Opcional: Para llenar el <select> del modal de subida
            currentFolder: null,
            error: "Error getting the files"
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

        const folders = await prisma.folder.findMany({
            where: { parentId: folderId, userId: userId },
            orderBy: { name: 'asc' }
        });

        const files = await prisma.file.findMany({
            where: { folderId: folderId, userId: userId },
            orderBy: { createdAt: 'desc' }
        });

        const allFolders = await prisma.folder.findMany({
            where: { userId: userId },
            orderBy: { name: 'asc' }
        });

        res.render('folder/folders', {
            title: currentFolder.name,
            currentFolder,
            folders,
            files,
            allFolders
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