import { useAuthenticate } from "../authentication/useAuthenticate"
import XMLDownloadButton from "../common/XMLDownloadButton"

export function OrderManagementView() {
    const { user, status } = useAuthenticate(["admin"])

    return <section>
        <XMLDownloadButton 
        route="/orders/xml"
        filename="orders.xml"
        authenticationKey={user && user.authenticationKey}
        className="btn btn-warning">Export Orders</XMLDownloadButton>
        order management
        {status}
        <p>
            {JSON.stringify(user)}
        </p>
    </section>
}

export default OrderManagementView