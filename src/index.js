import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';


dotenv.config(
    {
        path: './.env'
    }
);


// since connectDB method was an async method that's it will return a promise hence we will tackle it with .then and .catch
connectDB()
    .then(() => {
        // if there is an error while connection then throw that error
        app.on("error", (error) => {
            console.log(`Server failed to connect :: error :: ${error}`);
        })

        // listening for connections on -- -- PORT
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at PORT: ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log("!! MONGO DB connection failed !! :: ", error);
    })

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