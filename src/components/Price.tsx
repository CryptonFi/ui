import useTokenPrice from '../hooks/useTokenPrice.ts';

interface PriceComponentProps {
    tokenSymbol: string;
    amount: number;
}

export const PriceComponent: React.FC<PriceComponentProps> = ({ tokenSymbol, amount }) => {
    const tokenPrice = useTokenPrice(tokenSymbol);
    const price = tokenPrice && tokenPrice.price ? tokenPrice.price : 0;
    return <div>{`${(price * amount).toFixed(4)} $`}</div>;
};
