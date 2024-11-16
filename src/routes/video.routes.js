import { Router } from "express";
import {
    deleteVideo,
    getAllVideo,
    getVideoById,
    togglePublishStatus,
    uploadVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/upload-video").post(
    upload.fields([
        {
            name: "thumbnail",
            maxCount: 1,
        },
        {
            name: "video",
            maxCount: 1,
        },
    ]),
    verifyJWT,
    uploadVideo
);
router.route("/get-videos").get(getAllVideo);
router.route("/:videoId").get(getVideoById).delete(deleteVideo);
// .patch(upload.single("thumbnail"), updateVideo);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
export default router;
