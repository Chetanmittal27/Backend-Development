import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req , res) => {
    // get user details from frontend
    // validation (right now we check only one validation - not empty)
    // if user already exists or not (check using username and email)
    // check for images or avatar 
    // upload them on cloudinary, avatar
    // create user object - user entry in db
    // remove password and refresh token from the response
    // check for user creation 
    // return user


     // 1) Get user details from the frontend
    const {fullName, username, email, password} = req.body;
    console.log("email:" , email);

    // 2) Validation
    if(fullName === ""){
        throw new ApiError(400 , "FullName is Required Field");
    }

    if(
        [fullName, username, email, password].some((field) => 
            field?.trim() === "")
        ) {
            throw new ApiError(400 , "All Fields are required");
        }


    
    // 3) Checking user already exists or not
    const existedUser = User.findOne({
        $or: [{username} , {email}]
    });

    if(existedUser){
        throw new ApiError(409 , "User with this Email or Username Already Exists");
    }



    // Upload Files on Cloudinary
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(404 , "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400 , "Avatar file is required");
    }



    // Create entry of user in DB
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    })


    // check user created or not
    if(!user){
        throw new ApiError(500 , "User not created");
    }



    // remove password and refreshToken from the response
    const createdUser = User.findById(user._id).select(
        "-password -refreshToken"
    );


    if(!createdUser){
        throw new ApiError(500 , "Something went wrong while registering the user");
    }


    // return response
    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User Registered Successfully")
    )
});


export {registerUser};