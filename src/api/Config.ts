import { Address } from '@ton/core';

// Testnet
export const MASTER_ORDER_ADDRESS = Address.parse('EQAV5ikoa7DzsgdE4WLaUQLYYm5egLnHwHpKQ5cHsWqLvzm7');
export const TON_API_ENDPOINT = 'https://testnet.tonapi.io/';
export const TON_CLIENT_URL = 'https://testnet.toncenter.com/api/v2/jsonRPC';

export const OP_CREATE_TON_ORDER = 0x76fd6f67;
export const OP_CREATE_JETTON_ORDER = 0xc1c6ebf9;
export const OP_CLOSE_ORDER = 0xdf32c0c8;
export const OP_EXECUTE_JETTON_ORDER = 0xa0cef9d9;
export const OP_EXECUTE_TON_ORDER = 0x3b016c81;

export const CURRENCY_ADDRESSES: Record<string, string> = {
    TON: '0',
    BATON: 'EQDLTkIMPWon-XoLCpMqWXsnn8a1Zgeav6xkqB-TOtHgWd8B',
    BTC: 'EQAj_XKstRJvDdHjUSVN79bPZtCbYrnalEkafPQXmkCpoEq_',
    LVT: 'EQBCSiok2KOPeq5T0xcoJ48YZYq9WRDbGFNzTeVjWOKvL9kX',

    GRAM: 'EQAX3hBEmXpPN0SMIzb5_ZYG6dLouXt9jOH_w4hmSiGC4Bn9',
    NOT: 'EQClFdpClmrgRbh4JWR3DzTt8XL_U5FXDQkBcAKeQr6DT4dw',
    STON: 'EQBo-cbzSU0zpkQHee1FGzoHM8peY08p4HrtsuOq336fsLLb',
    'USD₮': 'EQBHuIjzT5hr7nkvzTyIijlDDUnlnNYrqAWDWzQ0HxTQARCb',
    FISH: 'EQCTB-lZAJFbe1m6yfcaCIYK8pig5iC0_Pm0w3m_E6Dt3wHU',
    HIF: 'EQA9Wh1dkjQIFkBZi8CyrPt72omu60X5R9Li3gDhKQlkUOiO',
};

export const ADDRESS_CURRENCIES = Object.assign(
    {},
    ...Object.entries(CURRENCY_ADDRESSES).map(([a, b]) => ({ [b]: a }))
);

export enum OrderType {
    JETTON_JETTON = 0,
    JETTON_TON = 1,
    TON_JETTON = 2,
}
