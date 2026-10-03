import bcrypt from 'bcrypt';
import prisma from '../db/db.js';
import passport from "../config/passport.js";
import { validationResult } from "express-validator";

export const loginGet = async (req, res) => {
    try{
    
        res.render("auth/login", {
            title: "Login",
            error: null
        });

    }catch(error){
        res.status(500).render("auth/login", {
            title: "Login",
            error: "Error: loading form"
        });
    }

};

export const loginPost = (req, res, next) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("auth/login", {
            title: "Login",
            error: errors.array()[0].msg 
        });
    }

     
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);

   
        if (!user) {
            return res.render("auth/login", {
                title: "Login",
                error: info?.message || "Invalid email or password"
            });
        }

        
        req.login(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            return res.redirect("/");
        });
    })(req, res, next);
};


 

export const getSignUp = (req, res) => {
    try{
        res.render("auth/sign-up", {
            title: "Sign-up",
            error: null
        });
    }catch(error){
        res.status(500).render("auth/sign-up", {
            title: "Sign-up",
            error: "Error: loading form"
        });
    }
    
};

export const postSignUp = async (req,res,next) => {

    try{
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("auth/sign-up", {
                title: "Sign up",
                error: errors.array()[0].msg 
            });
        }

        const { first_name, last_name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {email: email}
        });

        if (existingUser){
            return res.render('auth/sign-up', {
                error: 'User is not available'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email: email,
                first_name: first_name,  
                last_name: last_name,    
                password: hashedPassword,
            },
        });

        res.redirect('auth/login');
    }catch(error){
        console.error("SIGNUP ERROR:", error);
        res.status(500).render("auth/sign-up", {
            title: "Sign-up",
            error: "Error: Sign up failed"
        });
    }
};


export const logout = (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }


    req.session.destroy(() => {
      res.redirect("/");
    });
  });
};
