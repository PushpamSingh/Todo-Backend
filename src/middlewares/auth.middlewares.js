import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
dotenv.config();

export const VerifyJWT=async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ","")
        if(!token){
            throw new ApiError(404,"Token Not found")
        }
        const decodeToken=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const user=await User.findById(decodeToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(400,"UnAuthorized user not logged in")
        }
        req.user=user;
        next()
    } catch (error) {
        console.log("VerifyJWT :: Error :: ",error);
        next(error);
        throw new ApiError(505,"Internal server error in jwt")
    }
}