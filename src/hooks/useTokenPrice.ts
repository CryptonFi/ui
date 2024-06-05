import { useState, useEffect } from 'react';
import axios from 'axios';

const useTokenPrice = (lpAddress: string) => {
    const [price, setPrice] = useState<number | null>(null);
    const [baseTokenSymbol, setBaseTokenSymbol] = useState<number | null>(null);
    const [quoteTokenSymbol, setQuoteTokenSymbol] = useState<number | null>(null);

    const fetchPrice = async () => {
        try {
            const response = await axios.get(`https://api.dexscreener.com/latest/dex/pairs/ton/${lpAddress}`);
            console.log(response.data);
            setPrice(response.data.pair.priceUsd);
            setBaseTokenSymbol(response.data.pair.baseToken.symbol);
            setQuoteTokenSymbol(response.data.pair.quoteToken.symbol);
        } catch (error) {
            console.error(`Failed to fetch price: ${error}`);
        }
    };

    useEffect(() => {
        fetchPrice();
    }, [lpAddress]);

    return {price, baseTokenSymbol, quoteTokenSymbol};
};

export default useTokenPrice;