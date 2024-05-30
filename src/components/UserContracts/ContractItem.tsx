import { Link } from 'react-router-dom';

interface ContractItemProps {
    address: string;
}

export const ContractItem = ({ address }: ContractItemProps) => {
    return (
        <div className="contractItem">
            <Link
                className="m-1 underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                to={`contract/${address}`}
            >
                {address}
            </Link>
        </div>
    );
};
