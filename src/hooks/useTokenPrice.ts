import { useState, useEffect } from 'react';
import axios from 'axios';
import { CURRENCY_ADDRESSES } from '../api/Config';

const useTokenPrice = (tokenSymbol: string) => {
    const [price, setPrice] = useState<number | null>(null);
    const [baseTokenSymbol, setBaseTokenSymbol] = useState<number | null>(null);
    const [quoteTokenSymbol, setQuoteTokenSymbol] = useState<number | null>(null);

    const fetchJettonPrice = async () => {
        try {
            const lpAddress = CURRENCY_ADDRESSES[tokenSymbol].lp;
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
