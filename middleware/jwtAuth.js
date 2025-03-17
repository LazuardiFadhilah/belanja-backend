import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const jwtAuth = async (req, res, next) => {
        try {
            if(!req.header("Authorization")) throw { code: 401, message: "UNAUTHORIZED" };
            const token = req.headers.authorization.split(' ')[1];
            const verify = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            req.jwt = verify;
            next(); 
        } catch (error) {
            // Menyesuaikan pesan error untuk kesalahan token
            if (error.message === "jwt expired") error.message = "REFRESH_TOKEN_EXPIRED";
            else if (
              ["invalid signature", "jwt signature is required", "jwt must be provided", "jwt malformed", "invalid token"].includes(error.message)
            ) {
              error.message = "INVALID_REFRESH_TOKEN";
            }
            return res.status(error.code || 500).json({ status: false, message: error.message });
          }
}

export default jwtAuth;