import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Navbar from '../components/NavBar';
import { useWallet } from '../context/WalletContext';
import TokenFactoryABI from '../contracts/TokenFactory.json';
import { saveToken } from '../services/tokenService';

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

export default function Launch() {
    const navigate = useNavigate();
    const { account, signer, connectWallet } = useWallet();
    const [form, setForm] = useState({ name: "", ticker: "", description: "", imageUrl: "" });
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleLaunch = async () => {
        if (!account) {
            await connectWallet();
            return;
        }
        if (!form.name || !form.ticker) {
            setStatus("❌ Name and ticker are required");
            return;
        }

        try {
            setLoading(true);
            setStatus("⏳ Launching your token...");

            const factory = new ethers.Contract(FACTORY_ADDRESS, TokenFactoryABI.abi, signer);
            const tx = await factory.createToken(
                form.name,
                form.ticker.toUpperCase(),
                form.description,
                form.imageUrl,
                { value: ethers.parseEther("0.001") }
            );

            setStatus("⏳ Waiting for confirmation...");
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try {
                    const parsed = factory.interface.parseLog(log);
                    return parsed.name === "TokenCreated";
                } catch { return false; }
            });

            if (event) {
                const parsed = factory.interface.parseLog(event);
                const tokenAddress = parsed.args[0];

                await saveToken({
                    tokenAddress,
                    name: form.name,
                    symbol: form.ticker.toUpperCase(),
                    description: form.description,
                    imageUrl: form.imageUrl,
                    creator: account,
                });

                setStatus("✅ Token launched!");
                setTimeout(() => navigate(`/token/${tokenAddress}`), 1500);
            }
        } catch (e) {
            setStatus("❌ " + (e.reason || e.message));
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "IBM Plex Mono, monospace" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes glow { 0%,100%{box-shadow:0 0 10px #00FF8822} 50%{box-shadow:0 0 25px #00FF8855} }
        input:focus, textarea:focus { outline: none; border-color: #00FF88 !important; }
      `}</style>

            <Navbar />

            <div style={{ maxWidth: 600, margin: "60px auto", padding: "0 24px" }}>
                <div style={{ marginBottom: 40 }}>
                    <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.2em", marginBottom: 8 }}>// CREATE TOKEN</div>
                    <h1 style={{ fontSize: 32, fontWeight: "bold", color: COLORS.text }}>Launch Your Token</h1>
                    <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 8, lineHeight: 1.8 }}>
                        Fill in the details below. Your token will be deployed with a bonding curve instantly.
                    </p>
                </div>

                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>

                    <div>
                        <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em", marginBottom: 8 }}>TOKEN NAME *</div>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Naira Killa"
                            style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "IBM Plex Mono", fontSize: 13, padding: "12px 14px", transition: "border-color 0.2s" }}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em", marginBottom: 8 }}>TICKER SYMBOL *</div>
                        <input
                            name="ticker"
                            value={form.ticker}
                            onChange={handleChange}
                            placeholder="e.g. NKIL"
                            style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "IBM Plex Mono", fontSize: 13, padding: "12px 14px", transition: "border-color 0.2s" }}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em", marginBottom: 8 }}>DESCRIPTION</div>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="What is this token about?"
                            rows={4}
                            style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "IBM Plex Mono", fontSize: 13, padding: "12px 14px", resize: "none", transition: "border-color 0.2s" }}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em", marginBottom: 8 }}>IMAGE URL</div>
                        <input
                            name="imageUrl"
                            value={form.imageUrl}
                            onChange={handleChange}
                            placeholder="https://..."
                            style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "IBM Plex Mono", fontSize: 13, padding: "12px 14px", transition: "border-color 0.2s" }}
                        />
                        {form.imageUrl && (
                            <img src={form.imageUrl} alt="preview" style={{ width: 80, height: 80, objectFit: "cover", marginTop: 12, border: `1px solid ${COLORS.border}` }} />
                        )}
                    </div>

                    <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: 14, fontSize: 11, color: COLORS.muted, lineHeight: 1.8 }}>
                        ⚡ Creation fee: <span style={{ color: COLORS.accent }}>0.001 ETH</span> — This deploys your token contract on Sepolia.
                    </div>

                    {status && (
                        <div style={{ padding: 12, background: COLORS.bg, border: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.yellow }}>
                            {status}
                        </div>
                    )}

                    <button
                        onClick={handleLaunch}
                        disabled={loading}
                        style={{
                            background: loading ? COLORS.muted : COLORS.accent,
                            color: "#000",
                            border: "none",
                            padding: "16px",
                            fontFamily: "IBM Plex Mono",
                            fontSize: 14,
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer",
                            letterSpacing: "0.1em",
                            animation: !loading ? "glow 2s infinite" : "none",
                            transition: "all 0.2s",
                        }}
                    >
                        {loading ? "LAUNCHING..." : "🚀 LAUNCH TOKEN — 0.001 ETH"}
                    </button>
                </div>
            </div>
        </div>
    );
}