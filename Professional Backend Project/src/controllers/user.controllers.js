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
    console.log(req.body);

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
    const existedUser = await User.findOne({
        $or: [{username} , {email}]
    });

    if(existedUser){
        throw new ApiError(409 , "User with this Email or Username Already Exists");
    }



    // Upload Files on Cloudinary
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
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
    const createdUser = await User.findById(user._id).select(
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

const loginUser = asyncHandler(async(req , res) => {

    // Get username and password entered by user
    // check username or email entered or not
    // access user details from the database
    // find the user in db
    // check password
    // if user exists , generate access and refresh tokens
    // send this tokens in cookies
    // send succeefuuly login message


    // 1) Get data entered by the user
    const {email , username , password} = req.body;

    // 2) Check fields empty or not
    if(!username && !email){
        throw new ApiError(400 , "Username or Email is required");
    }


    // 3) Check User exists or not
    const existedUser = await User.findOne({
        $or: [{username} , {email}]
    });

    if(!existedUser){
        throw new ApiError(404 , "User does not exists, register the user first");
    }


    // check the password if user exists
    const isPasswordValid = await existedUser.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401 , "Password is incorrect");
    }


    // if password correct, generate tokens
    const accessToken = await existedUser.generateAccessToken();
    const refreshToken = await existedUser.generateRefreshToken();

    // save refresh token in db to verify later and generate access token
    existedUser.refreshToken = refreshToken;
    await existedUser.save({validateBeforeSave: false});           // validatebeforesave: skips re-hashing password again before saving


    // sending tokens and response
    const loggedInUser = await User.findById(existedUser._id).select(
        "-password -refreshToken"
    );

    
    const options = {
        httpOnly: true,
        secure: true
    };

    res.status(200).cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(201 , 
            {
                user: accessToken , refreshToken , loggedInUser
            },
            
            "User LoggedIn Successfully")
    );

});


const logoutUser = asyncHandler(async(req , res) => {

    // 
});


export {registerUser , loginUser , logoutUser};