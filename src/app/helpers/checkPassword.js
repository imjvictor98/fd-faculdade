import bcrypt from "bcryptjs";

const checkPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export default checkPassword;
