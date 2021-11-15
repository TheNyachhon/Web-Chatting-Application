import  mongoose  from "mongoose";

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
export const profileDetails = mongoose.model('userDetail' , userDetails);

