import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "./../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, fullName, password } = req.body;

    if (
        [userName, email, fullName, password].some(
            (fields) => fields?.trim == ""
        )
    ) {
        throw new ApiError(400, "All field is required");
    }

    const existingUser = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (existingUser) {
        throw new ApiError(409, "User already Exits");
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    const user = await User.create({
        fullName,
        avatar: avatar?.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    });


    const createdUser = await User.findById(user?._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered sucessfully"));
});

export { registerUser };
