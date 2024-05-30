import { useEffect, useState } from 'react';
import { CollectUserContractAddresses } from '../../api/Indexer';
import { ContractItem } from './ContractItem';

export const ContractsList = () => {
    const [contracts, setContracts] = useState<string[]>([]);

    useEffect(() => {
        async function fetchUserContracts() {
            setContracts(await CollectUserContractAddresses(10));
        }
        fetchUserContracts();
    }, []);

    return (
        <div className="contractsList">
            <h1 className="text-3xl m-7">All contracts with orders:</h1>
            {contracts.map((c, i) => (
                <ContractItem key={i} address={c} />
            ))}
        </div>
    );
};
