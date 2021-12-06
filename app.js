import dotenv from 'dotenv';
dotenv.config();
import express, { query } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import GStrategy from 'passport-google-oauth20';
import { profileDetails } from './database.js';
import { fileURLToPath } from 'url';
import path from 'path'
import { dirname } from 'path';
import ejs from 'ejs';
import { formatMessage } from './messages.js';

var GoogleStrategy = GStrategy.Strategy;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:false
}));


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
            .emit('message', formatMessage(botName, 'User has joined the chat!'));
        //Listen for chat message
        socket.on('chatMessage', msg => {
            socket.to(room).emit('message', formatMessage(id1, msg))
        });

        //Runs when client disconnects
        socket.on('disconnect', () => {
            io.to(room).emit('message', formatMessage(botName, 'User has left the chat!'))
        });
    })
})

server.listen(3000, () => {
    console.log("Listening on port 3000");
})
app.use(passport.initialize());
app.use(passport.session());

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

passport.use(profileDetails.createStrategy());
passport.serializeUser(function(user,done)
{
    done(null, user.id);
});

passport.deserializeUser(function(id,done){
    profileDetails.findById(id, function(err,user)
    {
        done(err,user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENTID,
    clientSecret: process.env. CLIENTSECRET,
    callbackURL: "http://localhost:3000/auth/google/profile",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
 },
 function(accessToken, refreshToken, profile,cb) {
    console.log(profile);
    profileDetails.findOrCreate({googleId : profile.id}, function (err, user){
        return(cb,user)
    });
  }
));
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

app.get('/auth/google', passport.authenticate('google',{scope:['profile']}));

app.get('/auth/google/profile', passport.authenticate('google', {failureRedirect:"/login"}),
async function(req,res){
    const currentUser = await profileDetails.findOne({_id:id})
    console.log(currentUser);
    res.redirect("/HamroChat-home/"+currentUser.id)
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
});

app.get('/HamroChat-home/:id', function(req,res){
    const { id } = req.params;
    
    if(req.isAuthenticated())
    {
        res.redirect('/HamroCHAT-home/' + id)
    }
    else
    {
        res.redirect("/login")
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
//Changing credentials
app.get('/change-credentials/:id',async (req, res) => {
    const { id } = req.params
    const currentUser = await profileDetails.findOne({ _id: id })
    res.render('change-credentials',{currentUser})
})
app.post('/change-credentials/:id',async (req, res) => {
    const { id } = req.params
    const newPass = req.body.pass2
    console.log('here')
    await profileDetails.findOneAndUpdate({ _id: id },{password:newPass})
    await profileDetails.findOneAndUpdate({ _id: id }, { isOnline: false })
        .then(d => {
            res.redirect('/home?passwordChange=successful')
        })
    // res.render('change-credentials',{currentUser})
})
app.get('/contact/:id', async(req, res) => {
    const { id } = req.params
    const currentUser = await profileDetails.findOne({ _id: id })

    res.render('contact',{currentUser})
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
    profileDetails.register({username:req.body.email}, req.body.pass2, function(err,user)
    {
        if(err)
        {
            console.log(err);
            res.redirect("/register");
        }
        else
        {
            passport.authenticate("local") (req,res,function(){
                res.redirect('login?registration=successful')
            });
        }
    });
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
        // const user = new profileDetails({
        //     email:req.body.email,
        //     password: req.body.pass
        // });
        // console.log(req.body.email);
        // console.log(req.body.pass);
        // req.login(user, function(err)
        // {
        //     if(err){
        //         console.log(err);
        //     }
        //     else
        //     {
        //         passport.authenticate("local")(req,res,function()
        //         {
        //             profileDetails.findOne({ email: email })
        //                 .then(data => {
        //                     console.log(data);
        //                     const pass = req.body.pass
        //                     if (data.password === pass) {
        //                         profileDetails.updateOne({ _id: data._id }, { $set: { isOnline: 'true' } })
        //                         console.log("User logged in. User is now online")
        //                         res.redirect("HamroChat-home/" + data._id)
        //                     }
        //                 })
        //         })
        //     }
        // 

