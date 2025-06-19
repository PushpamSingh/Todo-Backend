import { app } from "./app.js";
import dotenv from "dotenv";
import { dbConnect } from "./db/db.js";
// import { ApiError } from "./utils/ApiError";
dotenv.config()

const port=process.env.PORT;
dbConnect().then(()=>{
    app.listen(port,()=>{
        console.log("App is listing on port ",port);
    })
}).catch((err)=>{
    console.log("MongoConnection :: Error:: ",err);
   throw err
})

