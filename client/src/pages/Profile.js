import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Navbar from '../components/NavBar';
import { useWallet } from '../context/WalletContext';
import TokenFactoryABI from '../contracts/TokenFactory.json';

const FACTORY_ADDRESS = "0x502cB0406961E5E7Adb7C4cB5fb7aD4dDF6cF259";

const COLORS = {
    bg: "#050A0E",
    surface: "#0A1520",
    border: "#0F2535",
    accent: "#00FF88",
    red: "#FF3A5C",
    yellow: "#FFD700",
    text: "#E0F0FF",
    muted: "#4A7090",
};

export default function Profile() {
    const { address } = useParams();
    const navigate = useNavigate();
    const { account } = useWallet();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);

    const isOwner = account?.toLowerCase() === address?.toLowerCase();

    useEffect(() => {
        loadProfile();
    }, [address]);

    const loadProfile = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const factory = new ethers.Contract(FACTORY_ADDRESS, TokenFactoryABI.abi, provider);
            const allTokens = await factory.getTokens();
            const myTokens = allTokens.filter(t => t.creator.toLowerCase() === address.toLowerCase());
            setTokens(myTokens);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "IBM Plex Mono, monospace" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

            <Navbar />

            <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>

                {/* Profile Header */}
                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 32, marginBottom: 32, display: "flex", alignItems: "center", gap: 24 }}>
                    <div style={{ width: 72, height: 72, background: COLORS.bg, border: `1px solid ${COLORS.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: COLORS.accent }}>
                        ◈
                    </div>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: "bold", color: COLORS.text, marginBottom: 8 }}>
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                            <span style={{ fontSize: 10, border: `1px solid ${COLORS.border}`, color: COLORS.muted, padding: "2px 8px" }}>
                                {tokens.length} TOKENS CREATED
                            </span>
                            {isOwner && (
                                <span style={{ fontSize: 10, border: `1px solid ${COLORS.accent}`, color: COLORS.accent, padding: "2px 8px" }}>
                                    YOU
                                </span>
                            )}
                        </div>
                    </div>
                    {isOwner && (
                        <button
                            onClick={() => navigate('/launch')}
                            style={{ marginLeft: "auto", background: COLORS.accent, color: "#000", border: "none", padding: "12px 24px", fontFamily: "IBM Plex Mono", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}
                        >
                            + LAUNCH TOKEN
                        </button>
                    )}
                </div>

                {/* Tokens Created */}
                <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.2em", marginBottom: 20 }}>// TOKENS CREATED</div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.muted, fontSize: 12 }}>Loading...</div>
                ) : tokens.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16 }}>No tokens created yet</div>
                        {isOwner && (
                            <button onClick={() => navigate('/launch')} style={{ background: COLORS.accent, color: "#000", border: "none", padding: "12px 24px", fontFamily: "IBM Plex Mono", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>
                                LAUNCH YOUR FIRST TOKEN
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {tokens.map((token, i) => (
                            <div
                                key={i}
                                onClick={() => navigate(`/token/${token.tokenAddress}`)}
                                style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 16, transition: "all 0.2s", animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; }}
                            >
                                {token.imageUrl ? (
                                    <img src={token.imageUrl} alt={token.name} style={{ width: 48, height: 48, objectFit: "cover", border: `1px solid ${COLORS.border}` }} />
                                ) : (
                                    <div style={{ width: 48, height: 48, background: COLORS.bg, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: COLORS.accent }}>◈</div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: "bold", color: COLORS.text, marginBottom: 4 }}>{token.name}</div>
                                    <span style={{ fontSize: 10, border: `1px solid ${COLORS.accent}`, color: COLORS.accent, padding: "2px 6px" }}>${token.symbol}</span>
                                </div>
                                <div style={{ fontSize: 10, color: COLORS.accent }}>VIEW →</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 