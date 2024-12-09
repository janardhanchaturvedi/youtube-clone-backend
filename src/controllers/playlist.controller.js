import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return new ApiError(401, "All fields are required");
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
    });

    if (!playlist) {
        return new ApiError(402, "Something is went wrong");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    try {
        if (!playlistId || !videoId || !isValidObjectId(videoId)) {
            return new ApiError(401, "Please provide a playlist");
        }
        console.log("-------------------------------");

        const updatePlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $push: { videos: new mongoose.Types.ObjectId(videoId) },
            },
            {
                new: true,
            }
        );
        console.log("--------------------DB operation khatam------------");
        console.log(
            "🚀 ~ addVideoToPlaylist ~ updatePlaylist:",
            updatePlaylist
        );

        if (!updatePlaylist) {
            return new ApiError(402, "Something went wrong");
        }
        console.log("----------------Response ke phele-----------------");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatePlaylist,
                    "Video added to playlist successfully"
                )
            );
    } catch (error) {
        console.log("🚀 ~ addVideoToPlaylist ~ error:", error)
        
    }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    //TODO: update playlist
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
