import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import PassportLocalMongoose from 'passport-local-mongoose';
// const GoogleStrategy = require ('passport-google-oauth20').Strategy;
// const findOrCreate = require('mongoose-findorcreate');
import { profileDetails, RContacts, NContacts } from './database.js';
import { fileURLToPath } from 'url';
import path from 'path'
import {dirname} from 'path';
import ejs from 'ejs';


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')))

//view engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'))

//Redirection
app.get('/',(req,res)=>{
    res.render('home')
})
app.get('/login',(req,res)=>{
    res.render('login');
});
app.get('/register',(req,res)=>{
    res.render('register');
});
app.get('/home',(req,res)=>{
    res.render('home');
});
app.get('/HamroChat-home',(req,res)=>{
    res.render('HamroChat-home');
})
app.get('/HamroChat-user-profile',(req,res)=>{
    res.render('HamroChat-user-profile')
})
app.get('/HamroChat-message',(req,res)=>{
    res.render('HamroChat-message')
})
app.get('/change-credentials',(req,res)=>{
    res.render('change-credentials')
})
app.get('/contact',(req,res)=>{
    res.render('contact')
})


const CONNECTION_URL =  "mongodb+srv://Nishit_Shah:Nishit12345@cluster0.bwxjc.mongodb.net/HamroChat?retryWrites=true&w=majority"


mongoose.connect(CONNECTION_URL, {useNewUrlParser:true, useUnifiedTopology:true})
       .then(() => app.listen (3000, () => console.log("Server connected to 3000")))
       .catch((error) => console.log(error));


app.post("/register", function(req,res){

    const fName = req.body.first
    const lName = req.body.last
    const email = req.body.email
    const dob = req.body.dob
    const gender = req.body.genders
    

    const age = req.body.age
    const password = req.body.pass2

    const detailsave = new profileDetails ({
          firstName:fName,
          lastName:lName,
          email:email,
          Age:age,
          DOB:dob,
          gender:gender,
          password:password,
          isOnline:false

    })

    detailsave.save();
})

app.post("/login", function(req,res){

    const email = req.body.email
    profileDetails.findOne({email:email}, function(err, dataFound){
        if(!err)
        {
            console.log(dataFound);
             const pass = req.body.pass
             if (dataFound.password === pass)
             {
                res.render("HamroChat-home")
            }
            else{
                    console.log("Incorrect Password");
            }

        }
        else{
            console.log("User not Found!");
        }
    })
})

