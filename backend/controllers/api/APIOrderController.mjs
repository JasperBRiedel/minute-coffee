import express from "express"
import { APIAuthenticationController } from "./APIAuthenticationController.mjs"
import { OrderProductModel } from "../../models/OrderProductModel.mjs"

export class APIOrderController {
    static routes = express.Router()
    
    static {
        this.routes.get(
            "/xml",
            APIAuthenticationController.restrict("admin"),
            this.getOrdersXML
        )
    }
    
    /**
     * Handle exporting all complete orders to XML
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/orders/xml:
     *      get:
     *          summary: "Export all complete orders to XML"
     *          tags: [Orders]
     *          security:
     *              - ApiKey: [] 
     *          responses:
     *              '200':
     *                  description: 'Complete orders XML'
     *                  content:
     *                      text/xml:
     *                          schema:
     *                              type: string
     *              default:
     *                  $ref: "#/components/responses/Error"
     */
    static async getOrdersXML(req, res) {
        try {
            const orderProducts = await OrderProductModel.getAllByStatus("complete")
            
            res.status(200).render("xml/orders.xml.ejs", {orderProducts})
        } catch (error) {
            res.status(500).json({
                message: "failed to export xml for orders",
                errors: [error]
            })
        }
    }
}