import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    //get user data from frontend
    //validation - not empty
    //check if user already exists : username or email
    //check for images, check for avatar
    //upload them to cloudinary - avatar
    //create user object in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const {fullName, email, username, password} = req.body
    if(fullName === "" || email === "" || username === "" || password === ""){
        throw new ApiError(400, "All fields are required");
    }

   const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User already exists with this username or email");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    console.log("Files received:", req.files);
    console.log("Avatar path:", avatarLocalPath);

    let avatar = null;
    let coverImage = null;

    if(avatarLocalPath){
        console.log("Uploading avatar to Cloudinary...");
        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("Avatar upload result:", avatar);
    }
    
    if(coverImageLocalPath){
        console.log("Uploading cover image to Cloudinary...");
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        console.log("Cover image upload result:", coverImage);
    }

    const user = await User.create({
        fullName,
        avatar: avatar?.url || "https://via.placeholder.com/150",
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

export {registerUser};