import crypto from "crypto";
import mongoConfig from "../config/mongodb";
import path from "path";

export default {
  url: mongoConfig.uri,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads" //colection name
        };
        resolve(fileInfo);
      });
    });
  }
};
