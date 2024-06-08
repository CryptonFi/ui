import { TonClient } from '@ton/ton';
import { Address, beginCell, toNano } from '@ton/core';
import { isAxiosError } from 'axios';
import { TonConnectUI } from '@tonconnect/ui-react';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { ADDRESS_CURRENCIES, MASTER_ORDER_ADDRESS } from './Config';
import { sleep } from './Helpers';
import { MasterOrder } from './Wrappers/MasterOrder';
import { OrderData, OrderType, UserOrder } from './Wrappers/UserOrder';
import { JettonMinter } from './Wrappers/JettonMinter';

export type OrderRes = OrderData & { orderId: string };
export type PositionFriendly = {
    currency: string;
    amount: number;
    imgUrl: string;
};

let _tonClient: TonClient;

async function GetTonClient() {
    if (_tonClient === undefined) {
        const endpoint = await getHttpEndpoint({ network: 'testnet' });
        _tonClient = new TonClient({ endpoint });
    }
    return _tonClient;
}

export async function GetUserOrderAddress(userAddress: string): Promise<Address> {
    const client = await GetTonClient();
    const masterContract = client.open(new MasterOrder(MASTER_ORDER_ADDRESS));

    return await masterContract.getWalletAddress(Address.parse(userAddress));
}

export async function FetchOrderDetails(userOrderAddress: Address): Promise<Array<OrderRes>> {
    const client = await GetTonClient();
    const UserOrderContract = client.open(new UserOrder(userOrderAddress));
    const ordersDict = await UserOrderContract.getOrders();

    const ordersList: Array<OrderRes> = [];
    for (const id of ordersDict.keys()) {
        const ord = ordersDict.get(id);
        ordersList.push({
            orderId: id.toString(),
            orderType: ord?.orderType!,
            fromAddress: ord?.fromAddress!,
            fromAmount: ord?.fromAmount!,
            toAddress: ord?.toAddress!,
            toAmount: ord?.toAmount!,
            toMasterAddress: ord?.toMasterAddress!,
        });
    }
    return ordersList;
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

    // TODO: Load currency simbol and decimals from contract
    const currency = masterAddr ? ADDRESS_CURRENCIES[masterAddr.toString()] || masterAddr.toString() : '<unknown>';
    const decimals = 1_000_000_000n;
    const amountN = Number((amount * 100n) / decimals) / 100;

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
    fromAmount: bigint,
    toAddr: string,
    toAmount: bigint
) {
    const client = await GetTonClient();
    const masterContract = client.open(new MasterOrder(MASTER_ORDER_ADDRESS));
    const userOrderAddr = await masterContract.getWalletAddress(Address.parse(creatorAddr));

    const jettonFromContract = client.open(JettonMinter.createFromAddress(Address.parse(fromAddr)));
    const jettonToContract = client.open(JettonMinter.createFromAddress(Address.parse(toAddr)));

    const userJettonFromWalletAddr = await jettonFromContract.getWalletAddress(Address.parse(creatorAddr));
    const userOrderJettonToAddr = await jettonToContract.getWalletAddress(userOrderAddr);

    const query_id = 123;

    const res = await tonConnectUI.sendTransaction({
        // 10 minutes from now
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
            {
                amount: toNano(0.3).toString(),
                address: userJettonFromWalletAddr.toString(),
                payload: beginCell()
                    .storeUint(0xf8a7ea5, 32) // op code - jetton transfer
                    .storeUint(query_id, 64)
                    // TODO: replace toNano!
                    .storeCoins(toNano(fromAmount))
                    .storeAddress(MASTER_ORDER_ADDRESS)
                    .storeAddress(Address.parse(creatorAddr))
                    .storeBit(0)
                    .storeCoins(toNano('0.2'))
                    .storeBit(1)
                    .storeRef(
                        beginCell()
                            .storeUint(0xc1c6ebf9, 32) // op code - create_order
                            .storeUint(query_id, 64)
                            .storeUint(OrderType.JETTON_JETTON, 8)
                            .storeAddress(userOrderJettonToAddr)
                            .storeCoins(toNano(toAmount))
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
    fromAmount: bigint,
    toAmount: bigint
) {
    const client = await GetTonClient();
    const jettonFromContract = client.open(JettonMinter.createFromAddress(Address.parse(fromAddr)));
    const userJettonFromWalletAddr = await jettonFromContract.getWalletAddress(Address.parse(creatorAddr));

    const query_id = 123;
    const res = await tonConnectUI.sendTransaction({
        // 10 minutes from now
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
            {
                amount: toNano(0.3).toString(),
                address: userJettonFromWalletAddr.toString(),
                payload: beginCell()
                    .storeUint(0xf8a7ea5, 32) // op code - jetton transfer
                    .storeUint(query_id, 64)
                    // TODO: replace toNano!
                    .storeCoins(toNano(fromAmount))
                    .storeAddress(MASTER_ORDER_ADDRESS)
                    .storeAddress(Address.parse(creatorAddr))
                    .storeBit(0)
                    .storeCoins(toNano('0.2'))
                    .storeBit(1)
                    .storeRef(
                        beginCell()
                            .storeUint(0xc1c6ebf9, 32) // op code - create_order
                            .storeUint(query_id, 64)
                            .storeUint(OrderType.JETTON_TON, 8)
                            .storeCoins(toNano(toAmount))
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
    fromAmount: bigint,
    toAddr: string,
    toAmount: bigint
) {
    const client = await GetTonClient();
    const masterContract = client.open(new MasterOrder(MASTER_ORDER_ADDRESS));
    const userOrderAddr = await masterContract.getWalletAddress(Address.parse(creatorAddr));

    const jettonToContract = client.open(JettonMinter.createFromAddress(Address.parse(toAddr)));
    const userOrderJettonToAddr = await jettonToContract.getWalletAddress(userOrderAddr);

    const queryId = 123;
    const res = await tonConnectUI.sendTransaction({
        // 10 minutes from now
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
            {
                amount: (toNano(fromAmount) + toNano(0.4)).toString(),
                address: MASTER_ORDER_ADDRESS.toString(),
                payload: beginCell()
                    .storeUint(0x76fd6f67, 32) // create_ton_order
                    .storeUint(queryId, 64)
                    .storeCoins(toNano(fromAmount))
                    .storeAddress(userOrderJettonToAddr)
                    .storeCoins(toNano(toAmount))
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
                amount: toNano(0.3).toString(),
                address: executorJettonWalletAddr.toString(),
                payload: beginCell()
                    .storeUint(0xf8a7ea5, 32) // op code - jetton transfer
                    .storeUint(query_id, 64)
                    // TODO: replace toNano!
                    .storeCoins(order.toAmount)
                    .storeAddress(userOrderAddr)
                    .storeAddress(Address.parse(executorAddr))
                    .storeBit(0)
                    .storeCoins(toNano('0.2'))
                    .storeBit(1)
                    .storeRef(
                        beginCell()
                            .storeUint(0xa0cef9d9, 32) // op code - execute_order
                            .storeUint(query_id, 64) // query id
                            .storeUint(BigInt(order.orderId), 256) // order id
                            .endCell()
                    )
                    .endCell()
                    .toBoc()
                    .toString('base64'),
            };
            messages.push(msg);
        } else {
            const msg = {
                amount: toNano(0.3).toString(),
                address: userOrderAddr.toString(),
                payload: beginCell()
                    .storeUint(0x3b016c81, 32) // execute_order
                    .storeUint(query_id, 64)
                    .storeUint(BigInt(order.orderId), 256)
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
                    .storeUint(BigInt(orderId), 256)
                    .endCell()
                    .toBoc()
                    .toString('base64'),
            },
        ],
    });

    console.log(`Result is: ${res.boc}`);
}
