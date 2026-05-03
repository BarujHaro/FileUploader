//Ticket for each identifiction

//This is how the server "remembers" the users, Express saves the sessions in the RAM

const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = session({
  secret: process.env.SESSION_SECRET,       // A secret phrase to sign the cookie session
  resave: false,                            // It doesnt save the session until new changes
  saveUninitialized: false,                 // It doesnt create a session until the user is logged
                                            // It says to Express to save the sessions in the DB using Prisma
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 5 * 60 * 1000,             // It cleans the expired sessions each 5 minutes       
  }),
}); 
