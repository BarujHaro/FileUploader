import prisma from '../db/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFile = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).send("Not file upload");
        }
 
        const {folderId} = req.body;
        const userId = req.user.id;
        console.log(folderId+" "+userId+" "+req.file.originalname);

        // Parsear el ID de la carpeta
        const targetFolderId = folderId && !isNaN(parseInt(folderId)) ? parseInt(folderId) : null;

        await prisma.file.create({
            data: {
                name: req.file.originalname,
                url: `/upload/${req.file.filename}`,
                size: req.file.size,
                mimeType: req.file.mimetype,
                userId: userId,
                folderId: targetFolderId
            }
        });

        if (targetFolderId) {
            return res.redirect(`/folder/folders/${targetFolderId}`);
        }

        res.redirect('/folder/folders');
    }catch(error){
        console.error("Error saving the file:", error);
        res.status(500).send("Error saving the file");
    }
};

export const downloadFile = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id);
        const userId = req.user.id;

        const file = await prisma.file.findFirst({
            where: { id: fileId, userId: userId }
        });

        if (!file) {
            return res.status(404).send('File record not found in database');
        }

        const cleanUrl = file.url.startsWith('/') ? file.url.slice(1) : file.url;

        const filePath = path.resolve(__dirname, '../../public', cleanUrl);

        console.log("Intentando descargar desde:", filePath); // Log para depurar

        if (!fs.existsSync(filePath)) {
            console.error("El archivo físico no existe en la ruta:", filePath);
            return res.status(404).send('Physical file not found on server');
        }

        res.download(filePath, file.name, (err) => {
            if (err && !res.headersSent) {
                console.error('Error al enviar el archivo:', err);
                res.status(500).send('Could not download file');
            }
        });

    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Error downloading file');
    }
};


export const editFile = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id);
        const { name } = req.body;
        const userId = req.user.id;

        const file = await prisma.file.findFirst({
            where: { id: fileId, userId: userId }
        });


        if (file) {
            await prisma.file.update({
                where: { id: fileId },
                data: { name: name.trim() }
            });

            if (file.folderId) {
                return res.redirect(`/folder/folders/${file.folderId}`);
            }
        }

        res.redirect('/folder/folders');

    } catch (error) {
        console.error('Error editing the File:', error);
        res.status(500).send('Error editing the File');
    }
};


export const deleteFile = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id);
        const userId = req.user.id;

        const file = await prisma.file.findFirst({
            where: { id: fileId, userId: userId }
        });

        if (file) {

            const targetFolderId = file.folderId;
            // 1. Delete on the disk
            const filePath = path.join(__dirname, '../../public', file.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
 
            // 2. Delete on teh DB
            await prisma.file.delete({ where: { id: fileId } });
        
            if (targetFolderId) {
                return res.redirect(`/folder/folders/${targetFolderId}`);
            }
        }

        res.redirect('/folder/folders');
    } catch (error) {
        console.error('Error Deleting the File:', error);
        res.status(500).send('Error Deleting the File');
    }
};

export const previewFile = async (req, res) => {
    try{
        const fileId = parseInt(req.params.id, 10);

        if (isNaN(fileId)) {
            return res.status(400).send('Not valid ID');
        }

        const file = await prisma.file.findFirst({
            where: {id: fileId, userId: req.user.id}     
        });

        if(!file){
            return res.status(404).send('File not found');
        }

        const relativePath = file.url.startsWith('/') ? file.url.slice(1) : file.url;

        const filePath = path.join(__dirname, '../../public', relativePath);

     
        res.sendFile(filePath);

    }catch(error){
        console.error(error);
        res.status(500).send('Error generating the preview');
    }
}