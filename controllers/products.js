import express from "express";
import access_control from "../access_control.js";
import * as ProductStaff from "../models/products-staff.js";
import * as Products from "../models/products.js";

const productController = express.Router();

productController.get("/product_list", (request, response) => {
    if (request.query.search_term) {
        Products.getBySearch(request.query.search_term).then(products => {
            response.render("product_list.ejs", { products });
        });
    } else {
        Products.getAll().then(products => {
            response.render("product_list.ejs", { products });
        });
    }
});

productController.get("/product_checkout", (request, response) => {
    if (request.query.id) {
        if (!/[0-9]{1,}/.test(request.query.id)) {
            response.render("status.ejs", {
                status: "Invalid product ID",
                message: "Please pick another product.",
            });
            return;
        }

        Products.getById(request.query.id)
            .then(product => {
                response.render("product_checkout.ejs", { product });
            }).catch(error => {
                response.render("status.ejs", {
                    status: "Product not found",
                    message: error
                });
            })
    }
});

productController.get(
    "/product_admin",
    access_control(["admin", "stock"]),
    (request, response) => {
        const editID = request.query.edit_id;
        if (editID) {
            Products.getById(editID).then(editProduct => {

                ProductStaff.getAll().then(productsStaff => {
                    response.render("product_admin.ejs", {
                        productsStaff,
                        editProduct,
                        accessRole: request.session.user.accessRole,
                    });
                });
            }).catch(error => {
                response.render("status.ejs", {
                    status: "Edit product not found",
                    message: error
                });
            })
        } else {
            ProductStaff.getAll().then(productsStaff => {
                response.render("product_admin.ejs", {
                    productsStaff,
                    editProduct: Products.newProduct(0, "", 0, 0, "", 0),
                    accessRole: request.session.user.accessRole,
                });
            });
        }
    }
);

productController.post(
    "/edit_product",
    access_control(["admin", "stock"]),
    (request, response) => {
        const formData = request.body
        // TODO: Validation of input data  

        // TODO: Sanitisation of input data  

        const editedProduct = Products.newProduct(
            formData.product_id,
            formData.name,
            formData.stock,
            formData.price,
            formData.description,
            request.session.user.staffID
        )

        if (formData.action == "create") {
            Products.create(editedProduct).then(([result]) => {
                response.redirect("/product_admin");
            }).catch(error => {
                response.render("status.ejs", {
                    status: "Failed to create",
                    message: "Database failed to create product."
                })
            })
        } else if (formData.action == "update") {
            Products.update(editedProduct).then(([result]) => {
                response.redirect("/product_admin");
            }).catch(error => {
                response.render("status.ejs", {
                    status: "Failed to update",
                    message: "Database failed to update product."
                })
            })
        } else if (formData.action == "delete") {
            Products.deleteById(editedProduct.id).then(([result]) => {
                response.redirect("/product_admin");
            }).catch(error => {
                response.render("status.ejs", {
                    status: "Failed to delete",
                    message: "Database failed to delete product, is it referenced somewhere?"
                })
            })
        }
    }
);

export default productController;
