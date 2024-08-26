import { Router, Request, Response } from "express";

class EmployeeController {
    static routes = Router("/employee")
    
    static {
        this.routes.get("/", this.viewEmployees)
    }
    
    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static viewEmployees(req, res) {

    }

}