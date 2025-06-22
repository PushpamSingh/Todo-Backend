import mongoose from "mongoose";
import dotenv from "dotenv";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
dotenv.config();
const todoSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Title is required"],
    },
    description:{
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
mongoose.plugin(mongooseAggregatePaginate)
export const Todo=mongoose.model("Todo",todoSchema)