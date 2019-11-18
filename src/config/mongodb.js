require("dotenv/config");

const username = process.env.MONGO_USER;
const password = process.env.MONGO_PWD;
const uri = `mongodb+srv://${username}:${password}@vitinho-tsl45.mongodb.net/test?retryWrites=true&w=majority`;
export default { password, username, uri };
