/** Database connection for messagely. */

// const { Client } = require("pg");
// const { DB_URI } = require("./config");

// const client = new Client(DB_URI);

// client.connect();

const { Client } = require("pg");
let { DB_NAME } = require("./config");

const db = new Client({
  host: "/var/run/postgresql/",
  database: DB_NAME
})

db.connect();

module.exports = client;
