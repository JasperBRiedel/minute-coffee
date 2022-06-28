import express from "express"
import session from "express-session"

// Create an express app instance and define a port for later
const app = express()
const port = 8080

// Express session middleware automatically manages a session cookie
// that is used to give persistent state between requests, making
// the application stateful and overcoming the stateless nature of HTTP.
app.use(session({
    secret: "secret phrase",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

// Enable the ejs view engine
app.set("view engine", "ejs")

// Redirect request to root to the products page
app.get("/", (request, response) => {
    response.status(301).redirect("/product_list")
})

// Serve static resources
app.use(express.static("static"))

// Hook up each controller 
import productController from "./controllers/products.js"
app.use(productController)

// Start the listening for requests
app.listen(port, () => {
    console.log(`Express server started on http://localhost:${port}`)
})