import { Router } from "express";
import { getAllVideo, uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/upload-video").post(upload.fields([
    {
        name : "thumbnail",
        maxCount : 1
    },
    {
        name : "video",
        maxCount : 1
    }
]), verifyJWT,uploadVideo)
router.route("/get-videos").get(getAllVideo);


export default router;