import { Address } from '@ton/core';

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRequest(address: Address, before_lt: number, limit: number) {
    limit = Math.min(limit, 1000);
    if (before_lt === 0) return `v2/blockchain/accounts/${address.toRawString()}/transactions?limit=100`;
    else return `v2/blockchain/accounts/${address.toRawString()}/transactions?before_lt=${before_lt}&limit=100`;
}
