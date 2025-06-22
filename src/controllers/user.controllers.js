import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../utils/uploadoncloudinary.js";
import { deleteCloudinary } from "../utils/deletefromcloudiary.js";
import { User } from "../models/user.models.js";
import { isValidObjectId } from "mongoose";

const generateAccessandRefreshToken=async(userID)=>{
    try {
        const user=await User.findById(userID);
        if(!user){
            throw new ApiError(404,"user not found")
        }
        // console.log("user in generate token: ",user);
        
        const accessToken= user.generateAccessToken();
        const refreshToken= user.generateRefreshToken();

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        //    console.log("accesstoken: ",accessToken);
        // console.log("refreshtoken: ",refreshToken);
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
        // const avatarLocalPath=req.files?.avatar[0]?.path;
        const avatarLocalPath=req.file?.path;

        if(!avatarLocalPath){
            throw new ApiError(400,`avatar is required:- ${avatarLocalPath}`)
        }

        const avatarUploaded = await uploadCloudinary(avatarLocalPath);
        if(!avatarUploaded){
            throw new ApiError(500,"Cloudinary error failed to upload avatar")
        }

        const user = await User.create({
            username:username.toString().toLowerCase().trim(),
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
        const {email,password}=req.body;
        if([email,password].some((data)=>data?.trim==="")){
            throw new ApiError(400,"The provided data is missing or not valid")
        }
        // console.log("Password: ",password);
        
        const user=await User.findOne({email})
        if(!user){
            throw new ApiError(404,"user not found goto sign up page")
        }
        // console.log("user: ",user);
        
        const isPasswordMatch=await user.comparePassword(password);

        if(!isPasswordMatch){
            throw new ApiError(402,"Password is incorrect")
        }

        const {accessToken,refreshToken}=await generateAccessandRefreshToken(user._id);

      
        
        const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
        if(!loggedInUser){
            throw new ApiError(500,"Internal Server Error")
        }
        const options={
            httpOnly:true,
            secure:false
        }
        return res.status(200)
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

const logout=asyncHandler(async(req,res)=>{
    try {
        //!find the user and set refreshToken null
        //!return response in cookie

        await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    refreshToken:null
                }
            },
            {
                new:true
            }
        )
        const options={
            httpOnly:true,
            secure:true
        }
        return res
        .status(200)
        .cookie("accessToken",options)
        .cookie("refreshToken",options)
        .json(
            new ApiResponse(
                300,
                {},
                "user log out successfuly"
            )
        )
    } catch (error) {
        res.status(500).json({
            message:`${error}`
        })
    }
})

const getcurrentuser=asyncHandler(async(req,res)=>{
    try {
        return res.status(200).json(
            new ApiResponse(200,req.user,"current user fetched successfuly")
        )
    } catch (error) {
        res.status(500).json(
            {
                message:`${error}`
            }
        )
    }
})

const changePassword=asyncHandler(async(req,res)=>{
    try {
        //!get the data from req.body 
        //!validate both the fields
        //!check the user is exist or not
        //!check oldPassword is matches or not
        //!set new password
        const {oldPassword,newPassword}=req.body;
        const userID=req.user?._id;
        if(!(oldPassword || newPassword)){
            throw new ApiError(400,"Both the fields are required")
        }
        if(!isValidObjectId(userID)){
            throw new ApiError(409,"User unAuthorized or invalid userID")
        }
        const user=await User.findById(userID);
        if(!user){
            throw new ApiError(404,"User not found")
        }
        const isPasswordMatch=await user.comparePassword(oldPassword);
        if(!isPasswordMatch){
            throw new ApiError(400,"Old Password is not matched")
        }

        user.password=newPassword;
        await user.save({validateBeforeSave:false})

        return res.status(200).json(
            new ApiResponse(200,user,"Password changed successfuly")
        )
    } catch (error) {
          res.status(500).json(
            {
                message:`${error}`
            }
        )
    }
})

const updateUserDetailes=asyncHandler(async(req,res)=>{
    try {
        //!get username email from req.body
        //!validate both the field
        //!get the avatar local path from req.file?.avatar[0].path
        //!delete oldavatar from and cloudinary and upload new one
        //!create a database call for user existance and update the detailes
        //! return the response
        const {username,email}=req.body;
        const userID=req.user?._id;
        
        if(!(username || email)){
            throw new ApiError(400,"username or email is required")
        }

        // console.log("Username, email: ",username,email);
        
        if(!isValidObjectId(userID)){
            throw new ApiError(401,"Invalid userID or unAuthorized user")
        }

        const avatarLocalPath=req.file?.path;
        if(!avatarLocalPath){
            throw new ApiError(404,"avatar is required here");
        }
        const user=await User.findById(userID);
         if(!user){
            throw new ApiError(404,"user not found");
         }
         const deleteAvatarCloudinary=await deleteCloudinary(user?.avatar);
         if(!deleteAvatarCloudinary){
            throw new ApiError(500,"cloudinary Error !! failed to delete avatar")
         }
         const uploadoncloudinary=await uploadCloudinary(avatarLocalPath);
         if(!uploadoncloudinary){
             throw new ApiError(500,"cloudinary Error !! failed to upload avatar")
         }
         const upadtedUser=await User.findByIdAndUpdate(
            userID,
            {
                username,
                email,
                avatar:uploadoncloudinary?.url || ""
            },
            {
                new:true
            }
         )

         if(!upadtedUser){
            throw new ApiError(503,"DataBase Error !! failed to update user Detailes")
         }

         return res.status(200)
         .json(
            new ApiResponse(200,upadtedUser,"user detailes updated successfuly")
         )

    } catch (error) {
         res.status(500).json(
            {
                message:`${error}`
            }
        )
    }
})

export {
    registerUser,
    login,
    logout,
    getcurrentuser,
    changePassword,
    updateUserDetailes
}