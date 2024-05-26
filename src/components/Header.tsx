import { FC } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';

interface HeaderProps {}

const Header: FC<HeaderProps> = ({}) => {
    return (
        <header className="header flex justify-end m-3">
            <TonConnectButton />
        </header>
    );
};

export default Header;
