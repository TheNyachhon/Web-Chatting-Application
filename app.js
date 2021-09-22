require('dotnev').config()
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import passport from 'passport';
import mongoose  from 'mongoose';
import session from 'express-session';
import PassportLocalMongoose from 'passport-local-mongoose';
const GoogleStrategy = require ('passport-google-oauth20').Strategy


const app = express();

app.use (session ({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:false
}));