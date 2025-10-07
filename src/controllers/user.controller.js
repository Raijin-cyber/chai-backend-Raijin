import { asyncHandler } from "../utils/asyncHandler.js";

// from here this is the format which you can copy and paste to any backend services of any app

// method for registering the user
const registerUser = asyncHandler( async(req, res) => {
    res.status(200).json(
        {
            message: "Hello Ujjwal Sharma, this message is coming from the backend server which you have just created",
        }
    )
} )

export { registerUser };