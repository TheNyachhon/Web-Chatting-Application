import dotenv from 'dotenv';
dotenv.config();
import express, { query } from 'express';
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
import { formatMessage } from './messages.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))


// SOCKET.IO
import { createServer } from "http";
import { Server } from "socket.io";
const server = createServer(app);
const io = new Server(server)

const botName = 'HamroChat bot'

//Run when client connects
io.on('connection', socket => {
    console.log("new WS connection");
    // listening for createRoom
    socket.on('createRoom', ({ id1, id2 }) => {
        let sum1 = 0     //sum for current user
        let sum2 = 0    //sum for contact user 
        for (let x of id1) {
            let num = parseInt(x)
            if (num) {
                sum1 += num
            }
        }
        for (let x of id2) {
            let num = parseInt(x)
            if (num) {
                sum2 += num
            }
        }
        console.log(sum1)
        console.log(sum2)
        let room
        if (sum1 > sum2) {
            room = id1 + id2
        } else {
            room = id2 + id1
        }
        console.log('room is ' + room)

        //joining room
        socket.join(room)

        //Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to the chat app!'));

        //Broadcast when a user connects
        //broadcasts to everyone except the use thats connecting
        socket.broadcast
            .to(room)
            .emit('message', formatMessage(botName, 'user has joined the chat'));
        //Listen for chat message
        socket.on('chatMessage', msg => {
            io.to(room).emit('message', formatMessage('User', msg))
        });

        //Runs when client disconnects
        socket.on('disconnect', () => {
            io.to(room).emit('message', formatMessage(botName, 'A user has left the chat'))
        });
    })



    // socket.on('createRoom', id => {
    //     console.log('here')
    //     console.log(id)
    //     let sum1 = 0, sum2 = 0;
    //     let next = false;
    //     for (let x of id) {
    //         if (x == ',') {
    //             next = true;
    //         } else {
    //             if (next == false) {
    //                 let num = parseInt(x)
    //                 if (num) {
    //                     sum1 = sum1 + num
    //                 }
    //             } else {
    //                 let num = parseInt(x)
    //                 if (num) {
    //                     sum2 = sum2 + num
    //                 }
    //             }
    //         }
    //     }
    //     console.log(sum1)
    //     console.log(sum2)

    // })

})

server.listen(3000, () => {
    console.log("Listening on port 3000");
})

// Connecting database
const CONNECTION_URL = "mongodb+srv://Nishit_Shah:" + process.env.pass + "@cluster0.bwxjc.mongodb.net/HamroChat?retryWrites=true&w=majority"

mongoose.connect(CONNECTION_URL)
    .then(() => {
        console.log("Connection open!!");
    })
    .catch(err => {
        console.log("Connection failed!: ");
        console.log(err);
    })
// mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => app.listen(3000, () => console.log("Server connected to 3000")))
//     .catch((error) => console.log(error));


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
    if (currentUser.isOnline != true || req.query.email == null) {
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
                await profileDetails.findOneAndUpdate({ _id: data._id }, { $push: { contacts: { email: currentUser.email } } })
                if (exist != true) {
                    //pushing email id to current user's contact
                    await profileDetails.findOneAndUpdate({ _id: id }, { $push: { contacts: { email: emailToAdd } } })
                        .then((d) => {
                            console.log("Contact added successfully")
                            // res.redirect("HamroChat-home/" + id)
                            res.redirect('/HamroChat-home/' + currentUser._id)
                        })
                        .catch(e => {
                            console.log("Contact not added. Error!")
                        })
                } else {
                    console.log("contact already exists")
                    res.redirect('/HamroChat-home/' + currentUser._id)
                }
            })
            .catch(e => {
                console.log("email not found")
                res.redirect('/HamroChat-home/' + currentUser._id)
                // console.log(e)
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
    res.render('HamroChat-message', { currentUser, contactUser })
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
        .then(d => {
            res.redirect('/home?logout=successful')
        })
    // res.render("home")
})


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



// io.on('connection',socket =>{
//     socket.on('new-user-joined',name=>{
//         user[socket.id] = name;
//         socket.broadcast.emit('user-joined');
//     })
//     socket.on('send',message=>{
//         socket.broadcast.emit('receive',{message:message,name:user[socket.id]})
//     })
// })