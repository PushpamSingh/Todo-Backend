import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:[true,"user name is required"],
        lowercase:true,
        unique:true,
        index:true,
    },
    password:{
        type:String,
        required:[true,"password is required"],
        trim:true
    },
    email:{
        type:String,
        required:[true,"email is required"],
        lowercase:true,
        unique:true
    },
    phone:{
        type:String,
        required:[true,"mobile number is required"]
    },
    avatar:{
        type:String, //!Cloudinary url
        required:[true,"avatar is required"]
    },
    refreshToken:{
        type:String
    }

},{timestamps:true})



//! Password hashing here 
userSchema.pre('save',async function(next){
    const user=this;
    if(!this.isModified("password")) return next();

    try {
        const salt=await bcrypt.genSalt(10);
        const hashPass=await bcrypt.hash(user.password,salt);
        user.password=hashPass;
        next()
    } catch (error) {
        next(error);
        throw error;
    }
    
})

//! comparing password
userSchema.methods.comparePassword=async function(userPassword){
    try {
        const isMatch=await bcrypt.compare(userPassword,this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken= function () {
    return jwt.sign (
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model('User',userSchema);
