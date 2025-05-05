import { useAuthenticate } from "../authentication/useAuthenticate"

export function OrderManagementView() {
    const { user, status } = useAuthenticate(["admin"])

    return <section>
        order management
        {status}
        <p>
            {JSON.stringify(user)}
        </p>
    </section>
}

export default OrderManagementView