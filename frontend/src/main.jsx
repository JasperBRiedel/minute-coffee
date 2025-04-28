import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router"

import './index.css'
import Layout from './Layout.jsx'
import ProductListView from './products/ProductListView.jsx'
import ProductSalesView from './products/ProductSalesView.jsx'
import OrderListView from './orders/OrderListView.jsx'

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        index: true,
        Component: ProductListView
      },
      {
        path: "/sales",
        Component: ProductSalesView
      },
      {
        path: "/orders",
        Component: OrderListView
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
