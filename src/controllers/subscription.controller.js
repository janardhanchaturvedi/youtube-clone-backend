import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.models.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        return new ApiError(401, "Invalid channel ID");
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req?.user?._id,
    });

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Unsubscribed successfully"));
    } else {
        const newSubscription = await Subscription.create({
            channel: new mongoose.Types.ObjectId(channelId),
            subscriber: new mongoose.Types.ObjectId(req?.user?._id),
        });

        return res
            .status(200)
            .json(
                new ApiResponse(200, newSubscription, "Subscribed successfully")
            );
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        return new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                subscribers: {
                    $first: "$subscribers",
                },
            },
        },
    ]);
    return res.status(200).json(new ApiResponse(200, subscribers, "SUCCESS"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        return new ApiError(404, "No subscriber specified");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(req?.user?._id),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelsSubscribed",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                channelsSubscribed: {
                    $first: "$channelsSubscribed",
                },
            },
        },
        {
            $match: {
                channelsSubscribed: { $ne: null },
            },
        },
        {
            $project: {
                _id: 0,
                channelsSubscribed: 1,
            },
        },
    ]);

    if (!subscribedChannels) {
        return new ApiError(401, "Something went wrong");
    }

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "OK"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
