import mongoose from "mongoose";
const Schema = mongoose.Schema;

const File = new Schema(
  {
    name: String,
    path: String
  },
  {
    id: false,
    toJSON: {
      virtuals: true
    }
  }
);

File.virtual("file_url").get(function() {
  return `http://localhost:3333/files/${this.path}`;
});

export const FileSchema = File;
export default mongoose.model("File", File, "file");
