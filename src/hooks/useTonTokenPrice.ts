import { useState, useEffect } from 'react';
import axios from 'axios';

const useTonTokenPrice = () => {
    const [price, setPrice] = useState<number | null>(null);

    const fetchPrice = async () => {
        try {
            const response = await axios.get(`https://api.coinpaprika.com/v1/tickers/toncoin-the-open-network`);
            console.log(response.data);
            setPrice(response.data.quotes.USD.price);
        } catch (error) {
            console.error(`Failed to fetch price: ${error}`);
        }
    };

    useEffect(() => {
        fetchPrice();
    }, []);

    return price;
};

export default useTonTokenPrice;