import mongoose from "mongoose";
const Schema = mongoose.Schema;

const File = new Schema(
  {
    name: String,
    path: String,
    url: {
      type: String,
      get() {
        return `http://localhost:3333/files/${this.path}`;
      }
    }
  },
  {
    strict: false,
    id: false
  }
);

export default mongoose.model("File", File, "file");
