import mysql from "mysql2/promise";

export const db_conn = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "minute-coffee",
});
