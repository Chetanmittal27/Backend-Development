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
    const avatarLocalPath = Array.isArray(req.files?.avatar) && req.files.avatar.length > 0 ? req.files.avatar[0].path : undefined;
    const coverImageLocalPath = Array.isArray(req.files?.coverImage) && req.files.coverImage.length > 0 ? req.files.coverImage[0].path : undefined;

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar is required");
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

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },

        {
            new: true
        }
    )


    const options = {
        httpOnly: true,
        secure: true
    }


    res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(200 , {} , "User Logged Out Successfully")
    )
});


const refreshAccessToken = asyncHandler(async (req , res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401 , "Unauthorised Request");
    }

    const decodedToken = await jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if(!user){
        throw new ApiError(401 , "Invalid Refresh Token");
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401 , "Refresh token is not latest or expired");
    }


    const newAccessToken = await user.generateAccessToken();

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(201)
    .cookie("accessToken" , newAccessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(201 , {newAccessToken , refreshToken} , "Access Token Refreshed")
    );


});


const changeCurrentPassword = asyncHandler(async (req , res) => {

    const {oldPassword , newPassword} = req.body;

    if(
        [oldPassword , newPassword].some((field) => 
            field?.trim() === "")
     ) {
            throw new ApiError(400 , "All fields are required");
        }

    const user = await User.findById(req.user?._id);
    
    const checkPassword = await user.isPasswordCorrect(oldPassword);

    if(!checkPassword){
        throw new ApiError(400 , "Old Password is incorrect");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200)
    .json(
        new ApiResponse(200 , {} , "Password Changed Successfully")
    );

});


const updateAccountDetails = asyncHandler(async (req , res) => {

    const {fullName , email} = req.body;

    if(!fullName || !email){
        throw new ApiError(400 , "Full Name and Email is Required");
    };

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },

        {new:true}

    ).select(
        "-password -refreshToken"
    )

    // if(!user){
    //     throw new ApiError(404 , "User with given id does not exist");
    // };

    // user.fullName = fullName;
    // user.email = email;

    await user.save({validateBeforeSave: false});

    return res.status(200)
    .json(
        new ApiResponse(200 , user , "FullName and Email updated Successfully")
    );


});


const updateUserAvatar = asyncHandler(async (req , res) => {

    const newAvatarLocalPath = Array.isArray(req.file?.avatar) && req.file.avatar.length > 0 ? req.file.avatar.path : undefined;

    if(!newAvatarLocalPath){
        throw new ApiError(400 , "Avatar is required");
    };

    const newAvatar = await uploadOnCloudinary(newAvatarLocalPath);

    if(!newAvatar.url){
        throw new ApiError(400 , "Problem in uploading avatar on cloudinary");
    };


    const user = await User.findByIdAndUpdate(
        req.user?._id,

        {
            $set: {
                avatar: newAvatar.url
            }
        },

        {new: true}
    ).select(
        "-password -refreshToken"
    );


    return res.status(200)
    .json(
        new ApiResponse(200 , user , "Avatar Updated Successfully")
    );

    
});


export {registerUser , loginUser , logoutUser , refreshAccessToken , changeCurrentPassword , updateAccountDetails , updateUserAvatar};