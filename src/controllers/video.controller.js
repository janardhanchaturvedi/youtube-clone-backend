import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return new ApiError("400", "All field are required");
    }

    const thumbnailPath = req.files?.thumbnail[0]?.path;
    const videoPath = req.files?.video[0]?.path;

    if (!videoPath || !thumbnailPath) {
        return new ApiError("400", "Please upload video and upload");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailPath);
    const video = await uploadOnCloudinary(videoPath);

    
    const uploadedVideo = await Video.create({
        title,
        description,
        thumbnail: thumbnail?.url,
        videoFile: video?.url,
        owner: req?.user?._id,
        duration : video?.duration
    });

    if(!uploadedVideo) {
        return new ApiError("500" , "Something went wrong")
    }

    return res.status(200).json(new ApiResponse(200 ,uploadedVideo , "Video Uploaded Sucesfully" ))
});

export {
    uploadVideo
};
