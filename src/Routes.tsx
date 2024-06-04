import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Error from './pages/Error';
import Admin from './pages/Admin';
import Orders from './pages/Orders';

export const router = createBrowserRouter(
    [
        {
            path: '',
            element: <App />,
            errorElement: <Error />,
            children: [
                { path: '', element: <Orders /> },
                { path: '/admin', element: <Admin /> },
            ],
        },
    ],
    { basename: '/ui' }
);
