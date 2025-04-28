import { useCallback, useEffect, useState } from "react"
import { FaCoffee, FaSearch, FaShoppingBasket } from "react-icons/fa"
import { fetchAPI } from "../api.mjs"

function ProductListView() {
    const [filter, setFilter] = useState("")
    const [products, setProducts] = useState([])
    const [error, setError] = useState(null)

    const getProducts = useCallback(() => {
        const request = filter.length > 0
            ? fetchAPI("GET", "/products?filter=" + filter)
            : fetchAPI("GET", "/products")

        request
            .then(response => {
                if (response.status == 200) {
                    if (response.data.length > 0) {
                        setProducts(response.data)
                        setError(null)
                    } else {
                        setProducts([])
                        setError("No results")
                    }
                } else {
                    setError(response.data.message)
                }
            })
            .catch(error => {
                setError(error.message)
            })
    }, [setProducts, filter])

    useEffect(() => {
        getProducts()
    }, [])

    return <section className="flex flex-col items-center">
        <div className="join p-4 self-stretch">
            <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                type="text"
                className="input join-item grow"
                placeholder="search products" />
            <button
                onClick={() => getProducts()}
                className="btn join-item">
                <FaSearch />
            </button>
        </div>
        {error && <span className="p-4 self-center">{error}</span>}
        {!error && products.length == 0
            ? <span className="loading loading-spinner loading-xl"></span>
            : <ul className="list bg-base-100 self-stretch">
                {products.map(product =>
                    <li key={product.id} className="list-row">
                        <div>
                            <FaCoffee className="size-10" />
                        </div>
                        <div>
                            <div>{product.name}</div>
                            <div className="text-xs uppercase font-semibold opacity-60">${product.price}</div>
                        </div>
                        <button className="btn btn-ghost text-xl">
                            Buy
                        </button>
                    </li>
                )}
            </ul>
        }
    </section>
}

export default ProductListView