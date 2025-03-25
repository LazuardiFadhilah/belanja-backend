// import multer from "multer";
// import path from "path";
// import fs from "fs";


// const uploadDir = path.join("uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     if(!file) return cb(null, true);
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("File harus berupa gambar!"), false);
//     }
//   },
//   limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB per file
// });

// export default upload;


import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Fungsi untuk membuat konfigurasi multer berdasarkan folder tujuan.
 * @param {string} folderPath - Lokasi penyimpanan gambar
 * @returns {multer.Multer} Middleware multer
 */
const configureMulter = (folderPath) => {
    // Pastikan folder tujuan ada, jika tidak maka buat
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, folderPath);
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname)); // Rename dengan timestamp
        }
    });

    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    };

    return multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 } // Maksimal 2MB
    });
};

export default configureMulter;