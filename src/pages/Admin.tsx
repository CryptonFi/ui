import { FC } from 'react';
import { ContractsList } from '../components/UserContracts/ContractsList';

interface AdminPageProps {}

const AdminPage: FC<AdminPageProps> = ({}) => {
    return <ContractsList />;
};

export default AdminPage;
