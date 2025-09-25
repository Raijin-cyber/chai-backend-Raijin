import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// following the model from Hitesh Sir: https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        avatar: {
            type: String, // cloudinary url
            required: true,
        },

        coverImage: {
            type: String, // cloudinary url
        },

        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
         
        password: {
            type: String,
            required: [true, ''],
        },

        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

// we avoid writing arrow function in pre or in any other methods, making function using function keyword gives use access to all the fields of our model
userSchema.pre("save", async function(next) { // here we don't pass arrow function because in arrow function we don't have access to this, means their is no context to what we are running this pre-hook
    if(!this.isModified("password")) return next(); // agar password field modified nhi hai to next return kar do

    this.password = bcrypt.hash(this.password, 10);
    next();
})

// we can define custom methods, see the example below
// we injecting methods to our schema
userSchema.methods.isPasswordCorrect = async function (password) { // just like pre-hook has the access to the data before save after save, while upload. Similarly methods also have the to this and we can get the this.password (means the password of the user we are talkign about)
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,    
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,    
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};

export const User = mongoose.model("User", userSchema);
