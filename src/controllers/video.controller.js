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
        duration: video?.duration,
    });

    if (!uploadedVideo) {
        return new ApiError("500", "Something went wrong");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, uploadedVideo, "Video Uploaded Sucesfully"));
});

const getAllVideo = asyncHandler(async (req, res) => {
    const { limit = 10, page = 0, search } = req?.query;
    const skip = page * limit;
    const [allVideos, videosCount] = await Promise.all([
        Video.find({
            title: { $regex: search, $options: "i" },
        })
            .skip(skip)
            .limit(limit),
        Video.countDocuments(),
    ]);

    if (!allVideos || !videosCount) {
        return new ApiError(500, "Something weng wrong");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { allVideos, videosCount },
                "Video Fetched Successfully"
            )
        );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        return new ApiError("401", "Please enter the credentials");
    }

    const videoDetails = await Video.findById(videoId);

    if (!videoDetails) {
        return new ApiError("404", "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videoDetails, "Video Fetched Sucessfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req?.body;
    const isVideoExists = await Video.findById(videoId);

    if (!isVideoExists) {
        return new ApiError(404, "Video not found");
    }

    const thumbnailPath = req?.file?.thumbnail?.[0]?.path;

    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    const updatedDetails = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail?.url,
                title: title,
                description: description,
            },
        },
        {
            new: true,
        }
    );

    if (!updatedDetails) {
        return new ApiError(500, "Something went wrong");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedDetails, "Video updated successfully")
        );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        return new ApiError("401", "Please enter the credentials");
    }

    const videoDetails = await Video.findById(videoId);

    if (!videoDetails) {
        return new ApiError("404", "Video not found");
    }

    const deletedVideo = await Video.deleteOne({ $id: videoId });
    return res
        .status(200)
        .json(new ApiResponse(200, deletedVideo, "Video deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        return new ApiError("401", "Please enter the credentials");
    }

    const videoDetails = await Video.findById(videoId);

    if (!videoDetails) {
        return new ApiError("404", "Video not found");
    }

    const UpdatedStatus = await Video.findByIdAndUpdate(
        videoId,
        [{ $set: { isPublished: { $not: "$isPublished" } } }],
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse("200", UpdatedStatus, "Status updated successfully")
        );
});

export {
    uploadVideo,
    getAllVideo,
    getVideoById,
    deleteVideo,
    togglePublishStatus,
    updateVideo,
};
