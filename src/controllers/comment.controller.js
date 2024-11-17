import mongoose from "mongoose";
import { Comment } from "../models/cooment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        return new ApiError(401, "Please enter the Video Id");
    }

    const commentsData = await Comment.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "commentUser",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            avatar: 1,
                            fullName: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                commentUser: {
                    $first: "$commentUser",
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, commentsData, "Comments fetched successfully")
        );
});
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req?.params;
    const owner = req?.user?._id;
    const { comment } = req?.body;

    if (!comment) {
        return new ApiError(401, "Please enter comment");
    }

    const isOwnerExists = await User.findOne(owner);
    if (!isOwnerExists) {
        return new ApiError(401, "Please login to comment");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return new ApiError(401, "Invalid videoId");
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
        return new ApiError(401, "Invalid owner");
    }

    const commentCreated = await Comment.create({
        content: comment,
        video: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(owner),
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, commentCreated, "Comment added sucessfully")
        );
});
const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
});
const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
});
export { getVideoComments, addComment, updateComment, deleteComment };
