import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Error from './pages/Error';
import AdminPage from './pages/Admin';
import OrdersPage from './pages/Orders';

export const router = createBrowserRouter(
    [
        {
            path: '',
            element: <App />,
            errorElement: <Error />,
            children: [
                { path: '', element: <OrdersPage /> },
                { path: '/admin', element: <AdminPage /> },
                { path: '/admin/contract/:address', element: <OrdersPage /> },
            ],
        },
    ],
    { basename: '/ui' }
);
