import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
})); 

app.use(express.json({limit: "16kb"})); // to make functionality of accepting JSON type data of max 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"})); // to parse the encoded URLs
app.use(express.static("public")); // to store public data
app.use(cookieParser()); // for performing CRUD operations on cookies in User's browser. 

// routes import 
import router from "./routes/user.routes.js";

// user routes declaration
app.use("/api/v1/users", router);

// http://localhost:8000/api/v1/users/register

export { app };