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
     *                              type: array
     *                              xml:
     *                                  name: orders
     *                              items:
     *                                  type: object
     *                                  properties:
     *                                      id:
     *                                          type: string
     *                                          example: 1
     *                                      date:
     *                                          type: string
     *                                          format: date
     *                                      customer:
     *                                          type: object
     *                                          properties:
     *                                              name:
     *                                                  type: string
     *                                                  example: John Doe
     *                                              phone:
     *                                                  type: string
     *                                                  example: 0000 000 000
     *                                              email:
     *                                                  type: string
     *                                                  example: john@doe.mail
     *                                      product:
     *                                          type: object
     *                                          properties:
     *                                              name:
     *                                                  type: string
     *                                                  example: Latte
     *                                              price:
     *                                                  type: number
     *                                                  example: 2.50
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