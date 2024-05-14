import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import './App.scss';

function App() {
    return (
        <TonConnectUIProvider manifestUrl="<app url>/tonconnect-manifest.json" uiPreferences={{ theme: THEME.LIGHT }}>
            <div className="app">
                <Header />
                <div>
                    <h1>Main app</h1>
                </div>
                <Footer />
            </div>
        </TonConnectUIProvider>
    );
}

export default App;
