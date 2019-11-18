require("dotenv/config");
import hanaClient from "@sap/hana-client";

const params = {
  host: process.env.HANA_HOST,
  port: 31115,
  uid: process.env.HANA_ID,
  pwd: process.env.HANA_PWD
};

const connection = hanaClient.createConnection();

export default {
  connection,
  params
};
