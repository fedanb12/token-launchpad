import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';
import { getTokens } from '../services/tokenService';


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

export default function Explore() {
    const navigate = useNavigate();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadTokens();
    }, []);

    const loadTokens = async () => {
        try {
            const allTokens = await getTokens();
            setTokens(allTokens);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };
    const filtered = tokens.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "IBM Plex Mono, monospace" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        input:focus { outline: none; border-color: #00FF88 !important; }
      `}</style>

            <Navbar />

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>

                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.2em", marginBottom: 8 }}>// EXPLORE</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                        <h1 style={{ fontSize: 28, fontWeight: "bold" }}>All Tokens</h1>
                        <input
                            placeholder="Search by name or ticker..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "IBM Plex Mono", fontSize: 12, padding: "10px 16px", width: 280, transition: "border-color 0.2s" }}
                        />
                    </div>
                </div>

                {/* Token Grid */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: COLORS.muted, fontSize: 12 }}>
                        Loading tokens...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16 }}>No tokens found</div>
                        <button onClick={() => navigate('/launch')} style={{ background: COLORS.accent, color: "#000", border: "none", padding: "12px 24px", fontFamily: "IBM Plex Mono", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>
                            LAUNCH THE FIRST ONE
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                        {filtered.map((token, i) => (
                            <div
                                key={i}
                                onClick={() => navigate(`/token/${token.tokenAddress}`)}
                                style={{
                                    background: COLORS.surface,
                                    border: `1px solid ${COLORS.border}`,
                                    padding: 20,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                                    {token.imageUrl ? (
                                        <img src={token.imageUrl} alt={token.name} style={{ width: 48, height: 48, objectFit: "cover", border: `1px solid ${COLORS.border}` }} />
                                    ) : (
                                        <div style={{ width: 48, height: 48, background: COLORS.bg, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: COLORS.accent }}>◈</div>
                                    )}
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: "bold", color: COLORS.text }}>{token.name}</div>
                                        <span style={{ fontSize: 10, border: `1px solid ${COLORS.accent}`, color: COLORS.accent, padding: "2px 6px" }}>${token.symbol}</span>
                                    </div>
                                </div>

                                {token.description && (
                                    <p style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.7, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {token.description}
                                    </p>
                                )}

                                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                                    <div style={{ fontSize: 10, color: COLORS.muted }}>
                                        by {token.creator.slice(0, 6)}...{token.creator.slice(-4)}
                                    </div>
                                    <div style={{ fontSize: 10, color: COLORS.accent }}>
                                        TRADE →
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}