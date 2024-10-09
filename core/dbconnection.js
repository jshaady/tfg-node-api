// dbconnection.js

import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  waitForConnections: true,
  connectionLimit: 10,
  host: "localhost",
  user: "user",
  password: "user",
  database: "tfgdb",
});

pool
  .getConnection((err, connection) => {
    if (err) {
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.error("Database connection was closed.");
      }
      if (err.code === "ER_CON_COUNT_ERROR") {
        console.error("Database has too many connections.");
      }
      if (err.code === "ECONNREFUSED") {
        console.error("Database connection was refused.");
      }
    }
    if (connection) connection.release();
    return;
  })
  .catch((e) => {
    console.error("Database connection was refused");
  });
