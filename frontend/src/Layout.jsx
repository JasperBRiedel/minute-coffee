import { Outlet, useLocation, useNavigate } from "react-router";
import { TbLogout } from "react-icons/tb"
import { FaClipboardList, FaCoffee, FaLock, FaMoneyBillWave } from "react-icons/fa"
import { useAuthenticate } from "./authentication/useAuthenticate";

function Layout() {
    const navigate = useNavigate()
    const location = useLocation()
    
    const {user, logout} = useAuthenticate()

    return <main className="max-w-[430px] min-h-screen mx-auto shadow ">
        <header>
            <div className="navbar justify-between bg-base-100 shadow-sm">
                <button
                    onClick={() => navigate("/")}
                    className="btn btn-ghost text-xl"
                >
                    Minute Coffee
                </button>
                {user
                    ? <button
                        onClick={() => logout()}
                        className="btn btn-ghost text-xl">
                        <TbLogout />
                    </button>
                    : <button
                        onClick={() => navigate("/staff/login")}
                        className="btn btn-ghost text-xl">
                        <FaLock />
                    </button>}
            </div>
        </header>
        <Outlet />
        <nav className="dock max-w-[430px] mx-auto">
            <button
                onClick={() => navigate("/")}
                className={location.pathname == "/" ? "dock-active" : ""}
            >
                <FaCoffee className="text-2xl" />
                <span className="dock-label">Products</span>
            </button>
            <button
                onClick={() => navigate("/sales")}
                className={location.pathname.startsWith("/sales") ? "dock-active" : ""}
            >
                <FaMoneyBillWave className="text-2xl" />
                <span className="dock-label">Sales</span>
            </button>
            <button
                disabled={!(user && user.role == "admin")}
                onClick={() => navigate("/staff/orders")}
                className={location.pathname.startsWith("/staff/orders") ? "dock-active" : ""}
            >
                <FaClipboardList className="text-2xl" />
                <span className="dock-label">Orders</span>
            </button>
        </nav>
    </main>
}

export default Layout