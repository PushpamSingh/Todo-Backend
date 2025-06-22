import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs"
dotenv.config();
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_APIKEY,
    api_secret:process.env.CLOUD_SECRET
})
export const uploadCloudinary=async(filepath)=>{
    try {
        if(!filepath){
            return ""
        }
        //! uploading on cloudinary
        const response = await cloudinary.uploader.upload(filepath,{
            resource_type:"auto"
        })
        // console.log("Response from upload cloudinary: ",response);
        fs.unlinkSync(filepath);
        return response;
    } catch (error) {
        console.log("Cloudinary upload :: Error :: ",error)
        fs.unlinkSync(filepath)
        throw error;
    }
}