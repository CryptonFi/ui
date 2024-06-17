import { ChangeEventHandler, FC, useEffect, useState } from 'react';
import { CloseOrder, OrderRes, PositionFriendly, PositionToFriendly } from '../../api/Order';
import { FaArrowRightLong } from 'react-icons/fa6';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { FaRegTrashAlt } from 'react-icons/fa';
import { PriceComponent } from '../Price.tsx';

interface OrderItemProps extends OrderRes {
    selectOrder: ChangeEventHandler<HTMLInputElement>;
    userOrderAddress?: Address;
    isSelectable?: boolean;
    isCloseable?: boolean;
    onClose: Function;
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
            props.onClose();
            CloseOrder(tonConnectUI, props.userOrderAddress, props.orderId).catch((e) =>
                console.error(`Order removal failed with: ${e}`)
            );
        } else {
            console.error(`userOrderAddress is undefined`);
        }
    };

    return (
        <a href="#" className="p-4 bg-white border border-gray-200 rounded-lg shadow flex items-center">
            {props.isSelectable ? (
                <input
                    type="checkbox"
                    id={props.orderId}
                    name="orders"
                    className="w-5 h-5 mr-3 sm:mr-3 md:mr-3 lg:mr-3 xl:mr-5 text-blue-600 rounded  dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    onChange={props.selectOrder}
                />
            ) : (
                <></>
            )}
            <div className="w-28 min-w-24">
                <span className="text-sm">From:</span>
                {fromPos ? (
                    <div>
                        <div className="text-xl flex items-center">
                            {fromPos.amount}
                            <img
                                src={fromPos.imgUrl}
                                alt={fromPos.currency}
                                className="size-5 ml-1 inline rounded-full outline outline-[1px] outline-offset-[-1px] outline-stroke"
                            />
                            {fromPos.currency}
                        </div>
                        <div className="text-sm text-gray-500">
                            <PriceComponent tokenSymbol={fromPos.currency} amount={fromPos.amount} />
                        </div>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
            <FaArrowRightLong className="ml-2 mr-6 xl:mr-8" />
            <div className="w-28 min-w-24">
                <span className="text-sm">To:</span>
                {toPos ? (
                    <div>
                        <div className="text-xl flex items-center">
                            {toPos.amount}
                            <img
                                src={toPos.imgUrl}
                                alt={toPos.currency}
                                className="size-5 ml-1.5 inline rounded-full outline outline-[1px] outline-offset-[-1px] outline-stroke"
                            />
                            {toPos.currency}
                        </div>
                        <div className="text-sm text-gray-500">
                            <PriceComponent tokenSymbol={toPos.currency} amount={toPos.amount} />
                        </div>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
            {props.isCloseable ? (
                <div className="ml-auto hover:bg-gray-300">
                    <FaRegTrashAlt onClick={CloseOrderUI} fontSize="1.3em" />
                </div>
            ) : (
                <></>
            )}
        </a>
    );
};

export default OrderItem;
