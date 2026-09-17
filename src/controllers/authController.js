import bcrypt from 'bcrypt';
import prisma from '../db.js';
import passport from "../config/passport.js";
import { validationResult } from "express-validator";

exports.loginGet = async (req, res) => {
    try{
    
        res.render("login", {
            title: "Login",
            error: null
        });

    }catch(error){
        res.status(500).render("login", {
            title: "Login",
            error: "Error: loading form"
        });
    }

};

export const loginPost = (req, res, next) => {
    // 1. Validaciones previas de formularios
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("login", {
            title: "Login",
            error: errors.array()[0].msg 
        });
    }

    // 2. Autenticación delegada a Passport
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);

        // Si las credenciales fallan
        if (!user) {
            return res.render("login", {
                title: "Login",
                error: info?.message || "Invalid email or password"
            });
        }

        // Si las credenciales son válidas, inicia la sesión
        req.login(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            return res.redirect("/");
        });
    })(req, res, next);
};




export const getSignUp = (req, res) => {
    try{
        res.render("sign-up", {
            title: "Sign-up",
            error: null
        });
    }catch(error){
        res.status(500).render("sign-up", {
            title: "Sign-up",
            error: "Error: loading form"
        });
    }
    
};

export const postSignUp = async (req,res,next) => {

    try{
        // 1. Validar errores de express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("sign-up", {
                title: "Sign up",
                error: errors.array()[0].msg 
            });
        }

        const { first_name, last_name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {email: email}
        });

        if (existingUser){
            return res.render('sign-up', {
                error: 'User is not available'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email: email,
                first_name: first_name, // Si usaste @map en tu schema, o usa firstName tal cual lo definiste
                last_name: last_name,   // Si usaste @map en tu schema, o usa lastName tal cual lo definiste
                password: hashedPassword,
            },
        });

        res.redirect('/log-in');
    }catch(error){
        console.error("SIGNUP ERROR:", error);
        res.status(500).render("sign-up", {
            title: "Sign-up",
            error: "Error: Sign up failed"
        });
    }
};


exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }


    req.session.destroy(() => {
      res.redirect("/");
    });
  });
};
