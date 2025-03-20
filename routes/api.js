import express from "express";
import AuthController from "../controllers/AuthController.js";
import jwtAuth from "../middleware/jwtAuth.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh-token", jwtAuth, AuthController.refreshToken);
router.put("/user/:id", jwtAuth, AuthController.updateProfile);
router.post(
    "/user/:id/profile-picture",
    AuthController.upload.single("profilePicture"),
    AuthController.updateProfilePicture
  );

export default router;
