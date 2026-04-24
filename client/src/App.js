import { useState, useEffect } from "react";
import { ethers } from "ethers";
import TokenLaunchpadABI from "./contracts/TokenLaunchpad.json";

const CONTRACT_ADDRESS = "0xa208dffBe99264E88E028f2CefD73Dd7F67660B4";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenPrice, setTokenPrice] = useState("0");
  const [totalSupply, setTotalSupply] = useState("0");
  const [balance, setBalance] = useState("0");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [status, setStatus] = useState("");

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

  const loadData = async (c, address) => {
  try {
    const supply = await c.totalSupply();
    const price = await c.getPrice(supply);
    const bal = await c.balanceOf(address);
    setTotalSupply(ethers.formatEther(supply));
    setTokenPrice(ethers.formatEther(price));
    setBalance(ethers.formatEther(bal));
   } catch (e) {
    console.error("Load data error:", e);
    setStatus("Error loading data: " + e.message);
   }
  };

  const buyTokens = async () => {
    if (!contract || !buyAmount) return;
    try {
      setStatus("Buying tokens...");
      const price = await contract.getPrice(await contract.totalSupply());
      const cost = price * BigInt(buyAmount);
      const tx = await contract.buy({ value: cost });
      await tx.wait();
      setStatus("Buy successful!");
      loadData(contract, account);
    } catch (e) {
      setStatus("Error: " + e.message);
    }
  };

  const sellTokens = async () => {
    if (!contract || !sellAmount) return;
    try {
      setStatus("Selling tokens...");
      const tx = await contract.sell(ethers.parseEther(sellAmount));
      await tx.wait();
      setStatus("Sell successful!");
      loadData(contract, account);
    } catch (e) {
      setStatus("Error: " + e.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", fontFamily: "monospace", padding: 20 }}>
      <h1 style={{ color: "#00FF88" }}>⬡ Token Launchpad</h1>
      <p style={{ color: "#888" }}>Contract: {CONTRACT_ADDRESS}</p>

      {!account ? (
        <button onClick={connectWallet} style={{ padding: "12px 24px", background: "#00FF88", border: "none", cursor: "pointer", fontFamily: "monospace", fontSize: 16 }}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          <p>Token Price: {tokenPrice} ETH</p>
          <p>Total Supply: {totalSupply} tokens</p>
          <p>Your Balance: {balance} tokens</p>

          <div style={{ marginTop: 20 }}>
            <h3>Buy Tokens</h3>
            <input
              type="number"
              placeholder="Amount in ETH"
              value={buyAmount}
              onChange={e => setBuyAmount(e.target.value)}
              style={{ padding: 8, marginRight: 10, fontFamily: "monospace" }}
            />
            <button onClick={buyTokens} style={{ padding: "8px 16px", background: "#00FF88", border: "none", cursor: "pointer", fontFamily: "monospace" }}>
              Buy
            </button>
          </div>

          <div style={{ marginTop: 20 }}>
            <h3>Sell Tokens</h3>
            <input
              type="number"
              placeholder="Amount of tokens"
              value={sellAmount}
              onChange={e => setSellAmount(e.target.value)}
              style={{ padding: 8, marginRight: 10, fontFamily: "monospace" }}
            />
            <button onClick={sellTokens} style={{ padding: "8px 16px", background: "#FF3A5C", border: "none", cursor: "pointer", fontFamily: "monospace" }}>
              Sell
            </button>
          </div>

          {status && <p style={{ marginTop: 20, color: "#FFD700" }}>{status}</p>}
        </div>
      )}
    </div>
  );
}

export default App;