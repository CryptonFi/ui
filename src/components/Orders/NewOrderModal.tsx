import { FC, useEffect, useState } from 'react';
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { CURRENCY_ADDRESSES } from '../../api/Config';
import { CreateJettonJettonOrder, CreateJettonTonOrder, CreateTonJettonOrder } from '../../api/Order';
import { PriceComponent } from '../Price';
import { LuWallet } from 'react-icons/lu';
import { GetTokenBalance } from '../../api/Balance';

interface NewOrderModalProps {
    showModal: boolean;
    closeModal: Function;
}

const NewOrderModal: FC<NewOrderModalProps> = ({ showModal, closeModal }) => {
    const [selectedFrom, setSelectedFrom] = useState<string>('TON');
    const [selectedTo, setSelectedTo] = useState<string>('USD₮');
    const [amountFrom, setAmountFrom] = useState<string>('');
    const [amountTo, setAmountTo] = useState<string>('');
    const [userBalance, setUserBalance] = useState<number>(0);
    const [alertText, setAlertText] = useState<string>('');

    const [tonConnectUI] = useTonConnectUI();
    const userAddress = useTonAddress();
    const tonWallet = useTonWallet();

    useEffect(() => {
        if (!userAddress || !tonWallet) return;
        GetTokenBalance(tonWallet, userAddress, selectedFrom).then((i) => setUserBalance(Number(i)));
    }, [selectedFrom, userAddress, tonWallet]);

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (userBalance !== undefined && userBalance !== null && Number(amountFrom) > userBalance) {
            setAlertText('Not enough balance!');
            return false;
        }

        const formData = new FormData(event.currentTarget);

        const fromCurr = formData.get('from-curr')?.toString() || '';
        const fromAmountStr = formData.get('from-amount')?.toString() || '';

        const toCurr = formData.get('to-curr')?.toString() || '';
        const toAmountStr = formData.get('to-amount')?.toString() || '';

        if (fromCurr !== 'TON' && toCurr !== 'TON') {
            CreateJettonJettonOrder(
                tonConnectUI,
                userAddress,
                CURRENCY_ADDRESSES[fromCurr].address,
                fromAmountStr,
                CURRENCY_ADDRESSES[toCurr].address,
                toAmountStr
            ).catch((e: any) => console.error(`Order creation failed with: ${e}`));
        } else if (fromCurr === 'TON' && toCurr !== 'TON') {
            CreateTonJettonOrder(
                tonConnectUI,
                userAddress,
                fromAmountStr,
                CURRENCY_ADDRESSES[toCurr].address,
                toAmountStr
            ).catch((e: any) => console.error(`Order creation failed with: ${e}`));
        } else if (fromCurr !== 'TON' && toCurr === 'TON') {
            CreateJettonTonOrder(
                tonConnectUI,
                userAddress,
                CURRENCY_ADDRESSES[fromCurr].address,
                fromAmountStr,
                toAmountStr
            ).catch((e: any) => console.error(`Order creation failed with: ${e}`));
        } else {
            console.error('Unsupported order type');
        }

        closeModal();
    };

    const modalHtml = (
        <div
            id="new-order-modal"
            tabIndex={-1}
            aria-hidden="true"
            className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-white/0.35 backdrop-blur-md shadow"
        >
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create a new order</h3>
                        <button
                            type="button"
                            className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => closeModal()}
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                    {/* Body */}
                    <div className="p-4 md:p-5">
                        <form className="space-y-2" onSubmit={handleSubmit}>
                            <div className="from flex flex-row items-center justify-between">
                                <label
                                    htmlFor="from-amount"
                                    className="text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    From:
                                </label>
                                <div className="flex items-center flex-row text-sm text-blue-500">
                                    <LuWallet />
                                    <span
                                        id="user-balance"
                                        className="ml-1"
                                        onClick={() => {
                                            const c = document.getElementById('user-balance')?.textContent || '';
                                            setAmountFrom(c);
                                        }}
                                    >
                                        {userBalance}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-row">
                                <select
                                    id="from-curr"
                                    name="from-curr"
                                    className="mr-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                    onChange={(e) => {
                                        setSelectedFrom(e.target.value);
                                        setAmountFrom('');
                                    }}
                                    defaultValue={selectedFrom}
                                >
                                    {Object.keys(CURRENCY_ADDRESSES)
                                        .filter((i) => i !== selectedTo)
                                        .map((i) => (
                                            <option key={i} value={i}>
                                                {i}
                                            </option>
                                        ))}
                                </select>
                                <input
                                    type="number"
                                    name="from-amount"
                                    id="from-amount"
                                    className="text-right bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="0"
                                    min="0"
                                    step=".001"
                                    onChange={(e) => {
                                        setAmountFrom(e.target.value);
                                        if (
                                            userBalance !== undefined &&
                                            userBalance !== null &&
                                            Number(e.target.value) > userBalance
                                        ) {
                                            e.target.style.color = 'red';
                                        } else {
                                            e.target.style.color = 'black';
                                        }
                                    }}
                                    value={amountFrom}
                                    required
                                />
                            </div>
                            <div className="text-sm text-gray-500 flex justify-end">
                                <PriceComponent tokenSymbol={selectedFrom} amount={Number(amountFrom)} />
                            </div>
                            <div>
                                <label
                                    htmlFor="to-amount"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    To:
                                </label>
                            </div>
                            <div className="flex flex-row">
                                <select
                                    id="to-curr"
                                    name="to-curr"
                                    className="mr-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                    onChange={(e) => setSelectedTo(e.target.value)}
                                    defaultValue={selectedTo}
                                >
                                    {Object.keys(CURRENCY_ADDRESSES)
                                        .filter((i) => i !== selectedFrom)
                                        .map((i) => (
                                            <option key={i} value={i}>
                                                {i}
                                            </option>
                                        ))}
                                </select>
                                <input
                                    type="number"
                                    name="to-amount"
                                    id="to-amount"
                                    className="text-right bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="0"
                                    min="0"
                                    step=".001"
                                    onChange={(e) => setAmountTo(e.target.value)}
                                    value={amountTo}
                                    required
                                />
                            </div>
                            <div className="text-sm text-gray-500 flex justify-end">
                                <PriceComponent tokenSymbol={selectedTo} amount={Number(amountTo)} />
                            </div>
                            <Alert text={alertText} show={alertText !== ''} closeAlert={() => setAlertText('')} />
                            <Button title="Create"></Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

    if (showModal) return modalHtml;
    else return <></>;
};

export default NewOrderModal;
