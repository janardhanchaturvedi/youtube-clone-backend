import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import path from "path";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname );
    },
});

const fileFilter = (_req, file, cb) => {
    let ext = path.extname(file.originalname);

    if (
        ext !== ".jpg" &&
        ext !== ".jpeg" &&
        ext !== ".webp" &&
        ext !== ".png" &&
        ext !== ".mp4"
    ) {
        cb(new ApiError(`Unsupported file type! ${ext}`), false);
        return;
    }

    cb(null, true);
};

export const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter,
});
