import Grid from "gridfs-stream";
import GridFsStorage from "multer-gridfs-storage";
import mongoose from "mongoose";
import mongoConfig from "../../config/mongodb";
import gridfsConfig from "../../config/gridfs";

const conn = mongoose.createConnection(mongoConfig.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "faculdade"
});

export default {
  grid() {
    conn.once("open", () => {
      let gfs = Grid(conn.db, mongoose.mongo);
      gfs.collection("uploads"); //bucket name
    });
    return new GridFsStorage(gridfsConfig);
  },

  show(req, res) {
    let gfs = Grid(conn.db, mongoose.mongo);
    gfs.files.find().toArray((error, files) => {
      if (!files || files.length === 0) {
        return res
          .status(203)
          .json({ error: "Não foi possível encontrar nenhuma foto" });
      }
      return res.json(files);
    });
  }
};
