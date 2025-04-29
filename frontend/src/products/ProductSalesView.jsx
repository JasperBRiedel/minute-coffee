import { Fragment, useCallback, useEffect, useState } from "react"
import { FaCoffee } from "react-icons/fa"
import { fetchAPI } from "../api.mjs"

function ProductSalesView() {
    const [productSalesByDay, setProductSalesByDay] = useState({})
    const [error, setError] = useState(null)

    // Define how to get sales from the API
    const getProductSales = useCallback(() => {
        // Get today's date
        const today = new Date()

        // Calculate the date of the Monday of the current week
        const mondayOfThisWeek = new Date()
        mondayOfThisWeek.setDate(today.getDate() - (today.getDay() - 1))
        const startDate = toLocaleDateString(mondayOfThisWeek)

        // Calculate the date of the Sunday of the current week
        const sundayOfThisWeek = new Date(mondayOfThisWeek)
        sundayOfThisWeek.setDate(sundayOfThisWeek.getDate() + 6)
        const endDate = toLocaleDateString(sundayOfThisWeek)

        fetchAPI("GET", `/products/sales?start_date=${startDate}&end_date=${endDate}`)
            .then(response => {
                if (response.status == 200) {
                    if (response.body.length > 0) {
                        setProductSalesByDay(partitionByDay(response.body))
                        setError(null)
                    } else {
                        setProductSalesByDay({})
                        setError("No results")
                    }
                } else {
                    setError(response.body.message)
                }
            })
            .catch(error => {
                setError(error)
            })
    }, [setProductSalesByDay])

    // Fetch sales on first render
    useEffect(() => {
        getProductSales()
    }, [getProductSales])

    return <section className="flex flex-col items-center">
        {error && <span className="p-4 self-center">{error}</span>}
        {!error && Object.entries(productSalesByDay).length == 0
            ? <span className="loading loading-spinner loading-xl"></span>
            : <ul className="list bg-base-100 self-stretch">
                {Object.entries(productSalesByDay).map(([day, productSales]) =>
                    <Fragment key={day}>
                        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">{day}</li>
                        {productSales.map(productSale =>
                            <li key={productSale.sale.id} className="list-row">
                                <div>
                                    <FaCoffee className="size-10" />
                                </div>
                                <div>
                                    <div>{productSale.product.name}</div>
                                    <div className="text-xs uppercase font-semibold opacity-60">
                                        <span className="font-bold">
                                            {currencyFormatter.format(
                                                productSale.product.price * productSale.sale.discountPercentage
                                            )}
                                        </span>
                                        <span className="pl-4 line-through">
                                            {currencyFormatter.format(productSale.product.price)}
                                        </span>
                                    </div>
                                </div>
                                <button className="btn btn-ghost text-xl">
                                    Buy
                                </button>
                            </li>
                        )}
                    </Fragment>
                )}
            </ul>
        }
    </section>
}

// Create a currency formatter so we can convert numbers like 10 into $10.00
const currencyFormatter = new Intl.NumberFormat('en-au', {
    style: "currency",
    currency: "AUD"
})

function toLocaleDateString(date) {
    const year = date.toLocaleString('default', { year: 'numeric' });
    const month = date.toLocaleString('default', { month: '2-digit' })
    const day = date.toLocaleString('default', { day: '2-digit' });

    return [year, month, day].join('-');
}

function partitionByDay(productSales) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    const dayPartitions = {
        "Monday": [],
        "Tuesday": [],
        "Wednesday": [],
        "Thursday": [],
        "Friday": [],
        "Saturday": [],
        "Sunday": [],
    }

    for (const productSale of productSales) {
        const dayOfProductSale = daysOfWeek[new Date(productSale.sale.date).getDay()]
        dayPartitions[dayOfProductSale].push(productSale)
    }

    return dayPartitions
}

export default ProductSalesView