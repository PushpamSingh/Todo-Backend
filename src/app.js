import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();

export const app=express()

app.use(
    cors(
        {
            origin:process.env.CORS_ORIGIN,
            optionsSuccessStatus:204,
            credentials:true
        }
    )
)
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb",extended:true}))
app.use(express.static("public"))
app.use(cookieParser())