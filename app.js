require('dotnev').config()
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import PassportLocalMongoose from 'passport-local-mongoose';
const GoogleStrategy = require ('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

// const express = require('express');
// const path = require('path');

const app = express();
app.use(express.urlencoded({extended:true}))


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


app.listen(3000,()=>{
    console.log("Listening on port 3000");
})