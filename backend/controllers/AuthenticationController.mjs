import express from "express"
import session from "express-session"
import bcrypt from "bcryptjs"
import { EMPLOYEE_ROLE_ADMIN, EMPLOYEE_ROLE_SALES, EMPLOYEE_ROLE_STOCK, EmployeeModel } from "../models/EmployeeModel.mjs"

export class AuthenticationController {
    static middleware = express.Router()
    static routes = express.Router()

    static {
        this.middleware.use(session({
            secret: "9c55abf5-111d-4235-b8d8-07c3463999e7",
            resave: false,
            saveUninitialized: false,
            cookie: { secure: "auto" }
        }))
        this.middleware.use(this.#session_authentication)
        this.middleware.use(this.#api_key_authentication)

        this.routes.get("/", this.viewAuthenticate)
        this.routes.post("/", this.handleAuthenticate)

        this.routes.delete("/", this.restrict(["admin", "sales", "stock"]), this.handleDeauthenticate)
        this.routes.get("/logout", this.handleDeauthenticate)
    }

    /**
     * Automatically stores the respective EmployeeModel into req.authenticatedUsed
     * if there is an active session containing an userId
     * @type {express.RequestHandler}
     */
    static async #session_authentication(req, res, next) {
        if (req.session.userId && !req.authenticatedUser) {
            try {
                req.authenticatedUser = await EmployeeModel.getById(req.session.userId)
            } catch (error) {
                console.error("Failed to authenticate user session - " + error)
            }
        }
        next()
    }

    /**
     * @type {express.RequestHandler}
     */
    static async #api_key_authentication(req, res, next) {
        const authenticationKey = req.headers["x-auth-key"]
        if (authenticationKey) {
            try {
                req.authenticatedUser = await EmployeeModel.getByAuthenticationKey(authenticationKey)
            } catch (error) {
                console.error("Failed to authenticate using authentication key - " + error)
            }
        }
        next()
    }

    /**
     * @type {express.RequestHandler}
     */
    static viewAuthenticate(req, res) {
        res.render("login.ejs")
    }

    /**
     * @type {express.RequestHandler}
     * @openapi
     * /authenticate:
     *      post:
     *          summary: "Authenticate with username and password"
     *          tags: [Authentication]
     *          requestBody:
     *              required: true
     *              content:
     *                  application/json:
     *                      schema:
     *                          $ref: "#/components/schemas/UserCredentials"
     *                  application/x-www-form-urlencoded:
     *                      schema:
     *                          $ref: "#/components/schemas/UserCredentials"
     *          responses:
     *              '302':
     *                  description: "Form based login successful, redirect to homepage."
     *                  content: 
     *                      text/html:
     *                          schema:
     *                              type: string
     *              '200':
     *                  $ref: "#/components/responses/LoginSuccessful"
     *              '400':
     *                  description: "Login failed"
     *                  content:
     *                      application/json:
     *                          schema:
     *                              type: object
     *                              required:
     *                                  - message
     *                              properties:
     *                                  message:
     *                                      type: string
     *                                      example: "Invalid credentials"
     *                      text/html:
     *                          schema:
     *                              type: string
     *              '500':
     *                  $ref: "#/components/responses/Error"
     */
    static async handleAuthenticate(req, res) {
        const contentType = req.get("Content-Type")

        const username = req.body["username"]
        const password = req.body["password"]

        if (contentType == "application/x-www-form-urlencoded") {
            try {
                const employee = await EmployeeModel.getByUsername(username)
                const isCorrectPassword = await bcrypt.compare(password, employee.password)

                if (isCorrectPassword) {
                    // Store the authenticated user's ID into the session
                    req.session.userId = employee.id

                    // Redirect based on role
                    if (employee.role == EMPLOYEE_ROLE_ADMIN) {
                        res.redirect("/products/edit")
                    } else if (employee.role == EMPLOYEE_ROLE_SALES) {
                        res.redirect("/orders/view")
                    } else if (employee.role == EMPLOYEE_ROLE_STOCK) {
                        res.redirect("/products/edit")
                    }
                } else {
                    res.status(400).render("status.ejs", {
                        status: "Authentication Failed.",
                        message: "Invalid credentials."
                    })
                }
            } catch (error) {
                if (error == "not found") {
                    res.status(400).render("status.ejs", {
                        status: "Authentication Failed.",
                        message: "Invalid credentials."
                    })
                } else {
                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Authentication Failed.",
                        message: "Server error."
                    })
                }
            }
        } else if (contentType == "application/json") {
            try {

                const employee = await EmployeeModel.getByUsername(username)
                const isCorrectPassword = await bcrypt.compare(password, employee.password)

                if (isCorrectPassword) {
                    // Generate a cryptographically random UUID for use as the authentication key
                    const authenticationKey = crypto.randomUUID()

                    // Store the authenticated user authentication key into the database
                    employee.authenticationKey = authenticationKey
                    await EmployeeModel.update(employee)

                    res.status(200).json({
                        key: authenticationKey
                    })
                } else {
                    res.status(400).json({
                        message: "Invalid credentials"
                    })
                }
            } catch (error) {
                switch (error) {
                    case "not found":
                        res.status(400).json({
                            message: "Invalid credentials",
                        })
                        break;
                    default:
                        console.error(error)
                        res.status(500).json({
                            message: "Failed to authenticate user",
                        })
                        break;
                }
            }
        } else {
            res.status(500).json({
                message: "Credentials must be sent as url encoded form data or JSON."
            })
        }
    }

    /**
     * @type {express.RequestHandler}
     * @openapi
     * /authenticate:
     *      delete:
     *          summary: "Deauthenticate"
     *          tags: [Authentication]
     *          security:
     *              - ApiKey: [] 
     *          responses:
     *              '200':
     *                  $ref: "#/components/responses/Updated"
     *              '400':
     *                  $ref: "#/components/responses/Error"
     *              '500':
     *                  $ref: "#/components/responses/Error"
     */
    static async handleDeauthenticate(req, res) {
        const usingJSON = req.authenticatedUser.authenticationKey != null || req.headers.contentType == "application/json"

        if (req.authenticatedUser) {
            if (usingJSON) {
                // Clear authentication key and send JSON response
                const employee = await EmployeeModel.getByAuthenticationKey(req.authenticatedUser.authenticationKey)
                employee.authenticationKey = null
                await EmployeeModel.update(employee)
                res.status(200).json({
                    message: "Deauthentication successful"
                })
            } else {
                // Handle clearing session and send HTML status page
                if (req.session.userId) {
                    req.session.destroy()
                    res.status(200).render("status.ejs", {
                        status: "Logged out successfully.",
                        message: "You have been logged out."
                    })
                }
            }
        } else {
            res.status(401).render("status.ejs", {
                status: "Unauthenticated.",
                message: "Please login to access the requested resource."
            })
        }
    }

    /**
     * 
     * @param {Array<"admin" | "stock" | "sales">} allowedRoles 
     * @returns {express.RequestHandler}
     */
    static restrict(allowedRoles) {
        return function (req, res, next) {
            const usingJSON = req.authenticatedUser?.authenticationKey != null 
            || req.headers["x-auth-key"]
            || req.headers.contentType == "application/json"

            if (req.authenticatedUser) {
                if (allowedRoles.includes(req.authenticatedUser.role)) {
                    next()
                } else {
                    if (usingJSON) {
                        res.status(403).json({
                            message: "Access forbidden.",
                            errors: ["Role does not have access to the requested resource."]
                        })
                    } else {
                        res.status(403).render("status.ejs", {
                            status: "Access Forbidden.",
                            message: "Role does not have access to the requested resource."
                        })
                    }
                }
            } else {
                if (usingJSON) {
                    res.status(401).json({
                        status: "Unauthenticated.",
                        errors: ["Please login to access the requested resource."]
                    })
                } else {
                    res.status(401).render("status.ejs", {
                        status: "Unauthenticated.",
                        message: "Please login to access the requested resource."
                    })
                }
            }
        }
    }
}
