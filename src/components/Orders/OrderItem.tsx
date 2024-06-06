import { ChangeEventHandler, FC, useEffect, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { CloseOrder, OrderRes, PositionFriendly, PositionToFriendly } from '../../api/Order';
import { FaArrowRightLong } from 'react-icons/fa6';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

interface OrderItemProps extends OrderRes {
    selectOrder: ChangeEventHandler<HTMLInputElement>;
    userOrderAddress?: Address;
    isSelectable?: boolean;
}

const OrderItem: FC<OrderItemProps> = (props) => {
    const [fromPos, setFromPos] = useState<PositionFriendly>();
    const [toPos, setToPos] = useState<PositionFriendly>();
    const [tonConnectUI] = useTonConnectUI();

    useEffect(() => {
        async function loadPositionRepr() {
            setFromPos(await PositionToFriendly(props.fromAddress, false, props.fromAmount));
            setToPos(await PositionToFriendly(props.toMasterAddress, true, props.toAmount));
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
            {props.isSelectable ? (
                <input
                    type="checkbox"
                    id={props.orderId}
                    name="orders"
                    className="w-5 h-5 mr-5 text-blue-600 rounded  dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    onChange={props.selectOrder}
                />
            ) : (
                <></>
            )}
            <div className="w-28 min-w-24">
                From:
                {fromPos ? (
                    <div className="font-bold flex items-center">
                        {fromPos.amount}
                        <img
                            src={fromPos.imgUrl}
                            alt={fromPos.currency}
                            className="size-4 ml-1 inline rounded-full outline outline-[1px] outline-offset-[-1px] outline-stroke"
                        />
                        {fromPos.currency}
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
            <FaArrowRightLong className="ml-2 mr-8" />
            <div className="w-28 min-w-24">
                To:
                {toPos ? (
                    <div className="font-bold flex items-center">
                        {toPos.amount}
                        <img
                            src={toPos.imgUrl}
                            alt={toPos.currency}
                            className="size-4 ml-1 inline rounded-full outline outline-[1px] outline-offset-[-1px] outline-stroke"
                        />
                        {toPos.currency}
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
            <div className="ml-auto hover:bg-gray-300">
                <FaRegTrashAlt onClick={CloseOrderUI} fontSize="1.1em" />
            </div>
        </a>
    );
};

export default OrderItem;
