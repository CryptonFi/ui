import { ChangeEventHandler, FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { ExecuteOrders, FetchOrderDetails, GetUserOrderAddress, OrderRes } from '../api/Order';
import OrderItem from '../components/Orders/OrderItem';
import Button from '../components/ui/Button';
import NewOrderModal from '../components/Orders/NewOrderModal';
import { Address } from '@ton/core';

const OrdersPage: FC = () => {
    const [orders, setOrders] = useState<Array<OrderRes>>([]);
    const [userAddress, setUserAddress] = useState<string>('');
    const [userOrderAddress, setUserOrderAddress] = useState<Address>();
    const [showCreateOrder, setShowCreateOrder] = useState<boolean>(false);
    const [selectedOrders, setSelectedOrders] = useState<Array<string>>([]);

    const [tonConnectUI] = useTonConnectUI();
    const curUserAddress = useTonAddress();

    const { pathname } = useLocation();
    let addr = pathname === '/' ? curUserAddress : useParams().address || '';
    if (userAddress !== addr) setUserAddress(addr);

    useEffect(() => {
        if (userAddress === '') return;
        GetUserOrderAddress(userAddress).then(setUserOrderAddress);
    }, [userAddress]);
    useEffect(() => {
        if (userOrderAddress === undefined) return;
        FetchOrderDetails(userOrderAddress!).then(setOrders);
    }, [userOrderAddress]);

    const selectOrdersFunc: ChangeEventHandler<HTMLInputElement> = (e) => {
        if (e.target.checked) setSelectedOrders([...selectedOrders, e.target.id]);
        else setSelectedOrders(selectedOrders.filter((i) => i !== e.target.id));
    };

    const executeSelectedOrders = () => {
        const ordersList = orders.filter((i) => selectedOrders.includes(i.orderId));
        if (userOrderAddress)
            ExecuteOrders(tonConnectUI, userOrderAddress, curUserAddress, ordersList)
                .then(() => {
                    setSelectedOrders([]);
                })
                .catch((e) => console.error(`Order execution failed with: ${e}`));
    };

    return (
        <div className="orderDetails">
            <div>
                <h1 className="text-3xl m-7">{pathname === '/' ? 'My orders:' : 'User orders:'}</h1>
                {orders.length > 0 ? (
                    orders.map((o, id) => (
                        <OrderItem key={id} {...o} selectOrder={selectOrdersFunc} userOrderAddress={userOrderAddress} />
                    ))
                ) : (
                    <span>No orders yet :(</span>
                )}
            </div>
            <Button title={'Create new order'} className="my-3 mx-3" onClick={() => setShowCreateOrder(true)} />
            <Button
                title={'Execute order'}
                className="my-3"
                onClick={executeSelectedOrders}
                disabled={selectedOrders.length === 0}
            />

            <NewOrderModal showModal={showCreateOrder} closeModal={() => setShowCreateOrder(false)} />
        </div>
    );
};

export default OrdersPage;
