import mysql from "mysql2/promise";

export const db_conn = mysql.createPool({
  host: "localhost",
  user: "jb09",
  password: "jb09",
  database: "minute_coffee",
});
