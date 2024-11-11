import express from "express"
import * as SalesProducts from "../models/sales-products.js"

const saleController = express.Router()

saleController.get("/sales", (request, response) => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const today = new Date() 

    // Calculate the date of the Monday of the current week
    const mondayOfThisWeek = new Date()
    mondayOfThisWeek.setDate(today.getDate() - (today.getDay() - 1))
    
    // Calculate the date of the Sunday of the current week
    const sundayOfThisWeek = new Date(mondayOfThisWeek)
    sundayOfThisWeek.setDate(sundayOfThisWeek.getDate() + 6)
    
    // Build an object with days as keys and lists of sale products as values
    const salesByDay = {
        "Monday": [],
        "Tuesday": [],
        "Wednesday": [],
        "Thursday": [],
        "Friday": [],
        "Saturday": [],
        "Sunday": [],
    }
    
    // Create a currency formatting so we can convert numbers like 10 into $10.00
    const currencyFormatter = new Intl.NumberFormat('en-au', {
        style: "currency",
        currency: "AUD"
    })
    
    // Query the database for the sale products between the start and end of the week
    SalesProducts.getByDateRange(mondayOfThisWeek, sundayOfThisWeek)
        .then(productsOnSaleThisWeek => {
            
            // Add each of the sale products to it's respective day
            for (const saleProduct of productsOnSaleThisWeek) {
                const saleDayName = daysOfWeek[saleProduct.sale_date.getDay()]
                salesByDay[saleDayName].push(saleProduct)
            }
            
            // Render the sales page
            response.render("sales_list.ejs", { salesByDay, currencyFormatter })
        })
})

export default saleController