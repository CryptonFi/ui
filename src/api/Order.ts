import { TonClient } from '@ton/ton';
import { Address, beginCell, toNano } from '@ton/core';
import { isAxiosError } from 'axios';
import { TonConnectUI } from '@tonconnect/ui-react';
import { ADDRESS_CURRENCIES, CURRENCY_ADDRESSES, MASTER_ORDER_ADDRESS } from './Config';
import { sleep } from './Helpers';
import { MasterOrder } from './Wrappers/MasterOrder';
import { OrderData, OrderType, UserOrder } from './Wrappers/UserOrder';
import { JettonMinter } from './Wrappers/JettonMinter';
import { GetTonClient } from './Client';

export type OrderRes = OrderData & { orderId: string };
export type PositionFriendly = {
    currency: string;
    amount: number;
    imgUrl: string;
};

export async function GetUserOrderAddress(userAddress: string): Promise<Address> {
    const client = await GetTonClient();
    const masterContract = client.open(new MasterOrder(MASTER_ORDER_ADDRESS));

    return await masterContract.getWalletAddress(Address.parse(userAddress));
}

export async function FetchOrderDetails(userOrderAddress: Address): Promise<Array<OrderRes>> {
    const client = await GetTonClient();
    const ordersList: Array<OrderRes> = [];
    try {
        const UserOrderContract = client.open(new UserOrder(userOrderAddress));
        const ordersDict = await UserOrderContract.getOrders();

        for (const id of ordersDict.keys()) {
            const ord = ordersDict.get(id);
            ordersList.push({
                orderId: id.toString(),
                orderType: ord?.orderType!,
                fromAddress: ord?.fromAddress!,
                fromAmount: ord?.fromAmount!,
                fromAmountLeft: ord?.fromAmountLeft!,
                toAddress: ord?.toAddress!,
                toAmount: ord?.toAmount!,
                toMasterAddress: ord?.toMasterAddress!,
            });
        }
    } catch (err: any) {
        if (err.message !== 'Unable to execute get method. Got exit_code: -13')
            console.error(`Failed to load user orders. Error: ${err}`);
        return [];
    }
    return ordersList;
}

async function GetNextOrderId(userOrderAddress: Address): Promise<number> {
    const orders = await FetchOrderDetails(userOrderAddress);
    if (orders.length > 0) {
        return Math.max(...orders.map((i) => Number(i.orderId))) + 1;
    } else {
        return 1;
    }
}

export async function PositionToFriendly(
    address: Address | null,
    isMaster: boolean,
    amount: bigint
): Promise<PositionFriendly> {
    if (!address) {
        return {
            currency: 'TON',
            amount: Number((amount * 100n) / 1_000_000_000n) / 100,
            imgUrl: 'https://raw.githubusercontent.com/CryptonFi/jettons/master/img/ton.png',
        };
    }

    const client = await GetTonClient();
    const masterAddr = isMaster ? address : await LoadMasterAddr(client, address);

    const currency = masterAddr ? ADDRESS_CURRENCIES[masterAddr.toString()] || masterAddr.toString() : '<unknown>';
    const decimals = currency in CURRENCY_ADDRESSES ? CURRENCY_ADDRESSES[currency].decimals : 1_000_000_000n;
    const amountN = Number((amount * 100n) / BigInt(decimals)) / 100;

    return {
        currency: currency,
        amount: amountN,
        imgUrl: `https://raw.githubusercontent.com/CryptonFi/jettons/master/img/${currency.toLowerCase()}.png`,
    };
}

async function LoadMasterAddr(client: TonClient, address: Address): Promise<Address | undefined> {
    const retriesAmount = 3;
    for (let i = 0; i < retriesAmount; i++) {
        try {
            const res = await client.runMethod(address, 'get_wallet_data');
            res.stack.readBigNumber(); // balance
            res.stack.readAddress(); // owner
            const masterAddr = res.stack.readAddress();
            return masterAddr;
        } catch (err) {
            console.log(`Error on wallet ${address.toString()} data fetching: ${err}`);

            if (!isAxiosError(err)) return;
            await sleep(1000);
        }
    }
}

export async function CreateJettonJettonOrder(
    tonConnectUI: TonConnectUI,
    creatorAddr: string,
    fromAddr: string,
    fromAmountStr: string,
    toAddr: string,
    toAmountStr: string
) {
    const client = await GetTonClient();
    const masterContract = client.open(new MasterOrder(MASTER_ORDER_ADDRESS));
    const userOrderAddr = await masterContract.getWalletAddress(Address.parse(creatorAddr));

    const jettonFromContract = client.open(JettonMinter.createFromAddress(Address.parse(fromAddr)));
    const jettonToContract = client.open(JettonMinter.createFromAddress(Address.parse(toAddr)));

    const userJettonFromWalletAddr = await jettonFromContract.getWalletAddress(Address.parse(creatorAddr));
    const userOrderJettonToAddr = await jettonToContract.getWalletAddress(userOrderAddr);

    const query_id = 123;
    const orderId = await GetNextOrderId(userOrderAddr);
    // TODO: calculate precision based on token metadata
    const fromAmount = toNano(fromAmountStr);
    const toAmount = toNano(toAmountStr);

    const res = await tonConnectUI.sendTransaction({
        // 10 minutes from now
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
            {
                amount: toNano(0.2).toString(),
                address: userJettonFromWalletAddr.toString(),
                payload: beginCell()
                    .storeUint(0xf8a7ea5, 32) // op code - jetton transfer
                    .storeUint(query_id, 64)
                    .storeCoins(fromAmount)
                    .storeAddress(MASTER_ORDER_ADDRESS)
                    .storeAddress(Address.parse(creatorAddr))
                    .storeBit(0)
                    .storeCoins(toNano(0.15))
                    .storeBit(1)
                    .storeRef(
                        beginCell()
                            .storeUint(0xc1c6ebf9, 32) // op code - create_order
                            .storeUint(query_id, 64)
                            .storeUint(OrderType.JETTON_JETTON, 8)
                            .storeUint(orderId, 32)
                            .storeAddress(userOrderJettonToAddr)
                            .storeCoins(toAmount)
                            .storeAddress(Address.parse(toAddr))
                            .endCell()
                    )
                    .endCell()
                    .toBoc()
                    .toString('base64'),
            },
        ],
    });

    console.log(`Result is: ${res.boc}`);
}

export async function CreateJettonTonOrder(
    tonConnectUI: TonConnectUI,
    creatorAddr: string,
    fromAddr: string,
    fromAmountStr: string,
    toAmountStr: string
) {
    const client = await GetTonClient();
    const masterContract = client.open(new MasterOrder(MASTER_ORDER_ADDRESS));
    const userOrderAddr = await masterContract.getWalletAddress(Address.parse(creatorAddr));

    const jettonFromContract = client.open(JettonMinter.createFromAddress(Address.parse(fromAddr)));
    const userJettonFromWalletAddr = await jettonFromContract.getWalletAddress(Address.parse(creatorAddr));

    const query_id = 123;
    const orderId = await GetNextOrderId(userOrderAddr);
    // TODO: calculate precision based on token metadata
    const fromAmount = toNano(fromAmountStr);
    const toAmount = toNano(toAmountStr);

    const res = await tonConnectUI.sendTransaction({
        // 10 minutes from now
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
            {
                amount: toNano(0.2).toString(),
                address: userJettonFromWalletAddr.toString(),
                payload: beginCell()
                    .storeUint(0xf8a7ea5, 32) // op code - jetton transfer
                    .storeUint(query_id, 64)
                    .storeCoins(fromAmount)
                    .storeAddress(MASTER_ORDER_ADDRESS)
                    .storeAddress(Address.parse(creatorAddr))
                    .storeBit(0)
                    .storeCoins(toNano(0.15))
                    .storeBit(1)
                    .storeRef(
                        beginCell()
                            .storeUint(0xc1c6ebf9, 32) // op code - create_order
                            .storeUint(query_id, 64)
                            .storeUint(OrderType.JETTON_TON, 8)
                            .storeUint(orderId, 32)
                            .storeCoins(toAmount)
                            .endCell()
                    )
                    .endCell()
                    .toBoc()
                    .toString('base64'),
            },
        ],
    });

    console.log(`Result is: ${res.boc}`);
}

export async function CreateTonJettonOrder(
    tonConnectUI: TonConnectUI,
    creatorAddr: string,
    fromAmountStr: string,
    toAddr: string,
    toAmountStr: string
) {
    const client = await GetTonClient();
    const masterContract = client.open(new MasterOrder(MASTER_ORDER_ADDRESS));
    const userOrderAddr = await masterContract.getWalletAddress(Address.parse(creatorAddr));

    const jettonToContract = client.open(JettonMinter.createFromAddress(Address.parse(toAddr)));
    const userOrderJettonToAddr = await jettonToContract.getWalletAddress(userOrderAddr);

    const queryId = 123;
    const orderId = await GetNextOrderId(userOrderAddr);
    // TODO: calculate precision based on token metadata
    const fromAmount = toNano(fromAmountStr);
    const toAmount = toNano(toAmountStr);

    const res = await tonConnectUI.sendTransaction({
        // 10 minutes from now
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
            {
                amount: (fromAmount + toNano(0.2)).toString(),
                address: MASTER_ORDER_ADDRESS.toString(),
                payload: beginCell()
                    .storeUint(0x76fd6f67, 32) // create_ton_order
                    .storeUint(queryId, 64)
                    .storeUint(orderId, 32)
                    .storeCoins(fromAmount)
                    .storeAddress(userOrderJettonToAddr)
                    .storeCoins(toAmount)
                    .storeAddress(Address.parse(toAddr))
                    .endCell()
                    .toBoc()
                    .toString('base64'),
            },
        ],
    });

    console.log(`Result is: ${res.boc}`);
}

export async function ExecuteOrders(
    tonConnectUI: TonConnectUI,
    userOrderAddr: Address,
    executorAddr: string,
    orders: Array<OrderRes>
) {
    const client = await GetTonClient();

    const query_id = 123;
    const messages = [];
    for (const order of orders) {
        if (order.orderType !== OrderType.JETTON_TON) {
            const jettonToContract = client.open(JettonMinter.createFromAddress(order.toMasterAddress!));
            const executorJettonWalletAddr = await jettonToContract.getWalletAddress(Address.parse(executorAddr));
            const msg = {
                amount: toNano(0.25).toString(),
                address: executorJettonWalletAddr.toString(),
                payload: beginCell()
                    .storeUint(0xf8a7ea5, 32) // op code - jetton transfer
                    .storeUint(query_id, 64)
                    .storeCoins(order.toAmount)
                    .storeAddress(userOrderAddr)
                    .storeAddress(Address.parse(executorAddr))
                    .storeBit(0)
                    .storeCoins(toNano('0.15'))
                    .storeBit(1)
                    .storeRef(
                        beginCell()
                            .storeUint(0xa0cef9d9, 32) // op code - execute_order
                            .storeUint(query_id, 64) // query id
                            .storeUint(BigInt(order.orderId), 32) // order id
                            .endCell()
                    )
                    .endCell()
                    .toBoc()
                    .toString('base64'),
            };
            messages.push(msg);
        } else {
            const msg = {
                amount: (toNano(0.2) + order.toAmount).toString(),
                address: userOrderAddr.toString(),
                payload: beginCell()
                    .storeUint(0x3b016c81, 32) // execute_order
                    .storeUint(query_id, 64)
                    .storeUint(BigInt(order.orderId), 32)
                    .storeCoins(order.toAmount)
                    .endCell()
                    .toBoc()
                    .toString('base64'),
            };
            messages.push(msg);
        }
    }

    const res = await tonConnectUI.sendTransaction({
        // 10 minutes from now
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: messages,
    });
    console.log(`Result is: ${res.boc}`);
}

export async function CloseOrder(tonConnectUI: TonConnectUI, userOrderAddr: Address, orderId: string) {
    const queryId = 123;
    const res = await tonConnectUI.sendTransaction({
        // 10 minutes from now
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
            {
                amount: toNano(0.2).toString(),
                address: userOrderAddr.toString(),
                payload: beginCell()
                    .storeUint(0xdf32c0c8, 32) // close_order
                    .storeUint(queryId, 64)
                    .storeUint(BigInt(orderId), 32)
                    .endCell()
                    .toBoc()
                    .toString('base64'),
            },
        ],
    });

    console.log(`Result is: ${res.boc}`);
}
