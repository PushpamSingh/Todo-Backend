import mongoose from "mongoose";
// import { ApiError } from "../utils/ApiError";
import dotenv from "dotenv"
import { DB_CONSTANT } from "../constant.js";
dotenv.config()


export const dbConnect=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_ATLAS_URL}/${DB_CONSTANT}`)
        console.log("MongoDB Connect Succesfuly !! host: ",connectionInstance.connection.host);
        
    } catch (error) {
        console.log("MongoConnection :: Error:: ",error);
        throw error;
    }
}