import { ChangeEventHandler, FC, useEffect, useState } from 'react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useSearchParams } from 'react-router-dom';
import { Address } from '@ton/core';
import { ExecuteOrders, FetchOrderDetails, GetUserOrderAddress, OrderRes } from '../api/Order';
import OrderItem from '../components/Orders/OrderItem';
import Button from '../components/ui/Button';
import NewOrderModal from '../components/Orders/NewOrderModal';

const Orders: FC = () => {
    const [orders, setOrders] = useState<Array<OrderRes>>([]);
    const [userAddress, setUserAddress] = useState<string>('');
    const [userOrderAddress, setUserOrderAddress] = useState<Address>();
    const [showCreateOrder, setShowCreateOrder] = useState<boolean>(false);
    const [selectedOrders, setSelectedOrders] = useState<Array<string>>([]);

    const [queryParams, _] = useSearchParams();
    const urlAddr = queryParams.get('address');
    const isExternal = !!urlAddr;

    const [tonConnectUI] = useTonConnectUI();
    const addr = useTonAddress();
    if (userAddress !== addr) setUserAddress(addr);

    useEffect(() => {
        if (userAddress === '') return;

        if (isExternal) {
            setUserOrderAddress(Address.parse(urlAddr));
        } else {
            GetUserOrderAddress(userAddress).then(setUserOrderAddress);
        }
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
            ExecuteOrders(tonConnectUI, userOrderAddress, userAddress, ordersList)
                .then(() => {
                    setSelectedOrders([]);
                })
                .catch((e) => console.error(`Order execution failed with: ${e}`));
    };

    return (
        <div className="orderDetails">
            <div>
                <h1 className="text-3xl m-7">{isExternal ? 'User orders:' : 'My orders:'}</h1>
                {orders.length > 0 ? (
                    orders.map((o, id) => (
                        <OrderItem key={id} {...o} selectOrder={selectOrdersFunc} userOrderAddress={userOrderAddress} />
                    ))
                ) : (
                    <span>No orders yet :(</span>
                )}
            </div>
            <Button
                title={'Create new order'}
                className="my-3 mx-3"
                onClick={() => setShowCreateOrder(true)}
                hidden={isExternal}
            />
            <Button
                title={'Execute order'}
                className="my-3"
                onClick={executeSelectedOrders}
                hidden={!isExternal}
                disabled={selectedOrders.length === 0}
            />

            <NewOrderModal showModal={showCreateOrder} closeModal={() => setShowCreateOrder(false)} />
        </div>
    );
};

export default Orders;
