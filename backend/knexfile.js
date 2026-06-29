require("dotenv").config();
// const mysql = require("mysql");
// mysql.defaults.ssl = true;

const isTest = process.env.NODE_ENV === "test" || Boolean(process.env.JEST_WORKER_ID);

module.exports = {
  client: "mysql2",
  useNullAsDefault: true,
  connection: {
    host: isTest ? (process.env.MYSQL_TEST_HOST || "localhost") : process.env.MYSQL_DEV_HOST,
    port: isTest ? (process.env.MYSQL_TEST_PORT || 3306) : process.env.MYSQL_DEV_PORT,
    user: isTest ? process.env.MYSQL_TEST_USER : process.env.MYSQL_DEV_USER,
    password: isTest ? process.env.MYSQL_TEST_PASSWORD : process.env.MYSQL_DEV_PASSWORD,
    database: isTest ? process.env.MYSQL_TEST_DATABASE : process.env.MYSQL_DEV_DATABASE,
    timezone: "+05:30",
  },
  migrations: {
    directory: "./database/migrations",
  },
  seeds: {
    directory: "./database/seeds",
  },
};

// // Update with your config settings.

// /**
//  * @type { Object.<string, import("knex").Knex.Config> }
//  */
// module.exports = {

//   development: {
//     client: 'sqlite3',
//     connection: {
//       filename: './dev.sqlite3'
//     }
//   },

//   staging: {
//     client: 'postgresql',
//     connection: {
//       database: 'my_db',
//       user:     'username',
//       password: 'password'
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: 'knex_migrations'
//     }
//   },

//   production: {
//     client: 'postgresql',
//     connection: {
//       database: 'my_db',
//       user:     'username',
//       password: 'password'
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: 'knex_migrations'
//     }
//   }

// };
