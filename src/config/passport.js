// passport the security guard that looks for the identification
//https://www.passportjs.org/packages/
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
//const User = require("../models/users");

const prisma = new PrismaClient();


//Defines the strategy of authentication (email+password) 
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, //The username is the "email" field
    async (email, password, done) => {
      try {
        //Look for the user in the DB by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return done(null, false); //If it doesnt exist, login fail
        //It compare the password with the saved hash
        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false);
        //If everything is fine, return the user
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

export default passport;