import express from "express"
import * as Sales from "../models/sales.js"

const saleController = express.Router()

saleController.get("/sales", (request, response) => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const today = new Date().getDay() // returns an integer (0 = Sunday, 6 = Saturday)

    // Since the SQL query is retrieving all sales between now and 7 days away,
    // it would make sense to display the next seven days.

    // We can map over the days of the week array, since the indexes match the 
    // integers returned by getDay()
    const upcomingDaysOfWeek = daysOfWeek.map((day, index) => {
        if (today + index < 7) return daysOfWeek[today + index]
        return daysOfWeek[today + index - 7]
    })

    // To be used on product and sale prices
    const currencyFormatter = new Intl.NumberFormat('en-au', {
        style: "currency",
        currency: "AUD"
    })

    // Database query returning all the sales within the next seven days
    Sales.getAllSalesThisWeek().then(([sales]) => {
        // mapping over the sales and formatting the relevant data
        const salesWithDays = sales.map(sale => {
            // returning a new object (denoted by the {})
            return {
                // spreads the original sales object into this new object
                ...sale,
                // we are using the integer value of sale.sale_day to be the index
                // of the daysOfWeek array. Example: daysOfWeek[0] = "Sunday"
                sale_day: daysOfWeek[sale.sale_day],
                // Number formatting for prices and percentages to display nicely
                product_price: currencyFormatter.format(sale.product_price),
                sale_price: currencyFormatter.format(sale.sale_price),
                percentage_off: Number(sale.percentage_off) * 100 + "%",
            }
        })

        // Now that we have properly formatted sales objects, we should match them
        // to the upcoming days of the week:
        const salesThisWeek = upcomingDaysOfWeek.map((day) => {
            // Return a new object with the day of the week, and sales on this day
            return {
                day,
                // this filter function creates a new array and only allows
                // sales that have a sale_day that matches the current iteration
                sales: salesWithDays.filter(sale => sale.sale_day == day)
            }
        })

        response.render("sales_list.ejs", { sales: salesThisWeek })
    })
})

export default saleController