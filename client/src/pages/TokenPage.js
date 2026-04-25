import { TokenPageSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import Navbar from '../components/NavBar';
import { useWallet } from '../context/WalletContext';
import TokenABI from '../contracts/Token.json';
import { getToken, saveTrade, getTradesForToken } from '../services/tokenService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

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

const timeNow = () => new Date().toLocaleTimeString("en-US", { hour12: false });
const wallets = ["0x3f...a1b2", "0x9c...d4e5", "0x1a...f6g7", "0xb2...h8i9", "0x7e...j0k1"];
const randomWallet = () => wallets[Math.floor(Math.random() * wallets.length)];

export default function TokenPage() {
    const [pageLoading, setPageLoading] = useState(true);
    const { address } = useParams();
    const { account, signer, connectWallet } = useWallet();
    const [contract, setContract] = useState(null);
    const [tokenInfo, setTokenInfo] = useState({ name: "", symbol: "", description: "", imageUrl: "", creator: "" });
    const [tokenPrice, setTokenPrice] = useState("0");
    const [totalSupply, setTotalSupply] = useState("0");
    const [balance, setBalance] = useState("0");
    const [buyAmount, setBuyAmount] = useState("");
    const [sellAmount, setSellAmount] = useState("");
    const [activity, setActivity] = useState([]);
    const [priceHistory, setPriceHistory] = useState([{ time: 0, price: 0 }]);

    const loadData = useCallback(async (c, acc) => {
        try {
            const supply = await c.totalSupply();
            const price = await c.getPrice(supply);
            const name = await c.name();
            const symbol = await c.symbol();
            const description = await c.description();
            const imageUrl = await c.imageUrl();
            const creator = await c.creator();
            const priceFormatted = parseFloat(ethers.formatEther(price));

            setTokenInfo({ name, symbol, description, imageUrl, creator });
            setTotalSupply(ethers.formatEther(supply));
            setTokenPrice(priceFormatted.toFixed(8));
            setPriceHistory(prev => [...prev, { time: prev.length, price: priceFormatted }].slice(-30));

            if (acc) {
                const bal = await c.balanceOf(acc);
                setBalance(ethers.formatEther(bal));
            }
            setPageLoading(false);
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        if (!address) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const c = new ethers.Contract(address, TokenABI.abi, signer || provider);
        setContract(c);
        loadData(c, account);

        // Load trade history from Firebase
        getToken(address).then(tokenData => {
            if (tokenData) {
                getTradesForToken(address).then(trades => {
                    setActivity(trades.map(t => ({
                        type: t.type,
                        wallet: t.wallet,
                        amount: t.amount,
                        time: new Date(t.timestamp).toLocaleTimeString("en-US", { hour12: false })
                    })));
                });
            }
        });

        const interval = setInterval(() => loadData(c, account), 5000);
        return () => clearInterval(interval);
    }, [address, signer, account, loadData]);

    const addActivity = (type, amount) => {
        setActivity(prev => [{ type, wallet: randomWallet(), amount, time: timeNow() }, ...prev].slice(0, 15));
    };

    const buyTokens = async () => {
        if (!account) { await connectWallet(); return; }
        if (!contract || !buyAmount) return;
        const toastId = toast.loading("Confirming buy...");
        try {
            const tx = await contract.connect(signer).buy({ value: ethers.parseEther(buyAmount) });
            await tx.wait();
            toast.success("Buy successful!", { id: toastId });
            addActivity("BUY", buyAmount + " ETH");
            await saveTrade({
                tokenAddress: address,
                type: "BUY",
                wallet: `${account.slice(0, 6)}...${account.slice(-4)}`,
                amount: buyAmount + " ETH",
                trader: account,
            });
            loadData(contract, account);
            setBuyAmount("");
        } catch (e) {
            toast.error(e.reason || e.message, { id: toastId });
        }
    };

    const sellTokens = async () => {
        if (!account) { await connectWallet(); return; }
        if (!contract || !sellAmount) return;
        const toastId = toast.loading("Confirming sell...");
        try {
            const tx = await contract.connect(signer).sell(ethers.parseEther(sellAmount));
            await tx.wait();
            toast.success("Sell successful!", { id: toastId });
            addActivity("SELL", sellAmount + " tokens");
            await saveTrade({
                tokenAddress: address,
                type: "SELL",
                wallet: `${account.slice(0, 6)}...${account.slice(-4)}`,
                amount: sellAmount + " tokens",
                trader: account,
            });
            loadData(contract, account);
            setSellAmount("");
        } catch (e) {
            toast.error(e.reason || e.message, { id: toastId });
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "IBM Plex Mono, monospace" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 10px #00FF8822} 50%{box-shadow:0 0 25px #00FF8855} }
        @media (min-width: 900px) { .token-grid { grid-template-columns: 1fr 380px !important; } }
        input:focus { outline: none; border-color: #00FF88 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #0F2535; }
      `}</style>

            <Navbar />

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
                {pageLoading ? (
                    <TokenPageSkeleton />
                ) : (
                    <>
                        {/* Token Header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, padding: 24, background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                            {tokenInfo.imageUrl ? (
                                <img src={tokenInfo.imageUrl} alt={tokenInfo.name} style={{ width: 64, height: 64, objectFit: "cover", border: `1px solid ${COLORS.border}` }} />
                            ) : (
                                <div style={{ width: 64, height: 64, background: COLORS.bg, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: COLORS.accent }}>
                                    ◈
                                </div>
                            )}
                            <div>
                                <h1 style={{ fontSize: 24, fontWeight: "bold", color: COLORS.text }}>{tokenInfo.name || "Loading..."}</h1>
                                <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
                                    <span style={{ fontSize: 10, border: `1px solid ${COLORS.accent}`, color: COLORS.accent, padding: "2px 8px" }}>${tokenInfo.symbol}</span>
                                    <span style={{ fontSize: 11, color: COLORS.muted }}>by {tokenInfo.creator ? `${tokenInfo.creator.slice(0, 6)}...${tokenInfo.creator.slice(-4)}` : "..."}</span>
                                </div>
                                {tokenInfo.description && <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 8, lineHeight: 1.6 }}>{tokenInfo.description}</p>}
                            </div>
                            <div style={{ marginLeft: "auto", textAlign: "right" }}>
                                <div style={{ fontSize: 22, fontWeight: "bold", color: COLORS.accent }}>{tokenPrice} ETH</div>
                                <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4, letterSpacing: "0.1em" }}>CURRENT PRICE</div>
                            </div>
                        </div>

                        <div className="token-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 24 }}>
                            {/* Left: Charts */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                                {/* Stats */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                                    {[
                                        { label: "TOTAL SUPPLY", value: parseFloat(totalSupply).toFixed(2) },
                                        { label: "YOUR BALANCE", value: parseFloat(balance).toFixed(2) },
                                        { label: "CONTRACT", value: `${address?.slice(0, 6)}...${address?.slice(-4)}` },
                                    ].map((s, i) => (
                                        <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 16, textAlign: "center" }}>
                                            <div style={{ fontSize: 16, fontWeight: "bold", color: COLORS.accent }}>{s.value}</div>
                                            <div style={{ fontSize: 9, color: COLORS.muted, marginTop: 4, letterSpacing: "0.15em" }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Price Chart */}
                                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 20 }}>
                                    <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em", marginBottom: 16 }}>// PRICE HISTORY</div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={priceHistory}>
                                            <XAxis dataKey="time" hide />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, fontFamily: "IBM Plex Mono", fontSize: 11 }}
                                                formatter={(v) => [v.toFixed(8) + " ETH", "Price"]}
                                            />
                                            <Line type="monotone" dataKey="price" stroke={COLORS.accent} strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Bonding Curve */}
                                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 20 }}>
                                    <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em", marginBottom: 16 }}>// BONDING CURVE</div>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <LineChart data={(() => {
                                            const points = [];
                                            for (let i = 0; i <= 200; i++) {
                                                const supply = i * 50;
                                                points.push({ supply, price: (supply * supply) / 1e12 });
                                            }
                                            return points;
                                        })()}>
                                            <XAxis dataKey="supply" hide />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, fontFamily: "IBM Plex Mono", fontSize: 11 }}
                                                formatter={(v) => [v.toFixed(8) + " ETH", "Price"]}
                                            />
                                            <Line type="monotone" dataKey="price" stroke={COLORS.yellow} strokeWidth={2} dot={false} />
                                            <ReferenceDot
                                                x={parseFloat(totalSupply)}
                                                y={(parseFloat(totalSupply) * parseFloat(totalSupply)) / 1e12}
                                                r={6}
                                                fill={COLORS.accent}
                                                stroke="none"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Activity Feed */}
                                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 20 }}>
                                    <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em", marginBottom: 16 }}>// ACTIVITY FEED</div>
                                    {activity.length === 0 ? (
                                        <div style={{ fontSize: 11, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>No activity yet — be the first to trade</div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
                                            {activity.map((e, i) => (
                                                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, animation: i === 0 ? "fadeIn 0.3s ease" : "none" }}>
                                                    <div style={{ display: "flex", gap: 10 }}>
                                                        <span style={{ color: e.type === "BUY" ? COLORS.accent : COLORS.red, fontSize: 11, fontWeight: "bold", width: 36 }}>{e.type}</span>
                                                        <span style={{ fontSize: 11, color: COLORS.muted }}>{e.wallet}</span>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: 11, color: COLORS.text }}>{e.amount}</span>
                                                        <span style={{ fontSize: 10, color: COLORS.muted, marginLeft: 8 }}>{e.time}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Trade Panel */}
                            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 24, height: "fit-content" }}>
                                <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em", marginBottom: 20 }}>// TRADE</div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                    <div>
                                        <div style={{ fontSize: 10, color: COLORS.accent, letterSpacing: "0.1em", marginBottom: 8 }}>BUY</div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <input
                                                type="number"
                                                placeholder="ETH amount"
                                                value={buyAmount}
                                                onChange={e => setBuyAmount(e.target.value)}
                                                style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "IBM Plex Mono", fontSize: 13, padding: "10px 12px" }}
                                            />
                                            <button onClick={buyTokens} style={{ background: COLORS.accent, color: "#000", border: "none", padding: "10px 16px", fontFamily: "IBM Plex Mono", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>
                                                BUY
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: "0.1em", marginBottom: 8 }}>SELL</div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <input
                                                type="number"
                                                placeholder="Token amount"
                                                value={sellAmount}
                                                onChange={e => setSellAmount(e.target.value)}
                                                style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "IBM Plex Mono", fontSize: 13, padding: "10px 12px" }}
                                            />
                                            <button onClick={sellTokens} style={{ background: "transparent", color: COLORS.red, border: `1px solid ${COLORS.red}`, padding: "10px 16px", fontFamily: "IBM Plex Mono", fontSize: 12, cursor: "pointer" }}>
                                                SELL
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}