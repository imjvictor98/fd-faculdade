import express from "express";
import path from "path";
import mongoConfig from "./config/mongodb";
import mongoose from "mongoose";
import routes from "./routes";

const server = express();

server.use(express.json());
server.use(
  "/files",
  express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
);

mongoose
  .connect(mongoConfig.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    dbName: "faculdade"
  })
  .then(() => console.log("Connected to Cluster"))
  .catch(() => console.log(`Connection failed ${error}`));

server.use("/", routes);

server.listen(3333, () => {
  console.log("NodeJs is listening your fairytales in port 3333");
});
