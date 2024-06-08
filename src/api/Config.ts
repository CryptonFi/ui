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

    GRAM: 'EQAN3PScHwP77_gko2l1ZF02IV4F1uTk15OExbUi9Idj8M2n',
    NOT: 'EQA4vUDA7rEidZI6voKuErOYpWWR5jGj2_WCBIwyqiiNMTdP',
    STON: 'EQAjm8Db5pHlW27jvlBOaDHe5smtaxmpMgm0zjSZ_6QsnWuY',
    'USD₮': 'EQCL1FH085zADKW9xXAmXGmqhOxxCcvQo6SnbhY75DIwmrTl',
    FISH: 'EQBmixzri81nz9RSK8IsZ0JmoLI3BkRNhXytgOMo1A2ZGyGf',
    HIF: 'EQDTXaFOMjW16eThuZpNhajCfloI9oAjtkf6SEns-YLCX_bL',
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
