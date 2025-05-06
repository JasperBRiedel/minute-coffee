import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router"
import { fetchAPI } from "../api.mjs"

function OrderConfirmationView() {
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [status, setStatus] = useState(null)

    const getOrder = useCallback(() => {
        setOrder(null)
        if (orderId) {
            fetchAPI("GET", "/orders/" + orderId)
                .then(response => {
                    if (response.status == 200) {
                        setOrder(response.body)
                        setStatus(null)
                    } else {
                        setStatus(response.body.message)
                    }
                })
                .catch(error => {
                    setStatus(error)
                })
        }
    }, [orderId, setOrder, setStatus])

    useEffect(() => {
        getOrder()
    }, [getOrder])

    return <section className="flex flex-col items-center gap-4 p-4">
        {!status && !order && <span className="loading loading-spinner loading-xl"></span>}
        {status && <span className="self-center">{status}</span>}
        {!status && order
            && <>
                <h1 className="text-3xl">Order #{order.id}</h1>
                <span>{order.status}</span>
                <button
                    onClick={() => getOrder()}
                    className="btn btn-outline btn-xl self-stretch">
                    Refresh
                </button>
            </>
        }
    </section>
}

export default OrderConfirmationView