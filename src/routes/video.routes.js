import { Router } from "express";
import { uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/upload-video").post(upload.fields[
    {
        name : "thumbnail",
        maxCount : 1
    },
    {
        name : "video",
        maxCount : 1
    }
],uploadVideo)


export default router;