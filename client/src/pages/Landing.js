import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';
import { useWallet } from '../context/WalletContext';

const COLORS = {
    bg: "#050A0E",
    surface: "#0A1520",
    border: "#0F2535",
    accent: "#00FF88",
    accentDim: "#00CC6A",
    red: "#FF3A5C",
    yellow: "#FFD700",
    text: "#E0F0FF",
    muted: "#4A7090",
};

export default function Landing() {
    const navigate = useNavigate();
    const { account, connectWallet } = useWallet();

    const handleLaunch = async () => {
        if (!account) await connectWallet();
        navigate('/launch');
    };

    return (
        <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "IBM Plex Mono, monospace" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes glow { 0%,100%{text-shadow:0 0 10px #00FF8833} 50%{text-shadow:0 0 30px #00FF8899} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

            <Navbar />

            {/* Hero */}
            <div style={{ textAlign: "center", padding: "100px 24px 60px", position: "relative", overflow: "hidden" }}>

                {/* Background grid */}
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `linear-gradient(${COLORS.border} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border} 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                    opacity: 0.3,
                    pointerEvents: "none",
                }} />

                {/* Glowing orb */}
                <div style={{
                    position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
                    width: 400, height: 400,
                    background: "radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                {/* Badge */}
                <div style={{ display: "inline-block", border: `1px solid ${COLORS.accent}`, color: COLORS.accent, padding: "4px 16px", fontSize: 10, letterSpacing: "0.2em", marginBottom: 32, animation: "pulse 3s infinite" }}>
                    ● LIVE ON SEPOLIA TESTNET
                </div>

                {/* Title */}
                <h1 style={{
                    fontFamily: "Space Mono",
                    fontSize: "clamp(40px, 8vw, 80px)",
                    fontWeight: "bold",
                    lineHeight: 1.1,
                    marginBottom: 24,
                    animation: "fadeUp 0.8s ease",
                }}>
                    <span style={{ color: COLORS.accent, animation: "glow 3s infinite" }}>LAUNCH</span>
                    <br />
                    <span style={{ color: COLORS.text }}>ANYTHING.</span>
                </h1>

                <p style={{ fontSize: 14, color: COLORS.muted, maxWidth: 500, margin: "0 auto 48px", lineHeight: 1.8, animation: "fadeUp 1s ease" }}>
                    The fairest token launchpad on Ethereum. Bonding curve pricing means early buyers always get the best price. No presales. No team allocations. Just pure market mechanics.
                </p>

                {/* CTA Buttons */}
                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 1.2s ease" }}>
                    <button onClick={handleLaunch} style={{
                        background: COLORS.accent, color: "#000", border: "none",
                        padding: "16px 40px", fontFamily: "IBM Plex Mono", fontSize: 14,
                        fontWeight: "bold", cursor: "pointer", letterSpacing: "0.1em",
                        boxShadow: "0 0 30px rgba(0,255,136,0.3)",
                        transition: "all 0.2s",
                    }}
                        onMouseEnter={e => e.target.style.boxShadow = "0 0 50px rgba(0,255,136,0.6)"}
                        onMouseLeave={e => e.target.style.boxShadow = "0 0 30px rgba(0,255,136,0.3)"}
                    >
                        🚀 LAUNCH A TOKEN
                    </button>
                    <button onClick={() => navigate('/explore')} style={{
                        background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`,
                        padding: "16px 40px", fontFamily: "IBM Plex Mono", fontSize: 14,
                        cursor: "pointer", letterSpacing: "0.1em", transition: "all 0.2s",
                    }}
                        onMouseEnter={e => { e.target.style.borderColor = COLORS.accent; e.target.style.color = COLORS.accent; }}
                        onMouseLeave={e => { e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.text; }}
                    >
                        EXPLORE TOKENS →
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, padding: "24px 32px", display: "flex", justifyContent: "center", gap: "clamp(20px, 5vw, 80px)", flexWrap: "wrap", background: COLORS.surface }}>
                {[
                    { value: "100%", label: "FAIR LAUNCH" },
                    { value: "0.001 ETH", label: "CREATION FEE" },
                    { value: "∞", label: "TOKENS POSSIBLE" },
                    { value: "LIVE", label: "ON SEPOLIA" },
                ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: "bold", color: COLORS.accent }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4, letterSpacing: "0.15em" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* How it works */}
            <div style={{ maxWidth: 900, margin: "80px auto", padding: "0 24px" }}>
                <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.2em", textAlign: "center", marginBottom: 48 }}>// HOW IT WORKS</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
                    {[
                        { step: "01", title: "CREATE", desc: "Fill in your token details — name, ticker, description, image. Pay 0.001 ETH creation fee." },
                        { step: "02", title: "TRADE", desc: "Bonding curve pricing kicks in immediately. Price rises as more people buy. Early buyers win." },
                        { step: "03", title: "GRADUATE", desc: "When your token hits the market cap threshold, liquidity moves to a DEX automatically." },
                    ].map((s, i) => (
                        <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 28 }}>
                            <div style={{ fontSize: 32, fontWeight: "bold", color: COLORS.border, marginBottom: 12 }}>{s.step}</div>
                            <div style={{ fontSize: 14, fontWeight: "bold", color: COLORS.accent, marginBottom: 12, letterSpacing: "0.1em" }}>{s.title}</div>
                            <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.8 }}>{s.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "24px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.muted }}>◈ PUMPZONE — Built on Ethereum Sepolia Testnet</div>
            </div>
        </div>
    );
}