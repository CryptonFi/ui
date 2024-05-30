import { ChangeEventHandler, FC, useEffect, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { CloseOrder, OrderRes, PositionToString } from '../../api/Order';
import { FaArrowRightLong } from 'react-icons/fa6';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import tonLogo from '../../assets/ton.png';

interface OrderItemProps extends OrderRes {
    selectOrder: ChangeEventHandler<HTMLInputElement>;
    userOrderAddress?: Address;
}

const OrderItem: FC<OrderItemProps> = (props) => {
    const [fromStr, setFromStr] = useState('');
    const [toStr, setToStr] = useState('');
    const [tonConnectUI] = useTonConnectUI();

    const tonImg = (
        <img
            src={tonLogo}
            alt="TON"
            className="size-6 ml-1 inline rounded-full outline outline-[1px] outline-offset-[-1px] outline-stroke"
        ></img>
    );
    // TODO: add other jetton logos
    const fromLogo = !props.fromAddress ? tonImg : '';
    const toLogo = !props.toAddress ? tonImg : '';

    useEffect(() => {
        async function loadPositionRepr() {
            setFromStr(await PositionToString(props.fromAddress, false, props.fromAmount));
            setToStr(await PositionToString(props.toMasterAddress, true, props.toAmount));
        }
        loadPositionRepr();
    }, []);

    const CloseOrderUI = () => {
        if (props.userOrderAddress) {
            CloseOrder(tonConnectUI, props.userOrderAddress, props.orderId).catch((e) =>
                console.error(`Order removal failed with: ${e}`)
            );
        } else {
            console.error(`userOrderAddress is undefined`);
        }
    };

    return (
        <a href="#" className="block p-6 bg-white border border-gray-200 rounded-lg shadow flex items-center">
            <input
                type="checkbox"
                id={props.orderId}
                name="orders"
                className="w-5 h-5 mr-5 text-blue-600 rounded  dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                onChange={props.selectOrder}
            />
            <div className="">
                From:
                <p className="font-bold flex items-center">
                    {fromStr} {fromLogo}
                </p>
            </div>
            <FaArrowRightLong className="mx-8" />
            <div>
                To:
                <p className="font-bold flex items-center">
                    {toStr} {toLogo}
                </p>
            </div>
            <div className="ml-auto hover:bg-gray-300">
                <FaRegTrashAlt onClick={CloseOrderUI} fontSize="1.1em" />
            </div>
        </a>
    );
};

export default OrderItem;
