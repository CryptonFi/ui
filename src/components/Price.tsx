import useTokenPrice from '../hooks/useTokenPrice.ts';


interface PriceComponentProps {
    lpAddress: string;
}

export const PriceComponent: React.FC<PriceComponentProps> = ({ lpAddress }) => {
    const priceData = useTokenPrice(lpAddress);

    return (
        <div>
            {priceData ? `The price of ${priceData.baseTokenSymbol}/${priceData.quoteTokenSymbol} is ${priceData.price}($)` : 'Loading...'}
        </div>
    );
};