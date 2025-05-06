import express from "express"
import { APIAuthenticationController } from "./APIAuthenticationController.mjs"
import { OrderProductModel } from "../../models/OrderProductModel.mjs"
import { ORDER_STATUS_PENDING, OrderModel } from "../../models/OrderModel.mjs"

export class APIOrderController {
    static routes = express.Router()
    
    static {
        this.routes.post("/", this.createOrder)
        this.routes.get(
            "/xml",
            APIAuthenticationController.restrict("admin"),
            this.getOrdersXML
        )
    }

    /**
     * Handle creating a new order
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/orders:
     *      post:
     *          summary: "Create a new order"
     *          tags: [Orders]
     *          requestBody:
     *              required: true
     *              content:
     *                  application/json:
     *                      schema:
     *                          $ref: "#/components/schemas/Order"
     *          responses:
     *              '200':
     *                  $ref: "#/components/responses/Created"
     *              '500':
     *                  $ref: "#/components/responses/Error"
     *              '403':
     *                  $ref: "#/components/responses/Error"
     *              default:
     *                  $ref: "#/components/responses/Error"
     */
    static async createOrder(req, res) {
        try {
            const order = new OrderModel(
                null,
                req.body.productId,
                ORDER_STATUS_PENDING,
                new Date(),
                req.body.customerFirstName,
                req.body.customerLastName,
                req.body.customerPhone,
                req.body.customerEmail                 
            )

            const result = await OrderModel.create(order)

            res.status(200).json({
                id: result.insertId,
                message: "order created"
            })
        } catch (error) {
            res.status(500).json({
                message: "Failed to create order",
                errors: [error]
            })
        }
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