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
router.route("/refresh-token").post(verifyJWT, refreshAcessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-avatar").post(verifyJWT, updateAvatar);
router.route("/update-cover-image").post(verifyJWT, updateUserCoverImage);
router.route("/update-user").post(verifyJWT, updateUserDetails);
router.route("/get-user").get(verifyJWT, getCurrentUser);

export default router;
