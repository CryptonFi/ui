import { TonClient } from '@ton/ton';
import { Address, beginCell, toNano } from '@ton/core';
import { isAxiosError } from 'axios';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { ADDRESS_CURRENCIES, MASTER_ORDER_ADDRESS } from './Config';
import { MasterOrder } from './Wrappers/MasterOrder';
import { OrderData, UserOrder } from './Wrappers/UserOrder';
import { sleep } from './Helpers';
import { JettonMinter } from './Wrappers/JettonMinter';
import { TonConnectUI } from '@tonconnect/ui-react';

export type OrderRes = OrderData & { orderId: string };

export async function getTonClient() {
    // TODO: create client only once
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    return new TonClient({ endpoint });
}

export async function FetchOrderDetails(userAddress: string): Promise<Array<OrderRes>> {
    // TODO: create client only once
    const client = await getTonClient();

    const masterContract = client.open(new MasterOrder(MASTER_ORDER_ADDRESS));
    const userOrderAddress = await masterContract.getWalletAddress(Address.parse(userAddress));

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

export async function PositionToString(address: Address | null, isMaster: boolean, amount: bigint) {
    if (!address) {
        return `${Number((amount * 100n) / 1_000_000_000n) / 100} TON`;
    }

    // TODO: create client only once
    const client = await getTonClient();

    const masterAddr = isMaster ? address : await loadMasterAddr(client, address);

    // TODO: Load currency simbol and decimals from contract
    const currency = masterAddr ? ADDRESS_CURRENCIES[masterAddr.toString()] || masterAddr.toString() : '<unknown>';
    const decimals = 1_000_000_000n;
    const amountN = Number((amount * 100n) / decimals) / 100;

    return `${amountN} ${currency}`;
}

export async function loadMasterAddr(client: TonClient, address: Address): Promise<Address | undefined> {
    const retriesAmount = 3;
    for (let i = 0; i < retriesAmount; i++) {
        try {
            const res = await client.runMethod(address, 'get_wallet_data');
            res.stack.readBigNumber(); // balance
            res.stack.readAddress(); // owner
            const masterAddr = res.stack.readAddress();
            return masterAddr;
        } catch (err) {
            console.log(`Error on wallet data fetching: ${err}`);

            if (!isAxiosError(err)) return;
            await sleep(1000);
        }
    }
}

export async function createNewOrder(
    tonConnectUI: TonConnectUI,
    creatorAddr: string,
    fromAddr: string,
    fromAmount: bigint,
    toAddr: string,
    toAmount: bigint
) {
    const client = await getTonClient();

    const masterContract = client.open(new MasterOrder(MASTER_ORDER_ADDRESS));
    const jettonFromContract = client.open(JettonMinter.createFromAddress(Address.parse(fromAddr)));
    const jettonToContract = client.open(JettonMinter.createFromAddress(Address.parse(toAddr)));

    const userJettonFromWalletAddr = await jettonFromContract.getWalletAddress(Address.parse(creatorAddr));
    const userOrderAddr = await masterContract.getWalletAddress(Address.parse(creatorAddr));
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
                            .storeUint(0, 8)
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
