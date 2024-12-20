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
    const skip = (page - 1) * limit;
    if (!videoId) {
        return new ApiError(401, "Please enter the Video Id");
    }

    const commentsData = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            },
        },
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
        {
            $skip: Number(skip),
        },
        {
            $limit: Number(limit),
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
const updateComment = asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;
    const { comment } = req.body;

    if (!commentId || !comment) {
        return next(new ApiError(400, "Please enter valid fields"));
    }

    try {
        const updatedComment = await Comment.findOneAndUpdate(
            { commentId },
            { content: comment },
            { new: true }
        );

        if (!updatedComment) {
            return next(new ApiError(404, "Comment not found"));
        }

        // Respond with the updated comment
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedComment,
                    "Comment updated successfully"
                )
            );
    } catch (error) {
        return next(error);
    }
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req?.params;
    if (!commentId) {
        return new ApiError(401, "Please enter the Video Id");
    }

    const deleteComment = await Comment.deleteOne({
        _id: new Object(commentId),
    });

    if (!deleteComment) {
        return new ApiError(404, "Comment not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, deleteComment, "Comments deleted successfully")
        );
});
export { getVideoComments, addComment, updateComment, deleteComment };
