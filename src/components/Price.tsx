import useTokenPrice from '../hooks/useTokenPrice.ts';
import useTonTokenPrice from '../hooks/useTonTokenPrice.ts';


interface PriceComponentProps {
    tokenSymbol: string;
    amount: number;
}

const TOKEN_TO_LP: { [key: string]: string } = {
    'NOT': 'EQARK5MKz_MK51U5AZjK3hxhLg1SmQG2Z-4Pb7Zapi_xwmrN',
    'GRAM': 'EQASBZLwa2vfdsgoDF2w96pdccBJJRxDNXXPUL7NMm0WdnMx',
    'STON': 'EQDtZHOtVWaf9UIU6rmjLPNLTGxNLNogvK5xUZlMRgZwQ4Gt',
    'FISH': 'EQCVflRjTn91FKGZzy2UTHgLn3hG3TsOlQIsAOPcB57K5gT5',
    'HIF': 'EQCgsOdELK_Yl2Y_OCuzX4tIX0rILe-5T2rTeu5t0sWdTx1r'
};

export const PriceComponent: React.FC<PriceComponentProps> = ({ tokenSymbol, amount }) => {
    let positionUsd = 0;
    if (tokenSymbol === 'TON') {
        positionUsd = useTonTokenPrice() || 0;
    } else if (tokenSymbol === 'USD₮') {
        positionUsd = 1;
    } else {
        const lpAddress = TOKEN_TO_LP[tokenSymbol];
        const priceData = useTokenPrice(lpAddress);
        if (!priceData || !priceData.price) return 'No data';
        positionUsd = priceData.price * amount;
        return (
            <div>
                {priceData ? `${positionUsd.toFixed(4)} $` : 'Loading...'}
            </div>
        );
    }
    return (
        <div>
            {`${positionUsd.toFixed(4)} $`}
        </div>
    );
};