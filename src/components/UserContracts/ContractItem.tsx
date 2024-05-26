import { Address } from '@ton/core';
import { Link } from 'react-router-dom';

interface ContractItemProps {
    address: Address;
}

export const ContractItem = ({ address }: ContractItemProps) => {
    return (
        <div className="contractItem">
            <Link className="contractLink" to={`contract/${address.toString()}`}>
                {address.toString()}
            </Link>
        </div>
    );
};
