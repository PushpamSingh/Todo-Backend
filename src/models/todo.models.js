import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const todoSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Title is required"],
    },
    detail:{
        type:String,
        required:[true,"details is required"]
    },
    isCompleted:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Todo=mongoose.model("Todo",todoSchema)