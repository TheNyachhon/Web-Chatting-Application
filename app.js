require('dotnev').config()
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import PassportLocalMongoose from 'passport-local-mongoose';
const GoogleStrategy = require ('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app = express();
app.use(express.urlencoded({extended:true}))
