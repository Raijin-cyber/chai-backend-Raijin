import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// from here this is the format which you can copy and paste to any backend services of any app

// this method is to generate Access and Refresh token
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

// method for registering the user
const registerUser = asyncHandler(async(req, res) => {
    // This is our proprietary algorithm 👇🏻

    // get user details from frontend
    // validation on fields example email, password, etc - not empty
    // check if user already exists - username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in DB
    // remove password and refresh token field from response
    // check for creation
    // return response
    
    const {fullName, email, password, username} = req.body;
    if (
        [fullName, email, password, username].some((field) => field?.trim() === '')
    ) {
        throw new ApiError(400, "All fields are required!")
    }

    const existedUser = await User.findOne({
        $or: [{ username: username }, { email: email }]
    })

    if (existedUser) throw new ApiError(409, "User with email or username already exist")

    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) throw new ApiError(400, "Avatar Image is Required");
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) throw new ApiError(400, "Avatar Image is required");

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser) throw new ApiError(500, "Something went wrong while registering the user");

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

// method for logging in the user 
const loginUser = asyncHandler(async(req, res) => {
    // Our proprietary algorithm

    // Get the credentials from the user
    // Validate the credentials - does email feild carrying an actual email address or not.
    // Then check whether the user with provided email adderess and password exist or not.
    // If yes, then, provide the user with new refresh and access tokens and send a message "Successfully LoggedIn". Then redirect the user to the home page (as usual).
    // If not, send a message "Login Failed: Invalid credentials".

    // *** Hitesh Sir's Algorithm ***
    // req body -> data 
    // login the user either using username or email.
    // find the user in the database
    // password check failed, send message password wrong
    // if password check passed, access and refresh token and send it to the user in the form of cookies with a response of "Successfully logged in"

    console.log("This is incoming request from POSTMAN", req.body);
    const {email, username, password} = req.body;

    if(!username && !email) {
        throw new ApiError(400, "username or email is required!");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) throw new ApiError(404, "User does not exist!");

    const isPasswordValid =  await user.isPasswordCorrect(password);

    if(!isPasswordValid) throw new ApiError(401, "Invalid User Credentials");

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200, "")
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged in Successfully"
        )
    )
    
})

// method for logging out the user
const logoutUser = asyncHandler(async(req, res) => {
    // my proprietary algorithm

    // when user pressed the logout button
    // delete all of the cookies stored on his PC
    // delete all of the cookie from our database
    // redirect him to the login page

    // below algorithm doesn't follow above ****

    const userId = req.user._id;
    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

// method for re-generating accessToken if its expired using refreshToken
const refreshAccessToken = asyncHandler(async(req, res) => {
    // user will hit on an API endpoint to run this method
    // motive of this func: re-generate accessToken if expired
    // get user's refreshToken 
    // validate
    // re-generate accessToken
    // send it back in the cookies

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request!");

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);    
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user) throw new ApiError(401, "Invalid Refresh Token!");
    
        if(incomingRefreshToken !== user.refreshToken) throw new ApiError(401, "Refresh Token is expired!");
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const {accessToken: newAccessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("AccessToken", newAccessToken, options)
        .cookie("RefreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken: newAccessToken, refreshToken: newRefreshToken},
                "Access Token Refreshed!"
            )
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Something went wrong!");
    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };