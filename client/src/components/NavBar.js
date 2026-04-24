import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const COLORS = {
    bg: "#050A0E",
    surface: "#0A1520",
    border: "#0F2535",
    accent: "#00FF88",
    text: "#E0F0FF",
    muted: "#4A7090",
};

export default function Navbar() {
    const { account, connectWallet } = useWallet();
    const navigate = useNavigate();

    return (
        <nav style={{
            background: COLORS.surface,
            borderBottom: `1px solid ${COLORS.border}`,
            padding: "16px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 100,
        }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap');`}</style>

            {/* Logo */}
            <Link to="/" style={{ textDecoration: "none" }}>
                <div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: "bold", color: COLORS.accent, letterSpacing: "0.1em" }}>
                    ◈ PUMPZONE
                </div>
            </Link>

            {/* Links */}
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
                <Link to="/explore" style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: COLORS.muted, textDecoration: "none", letterSpacing: "0.1em" }}>
                    EXPLORE
                </Link>
                <Link to="/launch" style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: COLORS.muted, textDecoration: "none", letterSpacing: "0.1em" }}>
                    LAUNCH
                </Link>
                {account && (
                    <Link to={`/profile/${account}`} style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: COLORS.muted, textDecoration: "none", letterSpacing: "0.1em" }}>
                        PROFILE
                    </Link>
                )}
            </div>

            {/* Wallet */}
            <div>
                {!account ? (
                    <button onClick={connectWallet} style={{
                        background: COLORS.accent,
                        color: "#000",
                        border: "none",
                        padding: "10px 20px",
                        fontFamily: "IBM Plex Mono",
                        fontSize: 12,
                        fontWeight: "bold",
                        cursor: "pointer",
                        letterSpacing: "0.1em",
                    }}>
                        CONNECT WALLET
                    </button>
                ) : (
                    <div
                        onClick={() => navigate(`/profile/${account}`)}
                        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                    >
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${COLORS.accent}, #0066FF)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            color: "#000",
                            fontWeight: "bold",
                            border: `2px solid ${COLORS.accent}`,
                            boxShadow: "0 0 12px rgba(0,255,136,0.3)",
                        }}>
                            ◈
                        </div>
                        <span style={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: COLORS.accent }}>MY ACCOUNT</span>
                    </div>
                )}
            </div>
        </nav>
    );
}