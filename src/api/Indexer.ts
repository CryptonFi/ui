import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getRequest, sleep } from './Helpers';
import { MASTER_ORDER_ADDRESS, TON_API_ENDPOINT } from './Config';
import { Address } from '@ton/core';

const MAX_RETRIES = 3;

export async function CollectUserContractAddresses(limit: number): Promise<Array<string>> {
    // TODO: create tonApi only once
    const tonApi = axios.create({ baseURL: TON_API_ENDPOINT });
    return ParseTransactions(tonApi, limit);
}

async function ParseTransactions(tonApi: AxiosInstance, limit: number): Promise<Array<string>> {
    let before_lt = 0;
    let attempts = 0;
    let addresses = new Set<string>([]);

    while (true) {
        let result: AxiosResponse<any, any>;
        try {
            if (addresses.size > limit) break;
            result = await tonApi.get(getRequest(MASTER_ORDER_ADDRESS, before_lt, limit));
            attempts = 0;
        } catch (e) {
            console.error(`[CollectUserContractAddresses] Error on contract addresses loading: ${e}`);
            attempts++;
            if (attempts > MAX_RETRIES) {
                break;
            }
            await sleep(1000);
            continue;
        }
        const transactions = result.data.transactions;
        if (transactions.length === 0) break;

        for (const transaction of transactions) {
            if (addresses.size > limit) break;

            before_lt = transaction.lt;
            if (!(transaction.compute_phase.success === true)) continue;
            if (!transaction.out_msgs.length) continue;

            for (const msg of transaction.out_msgs) {
                if (msg.op_code === undefined) {
                    addresses.add(Address.parseRaw(msg.destination.address).toString());
                }
            }
        }
    }
    return Array.from(addresses);
}
