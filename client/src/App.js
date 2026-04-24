import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import TokenLaunchpadABI from "./contracts/TokenLaunchpad.json";

const CONTRACT_ADDRESS = "0xa208dffBe99264E88E028f2CefD73Dd7F67660B4";

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

const generateCurve = (currentSupply) => {
  const points = [];
  const k = 0.000001;
  for (let i = 0; i <= 200; i++) {
    const supply = i * 50;
    points.push({ supply, price: k * supply * supply });
  }
  return points;
};

const wallets = ["0x3f...a1b2", "0x9c...d4e5", "0x1a...f6g7", "0xb2...h8i9", "0x7e...j0k1"];
const randomWallet = () => wallets[Math.floor(Math.random() * wallets.length)];
const timeNow = () => new Date().toLocaleTimeString("en-US", { hour12: false });

export default function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenPrice, setTokenPrice] = useState("0");
  const [totalSupply, setTotalSupply] = useState("0");
  const [balance, setBalance] = useState("0");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [status, setStatus] = useState("");
  const [activity, setActivity] = useState([]);
  const [priceHistory, setPriceHistory] = useState([{ time: 0, price: 0 }]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (contract && account) loadData(contract, account);
  }, [tick]);

  const addActivity = (type, amount) => {
    setActivity(prev => [{
      type,
      wallet: randomWallet(),
      amount,
      time: timeNow()
    }, ...prev].slice(0, 15));
  };

  const loadData = async (c, address) => {
    try {
      const supply = await c.totalSupply();
      const price = await c.getPrice(supply);
      const bal = await c.balanceOf(address);
      const priceFormatted = parseFloat(ethers.formatEther(price));
      setTotalSupply(ethers.formatEther(supply));
      setTokenPrice(priceFormatted.toFixed(8));
      setBalance(ethers.formatEther(bal));
      setPriceHistory(prev => [...prev, { time: prev.length, price: priceFormatted }].slice(-30));
    } catch (e) {
      console.error(e);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask first");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);
    const c = new ethers.Contract(CONTRACT_ADDRESS, TokenLaunchpadABI.abi, signer);
    setContract(c);
    loadData(c, address);
  };

  const buyTokens = async () => {
    if (!contract || !buyAmount) return;
    try {
      setStatus("⏳ Confirming buy...");
      const ethValue = ethers.parseEther(buyAmount);
      const tx = await contract.buy({ value: ethValue });
      await tx.wait();
      setStatus("✅ Buy successful!");
      addActivity("BUY", buyAmount + " ETH");
      loadData(contract, account);
      setBuyAmount("");
    } catch (e) {
      setStatus("❌ " + (e.reason || e.message));
    }
  };

  const sellTokens = async () => {
    if (!contract || !sellAmount) return;
    try {
      setStatus("⏳ Confirming sell...");
      const tx = await contract.sell(ethers.parseEther(sellAmount));
      await tx.wait();
      setStatus("✅ Sell successful!");
      addActivity("SELL", sellAmount + " tokens");
      loadData(contract, account);
      setSellAmount("");
    } catch (e) {
      setStatus("❌ " + (e.reason || e.message));
    }
  };

  const curveData = generateCurve();
  const currentSupplyNum = parseFloat(totalSupply);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'IBM Plex Mono', monospace", padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes glow { 0%,100%{box-shadow:0 0 10px #00FF8833} 50%{box-shadow:0 0 25px #00FF8866} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input:focus { outline: none; border-color: #00FF88 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #0F2535; }
      `}</style>

      {/* Header */}
      <div style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 20, fontWeight: "bold", color: COLORS.accent, letterSpacing: "0.1em" }}>◈ PUMPZONE</div>
          <span style={{ fontSize: 10, border: `1px solid ${COLORS.accent}`, color: COLORS.accent, padding: "2px 8px", letterSpacing: "0.1em" }}>SEPOLIA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {account && <span style={{ fontSize: 11, color: COLORS.muted }}>{account.slice(0, 6)}...{account.slice(-4)}</span>}
          <span style={{ fontSize: 11, color: COLORS.accent }}><span style={{ animation: "pulse 2s infinite", display: "inline-block" }}>●</span> LIVE</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "TOKEN PRICE", value: tokenPrice + " ETH" },
              { label: "TOTAL SUPPLY", value: parseFloat(totalSupply).toFixed(2) },
              { label: "YOUR BALANCE", value: parseFloat(balance).toFixed(2) },
            ].map((s, i) => (
              <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 16, textAlign: "center", animation: "glow 3s infinite" }}>
                <div style={{ fontSize: 18, fontWeight: "bold", color: COLORS.accent }}>{s.value}</div>
                <div style={{ fontSize: 9, color: COLORS.muted, marginTop: 4, letterSpacing: "0.15em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Price Chart */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 20 }}>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em", marginBottom: 16 }}>// PRICE HISTORY</div>
            <ResponsiveContainer width="100%" height={180}>
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
              <LineChart data={curveData}>
                <XAxis dataKey="supply" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, fontFamily: "IBM Plex Mono", fontSize: 11 }}
                  formatter={(v) => [v.toFixed(8) + " ETH", "Price"]}
                />
                <Line type="monotone" dataKey="price" stroke={COLORS.yellow} strokeWidth={2} dot={false} />
                {currentSupplyNum > 0 && (
                  <ReferenceDot
                    x={currentSupplyNum}
                    y={0.000001 * currentSupplyNum * currentSupplyNum}
                    r={6}
                    fill={COLORS.accent}
                    stroke="none"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Connect / Trade Panel */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 24 }}>
            {!account ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 14, color: COLORS.muted, marginBottom: 24 }}>Connect your wallet to start trading</div>
                <button onClick={connectWallet} style={{
                  background: COLORS.accent, color: "#000", border: "none", padding: "14px 32px",
                  fontFamily: "IBM Plex Mono", fontSize: 14, fontWeight: "bold", cursor: "pointer",
                  letterSpacing: "0.1em", animation: "glow 2s infinite"
                }}>
                  CONNECT WALLET
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em" }}>// TRADE</div>

                {/* Buy */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 10, color: COLORS.accent, letterSpacing: "0.1em" }}>BUY TOKENS</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="number"
                      placeholder="ETH amount"
                      value={buyAmount}
                      onChange={e => setBuyAmount(e.target.value)}
                      style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "IBM Plex Mono", fontSize: 13, padding: "10px 12px" }}
                    />
                    <button onClick={buyTokens} style={{
                      background: COLORS.accent, color: "#000", border: "none", padding: "10px 20px",
                      fontFamily: "IBM Plex Mono", fontSize: 12, fontWeight: "bold", cursor: "pointer", letterSpacing: "0.1em"
                    }}>BUY</button>
                  </div>
                </div>

                {/* Sell */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: "0.1em" }}>SELL TOKENS</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="number"
                      placeholder="Token amount"
                      value={sellAmount}
                      onChange={e => setSellAmount(e.target.value)}
                      style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "IBM Plex Mono", fontSize: 13, padding: "10px 12px" }}
                    />
                    <button onClick={sellTokens} style={{
                      background: "transparent", color: COLORS.red, border: `1px solid ${COLORS.red}`, padding: "10px 20px",
                      fontFamily: "IBM Plex Mono", fontSize: 12, cursor: "pointer", letterSpacing: "0.1em"
                    }}>SELL</button>
                  </div>
                </div>

                {status && (
                  <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: 12, fontSize: 12, color: COLORS.yellow, animation: "fadeIn 0.3s ease" }}>
                    {status}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 20, flex: 1 }}>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.15em", marginBottom: 16 }}>// ACTIVITY FEED</div>
            {activity.length === 0 ? (
              <div style={{ fontSize: 11, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>No activity yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                {activity.map((e, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, animation: i === 0 ? "fadeIn 0.3s ease" : "none" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ color: e.type === "BUY" ? COLORS.accent : COLORS.red, fontSize: 11, fontWeight: "bold", width: 36 }}>{e.type}</span>
                      <span style={{ fontSize: 11, color: COLORS.muted }}>{e.wallet}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 11, color: COLORS.text }}>{e.amount}</span>
                      <span style={{ fontSize: 10, color: COLORS.muted, marginLeft: 8 }}>{e.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}