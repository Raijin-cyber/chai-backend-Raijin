import dotenv from 'dotenv'
import connectDB from "./db/index.js";


dotenv.config(
    {
        path: './env'
    }
);

connectDB();


/*
import express from "express";
const app =  express();

// creating an IFEE -> immediately execute that function
( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        
        // if there is an error while connection then throw that error
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        })

        // listening for connections on -- -- PORT
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error);
        throw error;
    }
})()
*/