import express from "express"
import { EmployeeModel } from "../../models/EmployeeModel.mjs"
import { APIAuthenticationController } from "./APIAuthenticationController.mjs"

export class APIEmployeeController {
    static routes = express.Router()
    
    static {
        this.routes.get(
            "/self", 
            APIAuthenticationController.restrict("any"), 
            this.getAuthenticatedEmployee
        )
    }
    
    /**
     * Handle getting an employee by their current authentication key header
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/employees/self:
     *      get:
     *          summary: "Get employee by current authentication key header"
     *          tags: [Employees]
     *          security:
     *              - ApiKey: [] 
     *          responses:
     *              '200':
     *                  description: 'Employee with provide authentication key'
     *                  content:
     *                      application/json:
     *                          schema:
     *                              $ref: "#/components/schemas/Employee"
     *              default:
     *                  $ref: "#/components/responses/Error"
     */
    static async getAuthenticatedEmployee(req, res) {
        res.status(200).json(req.authenticatedUser)
    }
}