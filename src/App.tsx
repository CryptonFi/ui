import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { Outlet } from 'react-router';

function App() {
    return (
        <TonConnectUIProvider
            manifestUrl="https://cryptonfi.github.io/ui/tonconnect-manifest.json"
            uiPreferences={{ theme: THEME.LIGHT }}
        >
            <div className="app">
                <Header />
                <div className="main">
                    <div className="xl:w-1/2 lg:w-3/4 md:w-10/12 sm:w-11/12">
                        <Outlet />
                    </div>
                </div>
                <Footer />
            </div>
        </TonConnectUIProvider>
    );
}

export default App;
