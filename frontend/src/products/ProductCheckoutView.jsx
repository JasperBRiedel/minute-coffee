import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { fetchAPI } from "../api.mjs"
import { currencyFormatter } from "../common/currency.mjs"
import validator from "validator"

function ProductCheckoutView() {
    const navigate = useNavigate()

    // Handle product loading
    const { productId } = useParams()
    const [product, setProduct] = useState(null)
    const [status, setStatus] = useState(null)

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

    // Order details state
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    
    
    // Form validation and submission state
    const [validationErrors, setValidationErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const submitOrder = useCallback(() => {
        setLoading(true)

        const validationErrors = {}
        if (!/^[a-z-A-Z\-\'\ ]{2,}$/.test(firstName)) {
            validationErrors["firstName"] = "Missing or invalid first name."
        }
        if (!/^[a-z-A-Z\-\'\ ]{1,}$/.test(lastName)) {
            validationErrors["lastName"] = "Missing or invalid last name."
        }
        if (!validator.isMobilePhone(phone)) {
            validationErrors["phone"] = "Missing or invalid phone number."
        }
        if (!validator.isEmail(email)) {
            validationErrors["email"] = "Missing or invalid email."
        }
        setValidationErrors(validationErrors)

        // Early return if there was validation errors
        if (Object.keys(validationErrors).length > 0) {
            return
        }

        fetchAPI("POST", "/orders", {
            productId: product.id,
            customerFirstName: firstName,
            customerLastName: lastName,
            customerPhone: phone,
            customerEmail: email,
        })
            .then(response => {
                if (response.status == 200) {
                    navigate("/orders/"+response.body.id)
                } else {
                    setStatus("Failed to create order - " + response.body.message)
                    setLoading(false)
                }
            })
            .catch(error => {
                setStatus("Failed to create order - " + error)
                setLoading(false)
            })
    }, [
        product, 
        firstName, 
        lastName, 
        phone, 
        email, 
        setValidationErrors, 
        setStatus, 
        setLoading,
        navigate
    ])

    return <section className="flex flex-col items-center gap-4 p-4">
        {!status && !product && <span className="loading loading-spinner loading-xl"></span>}
        {status && <span className="self-center">{status}</span>}
        {!status && product
            && <>
                <h1 className="text-3xl">{product.name}</h1>
                <fieldset className="fieldset rounded-box border p-4 self-stretch">
                    <legend className="fieldset-legend text-xl p-2">Order Details</legend>

                    <label className="label">First Name</label>
                    <input
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        type="text" className="input w-full" placeholder="Jane" />
                    {validationErrors["firstName"] &&
                        <label className="label text-red-500 justify-self-end">
                            {validationErrors["firstName"]}
                        </label>
                    }

                    <label className="label">Last Name</label>
                    <input
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        type="text" className="input w-full" placeholder="Doe" />
                    {validationErrors["lastName"] &&
                        <label className="label text-red-500 justify-self-end">
                            {validationErrors["lastName"]}
                        </label>
                    }

                    <label className="label">Phone</label>
                    <input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        type="tel" className="input w-full" placeholder="0400000000" />
                    {validationErrors["phone"] &&
                        <label className="label text-red-500 justify-self-end">
                            {validationErrors["phone"]}
                        </label>
                    }

                    <label className="label">Email</label>
                    <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        type="email" className="input w-full" placeholder="jane@doe.mail" />
                    {validationErrors["email"] &&
                        <label className="label text-red-500 justify-self-end">
                            {validationErrors["email"]}
                        </label>
                    }
                </fieldset>
                <button
                    onClick={() => submitOrder()}
                    disabled={loading}
                    className="btn btn-outline btn-xl self-stretch">
                    {currencyFormatter.format(product.price)} - Pay
                    {loading && <span className="loading loading-spinner loading-sm"></span>}
                </button>
            </>
        }
    </section>
}

export default ProductCheckoutView