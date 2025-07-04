import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router"

import './index.css'
import Layout from './Layout.jsx'
import ProductListView from './products/ProductListView.jsx'
import ProductSalesView from './products/ProductSalesView.jsx'
import LoginView from './authentication/LoginView.jsx'
import OrderManagementView from './orders/OrderManagementView.jsx'
import { AuthenticationProvider } from './authentication/useAuthenticate.jsx'
import ProductDetailsView from './products/ProductDetailsView.jsx'
import ProductCheckoutView from './products/ProductCheckoutView.jsx'
import OrderConfirmationView from './orders/OrderConfirmationView.jsx'

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        index: true,
        Component: ProductListView
      },
      {
        path: "/products/:productId",
        Component: ProductDetailsView
      },
      {
        path: "/checkout/:productId",
        Component: ProductCheckoutView
      },
      {
        path: "/orders/:orderId",
        Component: OrderConfirmationView
      },
      {
        path: "/sales",
        Component: ProductSalesView
      },
      {
        path: "/staff/login",
        Component: LoginView
      },
      {
        path: "/staff/orders",
        Component: OrderManagementView
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthenticationProvider>
      <RouterProvider router={router} />
    </AuthenticationProvider>
  </StrictMode>,
)
