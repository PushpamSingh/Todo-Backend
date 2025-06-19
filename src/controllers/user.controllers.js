import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../utils/uploadoncloudinary.js";
import { User } from "../models/user.models.js";

const generateAccessandRefreshToken=async(userID)=>{
    try {
        const user=await User.findById(userID);
        if(!user){
            throw new ApiError(404,"user not found")
        }
        const accessToken=await user.generateAccessToken();
        const refreshToken=await user.generateRefreshToken();

        user.refreshToken=refreshToken;
        user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Internal server from generateAccessAndRefreshToken")
    }
}
const registerUser=asyncHandler(async(req,res)=>{
    try {
        //! get the data from req.body
        //!validate the data and user already exist or not
        //!find avatar local path from req.files.avatar[0].path
        //!upload avatar on cloudinary and check successfully uploaded
        //!create a database call for create new document for this user
        //!save the data in data base and return response

        const {username,password,email,phone}=req.body;

        if([username,password,email,phone].some((data)=>data.trim==="")){
            throw new ApiError(400,"The provided data is not valid or missing some fields")
        }
        const existUser=await User.findOne({
            $or:[{email},{username}]
        })

        if(existUser){
            throw new ApiError(409,"User alresdy exists go to login page")
        }
        const avatarLocalPath=req.files?.avatar[0]?.path;

        if(!avatarLocalPath){
            throw new ApiError(400,"avatar is required")
        }

        const avatarUploaded = await uploadCloudinary(avatarLocalPath);
        if(!avatarUploaded){
            throw new ApiError(500,"Cloudinary error failed to upload avatar")
        }

        const user = await User.create({
            username:username.toLowerCase(),
            password,
            email,
            phone,
            avatar:avatarUploaded?.url || "",
        })
        await user.save({validateBeforeSave:false});

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if(!createdUser){
            throw new ApiError(503,"DataBase Error User not created !! Internal server error")
        }
        return res.status(201).json(
            new ApiResponse(200,createdUser,"User Register completed successfuly")
        )
    } catch (error) {
        res.status(500).json(
            {
                message:`${error}`
            }
        )
    }
})

const login=asyncHandler(async(req,res)=>{
    try {
        //!get the data from req.body
        //!validate all the data and check for not existed user
        //!create a dataBase call and compare the password
        //!generate accessToken and refreshToke
        //!send the response
        const {username,email,password}=req.body;
        if([username,email,password].some((data)=>data?.trim==="")){
            throw new ApiError(400,"The provided data is missing or not valid")
        }

        const user=await User.findOne({
            $or:[{username},{email}]
        })
        if(!user){
            throw new ApiError(404,"user not found goto sign up page")
        }
        const isPasswordMatch=await user.comparePassword(password);

        if(!isPasswordMatch){
            throw new ApiError(402,"Password is incorrect")
        }

        const {accessToken,refreshToken}=generateAccessandRefreshToken(user._id);

        const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
        if(!loggedInUser){
            throw new ApiError(500,"Internal Server Error")
        }
        const options={
            httpOnly:true,
            secure:true
        }
        return res
        .status(201)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                user:loggedInUser,accessToken,refreshToken
                },
                "User log in successfuly"
            )
        )

    } catch (error) {
        res.status(500).json({
            message:`${error}`
        })
    }
})