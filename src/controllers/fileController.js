import prisma from '../db/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { saveFile, getFile, removeFile } from '../services/storageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFile = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).send("Not file upload");
        }
 
        const {folderId} = req.body;
        const userId = req.user.id;
         
        // Parsear el ID de la carpeta
        const targetFolderId = folderId && !isNaN(parseInt(folderId)) ? parseInt(folderId) : null;

        // Guardar archivo en local o S3
        const savedFile = await saveFile(req.file);

        // Guardar metadatos en Prisma
        await prisma.file.create({
            data: {
                name: req.file.originalname,
                url: savedFile.url,
                storage: savedFile.storage,
                storageKey: savedFile.storageKey,
                size: req.file.size,
                mimeType: req.file.mimetype,
                userId,
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
            return res.status(404).send('File not found');
        }

                const storageKey =
            file.storageKey || path.basename(file.url);

        const buffer = await getFile(
            file.storage || 'local',
            file.storageKey || path.basename(file.url)
        );

                res.setHeader('Content-Type', 'application/octet-stream');

        res.setHeader(
            'Content-Disposition',
            `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`
        );

        res.send(buffer);

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

        if (!file) {
            return res.status(404).send('File not found');
        }

        const targetFolderId = file.folderId;

        

        // Eliminar archivo de su almacenamiento
        await removeFile(
            file.storage || 'local',
            file.storageKey || path.basename(file.url)
        );

        // Eliminar registro de Prisma
        await prisma.file.delete({
            where: { id: fileId }
        });

        if (targetFolderId) {
            return res.redirect(`/folder/folders/${targetFolderId}`);
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

        const buffer = await getFile(
            file.storage || 'local',
            file.storageKey || path.basename(file.url)
        );

        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', 'inline');

        res.send(buffer);

    }catch(error){
        console.error(error);
        res.status(500).send('Error generating the preview');
    }
}