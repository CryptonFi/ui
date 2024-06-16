import { TonClient } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';

let _tonClient: TonClient;

export async function GetTonClient() {
    if (_tonClient === undefined) {
        const endpoint = await getHttpEndpoint({ network: 'testnet' });
        _tonClient = new TonClient({ endpoint });
    }
    return _tonClient;
}
