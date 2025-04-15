import express from "express"
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUI from "swagger-ui-express"
import * as ApiValidator from "express-openapi-validator"
import { ProductModel } from "../models/ProductModel.mjs"

const options = {
    failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
    definition: {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "Minute Coffee API",
            description: "JSON REST API for interacting with the minute coffee backend",
        },
        components: {
            securitySchemes: {
                ApiKey: {
                    type: "apiKey",
                    in: "header",
                    name: "x-auth-key",
                },
            }
        },
    },
    apis: ["./controllers/**/*.{js,mjs,yaml}", "./components.yaml"],
}

const specification = swaggerJSDoc(options)

export class ApiController {
    static routes = express.Router()

    static {
        /**
         * @openapi
         * /api/docs:
         *      get:
         *          summary: "View automatically generated API documentation"
         *          tags: [Documentation]
         *          responses:
         *            '200':
         *              description: 'Swagger documentation page'
         */
        this.routes.use("/docs", swaggerUI.serve, swaggerUI.setup(specification))

        // Setup OpenAPI specification validation middleware
        this.routes.use(ApiValidator.middleware({
            apiSpec: specification,
            validateRequests: true,
            validateResponses: true,
        }))

        // Setup error response for OpenAPI specification validation middleware
        this.routes.use((err, req, res, next) => {
            // format error
            res.status(err.status || 500).json({
                status: err.status,
                message: err.message,
                errors: err.errors,
            })
        })

        // Define API endpoints routes
        this.routes.get("/products", this.getProducts)
        this.routes.get("/products/:id", this.getProductById)
        this.routes.post("/products", this.createProduct)
        this.routes.patch("/products/:id", this.updateProduct)
        this.routes.delete("/products/:id", this.deleteProduct)
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
            const products = await ProductModel.getAll()
            res.status(200).json(products)
        } catch (error) {
            res.status(500).json({
                message: "Failed to load products from database",
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