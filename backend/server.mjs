import express from "express";
import session from "express-session";
import { EmployeeController } from "./controllers/EmployeeController.mjs";

// Create an express app instance and define a port for later
const app = express();
const port = 8080;

// Express session middleware automatically manages a session cookie
// that is used to give persistent state between requests, making
// the application stateful and overcoming the stateless nature of HTTP.
app.use(
    session({
        secret: "secret phrase",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);

// Enable the ejs view engine
app.set("view engine", "ejs");
app.set("views", "./backend/views")

// Enable parsing of JSON and FormData request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json())


// Use routes (from controllers)
app.use("/employee", EmployeeController.routes)

// Redirect request to root to the products page
// app.get("/", (request, response) => {
//     response.status(301).redirect("/product_list");
// });

// Serve static resources
app.use(express.static("./backend/public"));


// Start the listening for requests
app.listen(port, () => {
    console.log(`Minute Coffee backend running on http://localhost:${port}`);
});
