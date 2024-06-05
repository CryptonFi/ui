interface ContractItemProps {
    address: string;
}

export const ContractItem = ({ address }: ContractItemProps) => {
    return (
        <div className="contractItem">
            <a
                className="m-1 underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                href={`/ui?address=${address}`}
            >
                {address}
            </a>
        </div>
    );
};
