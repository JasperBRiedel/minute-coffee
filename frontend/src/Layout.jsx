import { Outlet, useLocation, useNavigate } from "react-router";
import { FaClipboardList, FaCoffee, FaLock, FaMoneyBillWave } from "react-icons/fa"

function Layout() {
    const navigate = useNavigate()
    const location = useLocation()

    return <main className="max-w-[430px] min-h-screen mx-auto shadow ">
        <header>
            <div className="navbar justify-between bg-base-100 shadow-sm">
                <button
                    onClick={() => navigate("/")}
                    className="btn btn-ghost text-xl"
                >
                    Minute Coffee
                </button>
                <button
                    onClick={() => navigate("/staff/login")}
                    className="btn btn-ghost text-xl"
                >
                    <FaLock />
                </button>
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
                onClick={() => navigate("/orders")}
                className={location.pathname.startsWith("/orders") ? "dock-active" : ""}
            >
                <FaClipboardList className="text-2xl" />
                <span className="dock-label">Orders</span>
            </button>
        </nav>
    </main>
}

export default Layout