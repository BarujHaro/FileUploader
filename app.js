import express from "express"; 
import path from "node:path";  
import { fileURLToPath } from 'node:url';  
import 'dotenv/config';  
import session from "./src/config/session.js";
import passport from "./src/config/passport.js";

import authRoutes from './src/routes/authRoutes.js';
import fileRoutes from './src/routes/fileRoutes.js';
import folderRoutes from './src/routes/folderRoutes.js';

//const messagesRouter = require("./src/routes/messageRoutes");
//const usersRouter = require("./src/routes/userRoutes");

const app = express();    

// Config of simulated __dirname in moduleES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//app.use(session({ secret: process.env.SESSION_KEY, resave: false, saveUninitialized: false }));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
 
app.set("view engine", "ejs");  
app.set('views', path.join(__dirname, 'src', 'views'));

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.get('/', (req, res) => {
    try{
    
        res.render("index", {
            title: "File uploader",
            error: null
        });

    }catch(error){
        res.status(500).render("index", {
            title: "File uploader",
            error: "Error in the server"
        });
    }
}); 

app.use('/auth', authRoutes);
app.use('/file', fileRoutes);
app.use('/folder', folderRoutes);

app.get('/', (req, res) => {
  res.render('index', { 
    title: 'File Uploader'
  });
});

// 404 ERROR
app.use((req, res) => {
  res.status(404).render('partials/error', {
    title: 'Error',
    status: 404,
    message: 'Page not found',
    details: `The route "${req.originalUrl}" does not exist`
  });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {   
  if (error) {
    throw error;
  }
  console.log(`Express app listening on port ${PORT}!`);
});