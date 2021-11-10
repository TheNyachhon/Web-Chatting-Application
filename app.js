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
import {dirname} from 'path';



const app = express();
app.use(express.urlencoded({extended:true}))
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static("public"));

const CONNECTION_URL =  "mongodb+srv://Nishit_Shah:Nishit12345@cluster0.bwxjc.mongodb.net/HamroChat?retryWrites=true&w=majority"


mongoose.connect(CONNECTION_URL, {useNewUrlParser:true, useUnifiedTopology:true})
       .then(() => app.listen (3000, () => console.log("Server connected to 3000")))
       .catch((error) => console.log(error));

app.get("/", function(req,res)
{
    res.sendFile(__dirname + "/home.html")
})

app.get("/register", function(req,res)
{
    res.sendFile(__dirname + "/register.html")
})

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

    })

    detailsave.save();
})

