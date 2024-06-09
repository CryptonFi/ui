import { useState, useEffect } from 'react';
import axios from 'axios';

const TOKEN_TO_LP: { [key: string]: string } = {
    NOT: 'EQARK5MKz_MK51U5AZjK3hxhLg1SmQG2Z-4Pb7Zapi_xwmrN',
    GRAM: 'EQASBZLwa2vfdsgoDF2w96pdccBJJRxDNXXPUL7NMm0WdnMx',
    STON: 'EQDtZHOtVWaf9UIU6rmjLPNLTGxNLNogvK5xUZlMRgZwQ4Gt',
    FISH: 'EQCVflRjTn91FKGZzy2UTHgLn3hG3TsOlQIsAOPcB57K5gT5',
    HIF: 'EQCgsOdELK_Yl2Y_OCuzX4tIX0rILe-5T2rTeu5t0sWdTx1r',
};

const useTokenPrice = (tokenSymbol: string) => {
    const [price, setPrice] = useState<number | null>(null);
    const [baseTokenSymbol, setBaseTokenSymbol] = useState<number | null>(null);
    const [quoteTokenSymbol, setQuoteTokenSymbol] = useState<number | null>(null);

    const fetchJettonPrice = async () => {
        try {
            const lpAddress = TOKEN_TO_LP[tokenSymbol];
            const response = await axios.get(`https://api.dexscreener.com/latest/dex/pairs/ton/${lpAddress}`);
            setPrice(response.data.pair.priceUsd);
            setBaseTokenSymbol(response.data.pair.baseToken.symbol);
            setQuoteTokenSymbol(response.data.pair.quoteToken.symbol);
        } catch (error) {
            console.error(`Failed to fetch price: ${error}`);
        }
    };

    const fetchTonPrice = async () => {
        try {
            const response = await axios.get(`https://api.coinpaprika.com/v1/tickers/toncoin-the-open-network`);
            setPrice(response.data.quotes.USD.price);
        } catch (error) {
            console.error(`Failed to fetch price: ${error}`);
        }
    };

    useEffect(() => {
        if (tokenSymbol === 'USD₮') {
            setPrice(1);
        } else if (tokenSymbol === 'TON') {
            fetchTonPrice();
        } else {
            fetchJettonPrice();
        }
    }, [tokenSymbol]);

    return { price, baseTokenSymbol, quoteTokenSymbol };
};

export default useTokenPrice;
