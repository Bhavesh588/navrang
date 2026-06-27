const knex = require("knex");
const knexConfig = require("../knexfile");

// const environment = process.env.DB_ENV || "development";

const mysql = knex(knexConfig);

mysql
  .raw("SELECT 1")
  .then(() => {
    console.log("MySQL connected");
  })
  .catch((e) => {
    console.log("MySQL not connected");
    console.error(e);
  });

module.exports = mysql;
