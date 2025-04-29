import { useEffect, useState } from "react"
import useAuthenticate from "./useAuthenticate.mjs"
import { useNavigate } from "react-router"

function LoginView() {
    const navigate = useNavigate()
    const { login, status, user } = useAuthenticate()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    
    useEffect(() => {
        if (user) {
            navigate("/staff/orders")
        }
    }, [user, navigate])

    return <section className="flex flex-col gap-4 p-4 items-center">
        <h1 className="text-3xl">Staff Login</h1>
        <label className="input w-full">
            <span className="label">username</span>
            <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="grow" type="text" />
        </label>
        <label className="input w-full">
            <span className="label">password</span>
            <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password" />
        </label>
        <button
            onClick={() => login(username, password)}
            className="btn btn-primary btn-lg self-stretch">
                {status == "authenticating" 
                ?<span className="loading loading-spinner"></span>
            : <span>Login</span> 
            }
        </button>
        {status && status != "authenticating" && <span>{status}</span>}
    </section>
}

export default LoginView