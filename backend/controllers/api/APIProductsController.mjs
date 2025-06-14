import express from "express"
import { ProductModel } from "../../models/ProductModel.mjs"
import { APIAuthenticationController } from "./APIAuthenticationController.mjs"
import { SaleProductModel } from "../../models/SaleProductModel.mjs"

export class APIProductsController {
    static routes = express.Router()

    static {
        this.routes.get("/", this.getProducts)
        this.routes.get("/sales", this.getProductSales)
        this.routes.get("/:id", this.getProductById)
        this.routes.post("/", APIAuthenticationController.restrict(["admin"]), this.createProduct)
        this.routes.patch("/:id", APIAuthenticationController.restrict(["admin"]), this.updateProduct)
        this.routes.delete("/:id", APIAuthenticationController.restrict(["admin"]), this.deleteProduct)
    }

    /**
     * Handle creating a new product
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/products:
     *      post:
     *          summary: "Create a new product"
     *          tags: [Products]
     *          security:
     *              - ApiKey: [] 
     *          requestBody:
     *              required: true
     *              content:
     *                  application/json:
     *                      schema:
     *                          $ref: "#/components/schemas/Product"
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
    static async createProduct(req, res) {
        try {
            const product = new ProductModel(
                req.body.id,
                req.body.name,
                req.body.stock,
                req.body.price,
                req.body.description,
                req.body.updatedByEmployeeId,
                req.body.deleted,
            )

            const result = await ProductModel.create(product)

            res.status(200).json({
                id: result.insertId,
                message: "product created"
            })
        } catch (error) {
            res.status(500).json({
                message: "Failed to create product",
                errors: [error]
            })
        }
    }

    /**
     * Handle getting all products
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/products:
     *      get:
     *          summary: "Get the list of all products"
     *          tags: [Products]
     *          parameters:
     *                - name: filter
     *                  in: query
     *                  description: Search filter on product names and descriptions
     *                  required: false
     *                  schema:
     *                      type: string
     *                      example: mocha
     *          responses:
     *              '200':
     *                  description: 'Product list'
     *                  content:
     *                      application/json:
     *                          schema:
     *                              type: array
     *                              items:
     *                                  $ref: "#/components/schemas/Product"
     *              '500':
     *                  $ref: "#/components/responses/Error"
     */
    static async getProducts(req, res) {
        try {
            const products = req.query.filter 
                ? await ProductModel.getBySearch(req.query.filter) 
                : await ProductModel.getAll()
            res.status(200).json(products)
        } catch (error) {
            res.status(500).json({
                message: "Failed to load products from database",
                errors: [error]
            })
        }
    }
    
    /**
     * Handle getting all products
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/products/sales:
     *      get:
     *          summary: "Get the list of all product sales"
     *          tags: [Products]
     *          parameters:
     *                - name: start_date
     *                  in: query
     *                  description: The start date to filter by
     *                  required: true
     *                  schema:
     *                      type: string
     *                      format: date
     *                      example: 2025-01-01
     *                - name: end_date
     *                  in: query
     *                  description: The end date to filter by
     *                  required: true
     *                  schema:
     *                      type: string
     *                      format: date
     *                      example: 2025-03-01
     *          responses:
     *              '200':
     *                  description: 'Product list'
     *                  content:
     *                      application/json:
     *                          schema:
     *                              type: array
     *                              items:
     *                                  type: object
     *                                  required:
     *                                      - product
     *                                      - sale
     *                                  properties:
     *                                      product:
     *                                          $ref: "#/components/schemas/Product"
     *                                      sale:
     *                                          $ref: "#/components/schemas/Sale"
     *              '400':
     *                  $ref: "#/components/responses/Error"
     *              '500':
     *                  $ref: "#/components/responses/Error"
     *              default:
     *                  $ref: "#/components/responses/Error"
     */
    static async getProductSales(req, res) {
        try {
            const saleProducts = await SaleProductModel.getByStartAndEndDate(
                new Date(req.query.start_date), 
                new Date(req.query.end_date)
            )

            res.status(200).json(saleProducts)
        } catch (error) {
            res.status(500).json({
                message: "Failed to load sale products from database",
                errors: [error]
            })
        }
    }

    /**
     * Handle getting a product by id
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/products/{id}:
     *      get:
     *          summary: "Get the list of all products"
     *          tags: [Products]
     *          parameters:
     *                - name: id
     *                  in: path
     *                  description: Product ID
     *                  required: true
     *                  schema:
     *                      type: number
     *                      example: 1
     *          responses:
     *              '200':
     *                  description: 'Product list'
     *                  content:
     *                      application/json:
     *                          schema:
     *                              $ref: "#/components/schemas/Product"
     *              '500':
     *                  $ref: "#/components/responses/Error"
     *              '404':
     *                  $ref: "#/components/responses/NotFound"
     */
    static async getProductById(req, res) {
        try {
            const product = await ProductModel.getById(req.params.id)
            res.status(200).json(product)
        } catch (error) {
            switch (error) {
                case "not found":
                    res.status(404).json({
                        message: "Product not found",
                    })
                    break;
                default:
                    res.status(500).json({
                        message: "Failed to load products from database",
                        errors: [error]
                    })
                    break;
            }
        }
    }

    /**
     * Handle updating an existing product
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/products/{id}:
     *      patch:
     *          summary: "Update an existing product by ID"
     *          tags: [Products]
     *          security:
     *              - ApiKey: [] 
     *          parameters:
     *                - name: id
     *                  in: path
     *                  description: Product ID
     *                  required: true
     *                  schema:
     *                      type: number
     *                      example: 1
     *          requestBody:
     *              required: true
     *              content:
     *                  application/json:
     *                      schema:
     *                          $ref: "#/components/schemas/Product"
     *          responses:
     *              '200':
     *                  $ref: "#/components/responses/Updated"
     *              '404':
     *                  $ref: "#/components/responses/NotFound"
     *              '500':
     *                  $ref: "#/components/responses/Error"
     *              default:
     *                  $ref: "#/components/responses/Error"
     */
    static async updateProduct(req, res) {
        try {
            const product = new ProductModel(
                req.params.id, // id should come from URL
                req.body.name,
                req.body.stock,
                req.body.price,
                req.body.description,
                req.body.updatedByEmployeeId,
                req.body.deleted,
            )

            const result = await ProductModel.update(product)

            if (result.affectedRows == 1) {
                res.status(200).json({
                    message: "product updated"
                })
            } else {
                res.status(404).json({
                    message: "Product not found - update failed",
                })
            }

        } catch (error) {
            res.status(500).json({
                message: "Failed to update product",
                errors: [error]
            })
        }
    }

    /**
     * Handle deleting an existing product
     * 
     * @type {express.RequestHandler}
     * @openapi
     * /api/products/{id}:
     *      delete:
     *          summary: "Delete an existing product by ID"
     *          tags: [Products]
     *          security:
     *              - ApiKey: [] 
     *          parameters:
     *                - name: id
     *                  in: path
     *                  description: Product ID
     *                  required: true
     *                  schema:
     *                      type: number
     *                      example: 1
     *          responses:
     *              '200':
     *                  $ref: "#/components/responses/Deleted"
     *              '404':
     *                  $ref: "#/components/responses/NotFound"
     *              '500':
     *                  $ref: "#/components/responses/Error"
     *              default:
     *                  $ref: "#/components/responses/Error"
     */
    static async deleteProduct(req, res) {
        try {
            const result = await ProductModel.delete(req.params.id)

            if (result.affectedRows == 1) {
                res.status(200).json({
                    message: "product deleted"
                })
            } else {
                res.status(404).json({
                    message: "Product not found - delete failed",
                })
            }

        } catch (error) {
            res.status(500).json({
                message: "Failed to delete product",
                errors: [error]
            })
        }
    }
}
