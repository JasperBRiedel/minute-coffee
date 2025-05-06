import { useAuthenticate } from "../authentication/useAuthenticate"
import XMLDownloadButton from "../common/XMLDownloadButton"

export function OrderManagementView() {
    const { user, status } = useAuthenticate(["admin"])

    return <section className="flex flex-col items-center gap-4 p-4">
        {user
            ? <XMLDownloadButton
                route="/orders/xml"
                filename="orders.xml"
                authenticationKey={user && user.authenticationKey}
                className="btn btn-warning">Export Orders</XMLDownloadButton>
            : <span className="loading loading-spinner loading-xl"></span>
        }
    </section>
}

export default OrderManagementView