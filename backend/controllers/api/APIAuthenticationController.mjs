import express from "express"
import { EmployeeModel } from "../../models/EmployeeModel.mjs"
import bcrypt from "bcryptjs"

export class APIAuthenticationController {
    static middleware = express.Router()
    static routes = express.Router()
    
    static {
        // Setup API Authentication Provider
        this.middleware.use(this.#APIAuthenticationProvider)
        this.routes.post("/authenticate", this.handleAuthenticate)
        this.routes.delete("/authenticate", this.handleAuthenticate)
    }

    /**
     * This middleware checks the for the API key header and
     * loads the respective user into req.authenticatedUser if found.
     * 
     * @private
     * @type {express.RequestHandler}
     */
    static async #APIAuthenticationProvider(req, res, next) {
        const authenticationKey = req.headers["x-auth-key"]
        if (authenticationKey) {
            try {
                req.authenticatedUser = await EmployeeModel.getByAuthenticationKey(authenticationKey)
            } catch (error) {
                if (error == "not found") {
                    res.status(404).json({
                        message: "Failed to authenticate - key not found"
                    })
                } else {
                    res.status(500).json({
                        message: "Failed to authenticated - database error"
                    })
                }
                // Early return here so that next() doesn't run when there was an error
                return
            }
        }
        next()
    }

    /**
     * @type {express.RequestHandler}
     * @openapi
     * /api/authenticate:
     *      post:
     *          summary: "Authenticate with username and password"
     *          tags: [Authentication]
     *          requestBody:
     *              required: true
     *              content:
     *                  application/json:
     *                      schema:
     *                          $ref: "#/components/schemas/UserCredentials"
     *          responses:
     *              '200':
     *                  $ref: "#/components/responses/LoginSuccessful"
     *              '400':
     *                  $ref: "#/components/responses/Error"
     *              '500':
     *                  $ref: "#/components/responses/Error"
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
     *              default:
     *                  $ref: "#/components/responses/Error"
     */
    static async handleAuthenticate(req, res) {
        if (req.method == "POST") {
            try {
                const employee = await EmployeeModel.getByUsername(req.body.username)

                if (await bcrypt.compare(req.body.password, employee.password)) {
                    // Generate a cryptographically secure and random UUID for use as the authentication key
                    const authenticationKey = crypto.randomUUID()

                    // Store the authenticated user's authentication key into the database
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
        } else if (req.method == "DELETE") {
            if (req.authenticatedUser) {
                // Clear authentication key and send JSON response
                const employee = await EmployeeModel.getByAuthenticationKey(req.authenticatedUser.authenticationKey)
                employee.authenticationKey = null
                await EmployeeModel.update(employee)
                res.status(200).json({
                    message: "Deauthentication successful"
                })
            } else {
                res.status(401).render("status.ejs", {
                    message: "Please login to access the requested resource."
                })
            }
        }

    }

    /**
     * 
     * @param {Array<"admin" | "stock" | "sales"> | "any"} allowedRoles 
     * @returns {express.RequestHandler}
     */
    static restrict(allowedRoles) {
        return function (req, res, next) {
            if (req.authenticatedUser) {
                if (allowedRoles == "any" || allowedRoles.includes(req.authenticatedUser.role)) {
                    next()
                } else {
                    res.status(403).json({
                        message: "Access forbidden",
                        errors: ["Role does not have access to the requested resource."]
                    })
                }
            } else {
                res.status(401).json({
                    message: "Not authenticated",
                    errors: ["Please authenticate to access the requested resource."]
                })
            }
        }
    }
    
    
}