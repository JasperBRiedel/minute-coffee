import path from "path"
import express from "express";
import session from "express-session";
import { EmployeeController } from "./controllers/EmployeeController.mjs";
import { ProductController } from "./controllers/ProductController.mjs";
import { OrderController } from "./controllers/OrderController.mjs";

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
// Load views (ejs files) from the "views" folder relative to this file
app.set("views", path.join(import.meta.dirname, "views"))

// Enable parsing of JSON and FormData request bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Use routes (from controllers)
app.use("/employee", EmployeeController.routes)
app.use("/products", ProductController.routes)
app.use("/orders", OrderController.routes)

// Redirect request to root to the products page
app.get("/", (req, res) => {
    res.status(301).redirect("/products");
});

// Serve static resources from the "public" folder relative to this file
app.use(express.static(path.join(import.meta.dirname, "public")));


// Start the listening for requests on the port defined earlier
app.listen(port, () => {
    console.log(`Minute Coffee backend running on http://localhost:${port}`);
});
