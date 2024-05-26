import { FC, useEffect, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { OrderRes, PositionToString } from '../../api/Order';
import { FaArrowRightLong } from 'react-icons/fa6';

interface OrderItemProps extends OrderRes {}

const OrderItem: FC<OrderItemProps> = (props) => {
    const [fromStr, setFromStr] = useState('');
    const [toStr, setToStr] = useState('');

    useEffect(() => {
        async function loadPositionRepr() {
            setFromStr(await PositionToString(props.fromAddress, false, props.fromAmount));
            setToStr(await PositionToString(props.toMasterAddress, true, props.toAmount));
        }
        loadPositionRepr();
    }, []);
    return (
        // <div className="card p-5 bg-base-100 shadow-xl flex items-center">
        <a
            href="#"
            className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 flex items-center"
        >
            <div className="">
                From:
                <p className="font-bold">{fromStr}</p>
            </div>
            <FaArrowRightLong className="mx-8" />
            <div>
                To:
                <p className="font-bold">{toStr}</p>
            </div>
            <FaRegTrashAlt className="ml-auto" />
        </a>
    );
};

export default OrderItem;
