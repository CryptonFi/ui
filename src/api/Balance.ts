import { Address, JettonMaster } from '@ton/ton';
import { CURRENCY_ADDRESSES } from './Config';
import { GetTonClient } from './Client';
import { Wallet } from '@tonconnect/ui-react';

export async function GetTokenBalance(wallet: Wallet, userAddress: string, asset: string): Promise<string | null> {
    let currency;
    let balance = 0n;

    if (asset in CURRENCY_ADDRESSES) currency = CURRENCY_ADDRESSES[asset];
    else return null;

    try {
        const tonClient = await GetTonClient();

        if (asset === 'TON') {
            balance = await tonClient.getBalance(Address.parse(wallet.account.address));
        } else {
            const jettonMaster = tonClient.open(JettonMaster.create(Address.parse(currency.address)));
            const jettonAddress = await jettonMaster.getWalletAddress(Address.parse(userAddress));
            const res = await tonClient.runMethod(jettonAddress, 'get_wallet_data');
            balance = res.stack.readBigNumber();
        }
    } catch (err: any) {
        console.error(`Failed to get user balance for '${asset}'. Error: ${err}`);
        if (err.message === 'Unable to execute get method. Got exit_code: -13') {
            return '0';
        }
        return null;
    }
    return (Number(balance) / currency.decimals).toFixed(4);
}
