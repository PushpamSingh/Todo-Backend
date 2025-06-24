import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";
import fs from 'fs'
dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_APIKEY,
    api_secret:process.env.CLOUD_SECRET
})

export const deleteCloudinary=async(filepath)=>{
    try {
        if(!filepath){
            throw new ApiError(400,"file url not found")
        }
        //? find file public id
        const pathArray=filepath.split("/");
        const pathIDArray=pathArray[pathArray.length-1].split(".");
        const publicId=pathIDArray[0];

        const resourcetype="image";
        if(filepath.includes("/video/")){
            resourcetype="video";
        }

        //! delete from cloudinary
        const response=await cloudinary.uploader.destroy(publicId,{
            resource_type:resourcetype
        })
        if(response?.result!=='ok' && response?.result!=="not found"){
            throw new ApiError(500,"failed to delete file")
        }
        // fs.unlinkSync(filepath)
        
        //    console.log("Response from delete cloudinary: ",response);
           return response;
    } catch (error) {
        // console.log("Cloudinary delete :: Error :: ",error)    
        // fs.unlinkSync(filepath)
        throw error;
    }
}
