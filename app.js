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
import { profileDetails } from './database.js';
import { fileURLToPath } from 'url';
import path from 'path'
import { dirname } from 'path';
import ejs from 'ejs';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

//Redirection
app.get('/', (req, res) => {
    res.render('home')
})
app.get('/login', (req, res) => {
    const error = req.query
    console.log(error)
    res.render('login', { error });
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/home', (req, res) => {
    res.render('home');
});
app.get('/HamroChat-home/:id', async (req, res) => {
    const { id } = req.params
    const allUsers = await profileDetails.find({})
    const currentUser = await profileDetails.findOne({ _id: id })

    // if ((Object.keys(req.query).length == 0) == true) {
    if(currentUser.isOnline != true || req.query.email==null){
        await profileDetails.findOneAndUpdate({ _id: id }, { isOnline: true })
        // console.log("data is")
        // console.log(allUsers)
        // console.log(currentUser)
        console.log("User logged in")
        res.render('HamroChat-home', { currentUser, allUsers });
    } else {
        const emailToAdd = req.query.email //email retrieved from form
        console.log("The following email is to be added:")
        console.log(emailToAdd)
        //Check if email is present in the db
        await profileDetails.findOne({ email: emailToAdd })
            .then(async (data) => {
                // check if already exists
                console.log('data after findings')
                console.log(data)
                const currentContacts = currentUser.contacts
                let exist = false;
                for (let x of currentContacts) {
                    console.log(x.email)
                    if (x.email == emailToAdd) {
                        exist = true
                        break
                    }
                }
                console.log(exist)
                await profileDetails.findOneAndUpdate({ _id: data._id }, { $push: { contacts: {email: currentUser.email} }})
                if (exist != true) {
                    //pushing email id to current user's contact
                    await profileDetails.findOneAndUpdate({ _id: id }, { $push: { contacts: {email: emailToAdd} }})
                        .then((d) => {
                            console.log("Contact added successfully")
                            // res.redirect("HamroChat-home/" + id)
                            res.redirect('/HamroChat-home/'+currentUser._id)
                        })
                        .catch(e => {
                            console.log("Contact not added. Error!")
                        })
                }else{
                    console.log("contact already exists")
                    res.redirect('/HamroChat-home/'+currentUser._id)
                }
            })
            .catch(e => {
                console.log("email not found")
                console.log(e)
            })
    }
})
app.get('/HamroChat-user-profile/:id/:id2', async (req, res) => {
    const { id, id2 } = req.params
    const contactUser = await profileDetails.findById({ _id: id2 })
    const currentUser = await profileDetails.findOne({ _id: id })
    res.render('HamroChat-user-profile', { currentUser, contactUser })
})
app.get('/HamroChat-message/:id/:id2', async (req, res) => {
    const { id, id2 } = req.params
    const contactUser = await profileDetails.findById({ _id: id2 })
    const currentUser = await profileDetails.findOne({ _id: id })
    res.render('HamroChat-message', { currentUser })
})
app.get('/change-credentials', (req, res) => {
    res.render('change-credentials')
})
app.get('/contact', (req, res) => {
    res.render('contact')
})
//logout
app.get('/home/:id', async (req, res) => {
    const { id } = req.params
    console.log(id)
    await profileDetails.findOneAndUpdate({ _id: id }, { isOnline: false })
    res.render("home")
})


const CONNECTION_URL = "mongodb+srv://Nishit_Shah:Nishit12345@cluster0.bwxjc.mongodb.net/HamroChat?retryWrites=true&w=majority"


mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(3000, () => console.log("Server connected to 3000")))
    .catch((error) => console.log(error));


app.post("/register", function (req, res) {

    const fName = req.body.first
    const lName = req.body.last
    const email = req.body.email
    const dob = req.body.dob
    const gender = req.body.genders
    const age = req.body.age
    const password = req.body.pass2

    const detailsave = new profileDetails({
        firstName: fName,
        lastName: lName,
        email: email,
        Age: age,
        DOB: dob,
        gender: gender,
        password: password,
        isOnline: false

    })

    detailsave.save();
    res.redirect('login?registration=successful')
})

app.post("/login", (req, res) => {
    const email = req.body.email
    profileDetails.findOne({ email: email })
        .then(data => {
            // console.log(data);
            const pass = req.body.pass
            if (data.password === pass) {
                profileDetails.updateOne({ _id: data._id }, { $set: { isOnline: 'true' } })
                console.log("User logged in. User is now online")
                res.redirect("HamroChat-home/" + data._id)
            }
            else {
                res.redirect("login?login=invalid")
                console.log("Incorrect Password");
            }
        })
        .catch(err => {
            res.redirect("login?login=invalid")
            console.log("User not Found!");
            console.log(err)
        })
});
