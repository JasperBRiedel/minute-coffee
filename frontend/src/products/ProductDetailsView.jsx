import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { fetchAPI } from "../api.mjs"
import { FaCoffee } from "react-icons/fa"
import { currencyFormatter } from "../common/currency.mjs"

function ProductDetailsView() {
    const { productId } = useParams()
    const [product, setProduct] = useState(null)
    const [status, setStatus] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (productId) {
            fetchAPI("GET", "/products/" + productId)
                .then(response => {
                    if (response.status == 200) {
                        setProduct(response.body)
                        setStatus(null)
                    } else {
                        setStatus(response.body.message)
                    }
                })
                .catch(error => {
                    setStatus(error)
                })
        }
    }, [productId, setProduct, setStatus])

    return <section className="flex flex-col items-center gap-4 p-4">
        {!status && !product && <span className="loading loading-spinner loading-xl"></span>}
        {status && <span className="self-center">{status}</span>}
        {!status && product
            && <>
                <h1 className="text-3xl">{product.name}</h1>
                <FaCoffee className="aspect-square size-40" />
                <button
                onClick={() => navigate("/checkout/" + product.id)}
                 className="btn btn-outline btn-xl self-stretch">
                    {currencyFormatter.format(product.price)} - Buy
                    </button>
                <p className="text-lg">{product.description}</p>
            </>
        }
    </section>
}

export default ProductDetailsView