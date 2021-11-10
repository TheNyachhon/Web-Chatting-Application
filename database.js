import  mongoose  from "mongoose";

const userDetails = mongoose.Schema ({

    firstName:String,
    lastName:String,
    gender:String,
    email:String,
    Age:Number,
    DOB: Date,
    googleId:String,
    password:String,

});

const RujinContacts = mongoose.Schema ({

    name:String,
    email:String,

});

const NishitContacts = mongoose.Schema ({
    name:String,
    email:String
})

export const profileDetails = mongoose.model('userDetail' , userDetails);
export const RContacts = mongoose.model('RujinContacts', RujinContacts);
export const NContacts = mongoose.model('NishitContacts', NishitContacts)

