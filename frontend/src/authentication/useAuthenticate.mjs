import { useCallback, useState } from "react"
import { fetchAPI } from "../api.mjs"

// TODO: Move user to context to hoist state so main and layout have access
function useAuthenticate(restrictToRoles = null) {
    const [user, setUser] = useState(null)
    const [status, setStatus] = useState(null)
    
    const getUser = useCallback((authenticationKey) => {
        if (authenticationKey) {
            fetchAPI("GET", "/employees/self", null, authenticationKey)
                .then(response => {
                    setUser(response.body)
                })
                .catch(error => {
                    setStatus("invalid key")
                })
        } 
    }, [setUser, setStatus])
    
    const login = useCallback((username, password) => {
        const body = {
            username,
            password
        }

        setStatus("authenticating")
        fetchAPI("POST", "/authenticate", body)
            .then(response => {
                if (response.status == 200) {
                    const authenticationKey = response.body.key
                    localStorage.setItem("auth-key", authenticationKey)
                    getUser(response.body.key)
                } else {
                    setStatus(response.body.message)
                }
                console.log(response)
            })
            .catch(error => {
                console.error(error)
                setStatus(error)
            })
    }, [setStatus, getUser])
    
    return {
        user,
        login,
        logout: null,
        status,
    }
}

export default useAuthenticate