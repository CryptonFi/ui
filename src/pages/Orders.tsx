import { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { useTonAddress } from '@tonconnect/ui-react';
import { FetchOrderDetails, OrderRes } from '../api/Order';
import OrderItem from '../components/Orders/OrderItem';
import Button from '../components/ui/Button';
import NewOrderModal from '../components/Orders/NewOrderModal';

const OrdersPage: FC = () => {
    const [orders, setOrders] = useState<Array<OrderRes>>([]);
    const [userAddress, setUserAddress] = useState<string>('');
    const [showCreateOrder, setShowCreateOrder] = useState<boolean>(false);

    const { pathname } = useLocation();
    let addr = pathname === '/' ? useTonAddress() : useParams().address || '';
    if (userAddress !== addr) setUserAddress(addr);

    useEffect(() => {
        if (userAddress === '') {
            return;
        }

        async function fetchData() {
            setOrders(await FetchOrderDetails(userAddress!));
        }
        fetchData();
    }, [userAddress]);

    return (
        <div className="orderDetails">
            <div>
                <h1 className="text-3xl m-7">{pathname === '/' ? 'My orders:' : 'User orders:'}</h1>
                {orders.length > 0 ? (
                    orders.map((o, id) => <OrderItem key={id} {...o} />)
                ) : (
                    <span>No orders yet :(</span>
                )}
            </div>
            <Button title={'Create new order'} className="my-3 mx-3" onClick={() => setShowCreateOrder(true)} />
            <Button title={'Execute order'} className="my-3" />

            <NewOrderModal showModal={showCreateOrder} closeModal={() => setShowCreateOrder(false)} />
        </div>
    );
};

export default OrdersPage;
