import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Error from './pages/error/Error';
import AdminPage from './pages/admin/Admin';
import OrdersPage from './pages/orders/Orders';

export const router = createBrowserRouter(
    [
        {
            path: '',
            element: <App />,
            errorElement: <Error />,
            children: [
                { path: '', element: <OrdersPage /> },
                { path: '/admin', element: <AdminPage /> },
                { path: '/orders', element: <OrdersPage /> },
            ],
        },
    ],
    { basename: '/ui' }
);
