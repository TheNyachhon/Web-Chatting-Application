import  mongoose  from "mongoose";
import PassportLocalMongoose from 'passport-local-mongoose';
import findOrCreate from 'mongoose-findorcreate';


const userDetails = mongoose.Schema ({

    firstName:String,
    lastName:String,
    gender:String,
    email:String,
    Age:Number,
    DOB: Date,
    isOnline:Boolean,
    contacts:Array,
    googleId:String,
    password:String,

});
userDetails.plugin(PassportLocalMongoose);
userDetails.plugin(findOrCreate);

export const profileDetails = mongoose.model('userDetail' , userDetails);

