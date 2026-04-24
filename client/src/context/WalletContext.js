import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    // Auto-connect if MetaMask already has permission
    useEffect(() => {
        const autoConnect = async () => {
            if (!window.ethereum) return;
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    const _provider = new ethers.BrowserProvider(window.ethereum);
                    const _signer = await _provider.getSigner();
                    const _account = await _signer.getAddress();
                    setProvider(_provider);
                    setSigner(_signer);
                    setAccount(_account);
                }
            } catch (e) {
                console.error(e);
            }
        };
        autoConnect();

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    setAccount(null);
                    setProvider(null);
                    setSigner(null);
                } else {
                    autoConnect();
                }
            });
        }
    }, []);

    const connectWallet = async () => {
        if (!window.ethereum) return alert("Install MetaMask first");
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const _signer = await _provider.getSigner();
        const _account = await _signer.getAddress();
        setProvider(_provider);
        setSigner(_signer);
        setAccount(_account);
        return { provider: _provider, signer: _signer, account: _account };
    };

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
    };

    return (
        <WalletContext.Provider value={{ account, provider, signer, connectWallet, disconnectWallet }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}