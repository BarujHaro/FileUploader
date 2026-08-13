import bcrypt from 'bcrypt';
import prisma from '../db.js';

export const getSignUp = (req, res) => {
    res.render('sign-up');
};

export const postSignUp = async (req,res,next) => {
    const {username, password} = req.body;

    try{
        const existingUser = await prisma.user.findUnique({
            where: {username: username}
        });

        if (existingUser){
            return res.render('sign-up', {
                error: 'User is in use'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                username: username,
                password: hashedPassword,
            },
        });

        res.redirect('/log-in');
    }catch(error){
        next(error);
    }
};