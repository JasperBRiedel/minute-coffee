import express from "express"
import { APIAuthenticationController } from "./APIAuthenticationController.mjs"
import { OrderProductModel } from "../../models/OrderProductModel.mjs"
import { ORDER_STATUS_PENDING, OrderModel } from "../../models/OrderModel.mjs"
import { DatabaseModel } from "../../models/DatabaseModel.mjs"

export class APIOrderController {
    static routes = express.Router()
    
    static {
        this.routes.post("/", this.createOrder)
        this.routes.get(
            "/xml",
            APIAuthenticationController.restrict("admin"),
            this.getOrdersXML
        )
        this.routes.get("/:id", this.getOrderById)
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
            const exportDate = DatabaseModel.toMySqlDate(new Date())
            const orderProducts = await OrderProductModel.getAllByStatus("complete")
            
            res.status(200).render("xml/orders.xml.ejs", {orderProducts, exportDate})
        } catch (error) {
            res.status(500).json({
                message: "failed to export xml for orders",
                errors: [error]
            })
        }
    }
    
    /**
     * Handle getting an order by id
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/orders/{id}:
     *      get:
     *          summary: "Get an order by ID"
     *          tags: [Orders]
     *          parameters:
     *                - name: id
     *                  in: path
     *                  description: Order ID
     *                  required: true
     *                  schema:
     *                      type: number
     *                      example: 1
     *          responses:
     *              '200':
     *                  description: 'The order specified by the provided ID'
     *                  content:
     *                      application/json:
     *                          schema:
     *                              $ref: "#/components/schemas/Order"
     *              '500':
     *                  $ref: "#/components/responses/Error"
     *              '404':
     *                  $ref: "#/components/responses/NotFound"
     */
    static async getOrderById(req, res) {
        try {
            const order = await OrderModel.getById(req.params.id)
            res.status(200).json(order)
        } catch (error) {
            switch (error) {
                case "not found":
                    res.status(404).json({
                        message: "Order not found",
                    })
                    break;
                default:
                    res.status(500).json({
                        message: "Failed to load order from database",
                        errors: [error]
                    })
                    break;
            }
        }
    }
}