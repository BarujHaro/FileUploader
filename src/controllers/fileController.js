import prisma from '../db.js';

exports.uploadFile = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).send("Not file upload");
        }
 
        const {folderId} = req.body;
        const userId = req.user.id;

        await prisma.file.create({
            data: {
                name: req.file.originalname,
                url: `/uploads/${req.file.filename}`,
                size: req.file.size,
                mimeType: req.file.mimetype,
                userId: userId,
                folderId: folderId ? parseInt(folderInt) : null
            }
        });

        res.redirect('/folders');
    }catch(error){
        console.error("Error saving the file:", error);
        res.status(500).send("Error saving the file");
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id);
        const userId = req.user.id;

        // Search for the metadata
        const file = await prisma.file.findFirst({
            where: { id: fileId, userId: userId }
        });

        if (!file) {
            return res.status(404).send('File not found');
        }

        // Build the route on the server
        const filePath = path.join(__dirname, '../public', file.url);

        // res.download()
        res.download(filePath, file.name, (err) => {
            if (err) {
                console.error('Error enviando el archivo:', err);
                if (!res.headersSent) {
                    res.status(500).send('No se pudo descargar el archivo');
                }
            }
        });

    } catch (error) {
        console.error('Error downloading:', error);
        res.status(500).send('Error downloading');
    }
};


exports.editFile = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id);
        const { name } = req.body;
        const userId = req.user.id;

        await prisma.file.updateMany({
            where: { id: fileId, userId: userId },
            data: { name: name.trim() }
        });

        res.redirect('back');

    } catch (error) {
        console.error('Error editing the File:', error);
        res.status(500).send('Error editing the File');
    }
};


exports.deleteFile = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id);
        const userId = req.user.id;

        const file = await prisma.file.findFirst({
            where: { id: fileId, userId: userId }
        });

        if (file) {
            // 1. Delete on the disk
            const filePath = path.join(__dirname, '../public', file.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // 2. Delete on teh DB
            await prisma.file.delete({ where: { id: fileId } });
        }

        res.redirect('back');
    } catch (error) {
        console.error('Error Deleting the File:', error);
        res.status(500).send('Error Deleting the File');
    }
};