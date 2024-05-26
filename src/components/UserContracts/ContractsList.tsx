import { useEffect, useState } from 'react';
import { CollectUserContractAddresses } from '../../api/Indexer';
import { Address } from '@ton/core';
import { ContractItem } from './ContractItem';

export const ContractsList = () => {
    const [contracts, setContracts] = useState<Address[]>([]);

    useEffect(() => {
        async function fetchUserContracts() {
            setContracts(await CollectUserContractAddresses(10));
        }
        fetchUserContracts();
    }, []);

    return (
        <div className="contractsList">
            <h1>All contracts with orders:</h1>
            {contracts.map((c, i) => (
                <ContractItem key={i} address={c} />
            ))}
        </div>
    );
};
