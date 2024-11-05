import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAcessToken,
    changeCurrentPassword,
    updateUserDetails,
    getCurrentUser,
    updateAvatar,
    updateUserCoverImage,
    getWatchHistory,
    getUserChannelProfile,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
// router.post("/register", registerUser);
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//secured router
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAcessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router
    .route("/update-avatar")
    .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
    .route("/update-cover-image")
    .post(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/update-user").patch(verifyJWT, updateUserDetails);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/get-watch-history").get(verifyJWT, getWatchHistory);

export default router;
