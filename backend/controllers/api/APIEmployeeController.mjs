import express from "express"
import { EmployeeModel } from "../../models/EmployeeModel.mjs"

export class APIEmployeeController {
    static routes = express.Router()
    
    static {
        this.routes.get("/by_key/:authentication_key", this.getEmployeeByAuthenticationKey)
    }
    
    /**
     * Handle getting an employee by their current authentication key 
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/employees/by_key/{authentication_key}:
     *      get:
     *          summary: "Get an employee by current authentication key"
     *          tags: [Employees]
     *          parameters:
     *                - name: authentication_key
     *                  in: path
     *                  description: Authentication Key
     *                  required: true
     *                  schema:
     *                      type: string
     *                      example: 2a843031-50bc-4b78-bf5b-ee90023ec97f
     *          responses:
     *              '200':
     *                  description: 'Employee with provide authentication key'
     *                  content:
     *                      application/json:
     *                          schema:
     *                              $ref: "#/components/schemas/Employee"
     *              '500':
     *                  $ref: "#/components/responses/Error"
     *              '404':
     *                  $ref: "#/components/responses/NotFound"
     */
    static async getEmployeeByAuthenticationKey(req, res) {
        try {
            const employee = await EmployeeModel.getByAuthenticationKey(req.params.authentication_key)
            res.status(200).json(employee)
        } catch (error) {
            switch (error) {
                case "not found":
                    res.status(404).json({
                        message: "Employee not found",
                    })
                    break;
                default:
                    res.status(500).json({
                        message: "Failed to load employees from database",
                        errors: [error]
                    })
                    break;
            }
        }
    }
}