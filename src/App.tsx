import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Zap,
  Lock,
  Unlock,
  Search,
  Eye,
  ShieldCheck,
  User,
  Check,
  Home,
  History,
  CandlestickChart,
  Settings,
  Plus,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  Mail,
  Send,
  Download,
  RefreshCw,
  Wallet,
  Bell,
  UserCheck,
  FileText,
  Key,
  Shield,
  Info,
  Scale,
  LogOut,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  Star,
  ExternalLink, // 🟢 Added for the Solscan link
} from "lucide-react";
// --- 1. CONFIGURATION & SENSORY ENGINE ---
const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=0cb3ef0d-c6ed-4b98-b975-142a670980ff`;

/**
 * High-end notification ping for verified assets
 */
const playPing = () => {
  const audio = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
  );
  audio.volume = 0.15;
  audio.play().catch(() => {});
};

/**
 * Logic to determine token safety (1-10)
 */
const calculateRiskScore = (pair) => {
  let score = 1;
  const liquidity = pair.liquidity?.usd || 0;

  // Liquidity is the #1 safety factor
  if (liquidity < 5000) score += 5; // High Danger
  else if (liquidity < 20000) score += 3; // Moderate Danger

  // Social proof
  if (!pair.info?.socials || pair.info.socials.length === 0) score += 2;

  return Math.min(score, 10);
};
// --- 1. HAPTIC ENGINE ---
const triggerHaptic = (type = "light") => {
  if (
    typeof window !== "undefined" &&
    window.navigator &&
    window.navigator.vibrate
  ) {
    if (type === "light") window.navigator.vibrate(10);
    if (type === "medium") window.navigator.vibrate(30);
    if (type === "heavy") window.navigator.vibrate([50, 30, 50]);
  }
};

// --- 2. THEME DEFINITIONS ---
const themes = {
  slate: {
    id: "slate",
    primary: "#FFFFFF", // White buttons for high contrast
    accent: "#111111", // Black for text on white buttons
    gradient: "from-[#FFFFFF] via-[#E5E5E5] to-[#CCCCCC]", // A "White Marble" Card
    glow: "rgba(255, 255, 255, 0.2)",
    bg: "bg-[#1A1C1E]", // Deep Nordic Slate (The "Awesome" background)
    isLight: false, // Keep as false so text stays white globally
  },
  gold: {
    id: "gold",
    primary: "#D4AF37",
    gradient: "from-[#D4AF37] via-[#996515] to-[#000]",
    glow: "rgba(212, 175, 55, 0.2)",
    bg: "bg-[#080705]",
    isLight: false,
  },
  blueprint: {
    id: "blueprint",
    primary: "#0076FF",
    gradient: "from-[#0076FF] via-[#003366] to-[#000]",
    glow: "rgba(0, 118, 255, 0.2)",
    bg: "bg-[#05070a]",
    grid: true,
    isLight: false,
  },
};

// --- 3. MAIN APPLICATION ---
export default function VerveLuxeApp() {
  const [authState, setAuthState] = useState("login");
  const [activeTab, setActiveTab] = useState("home");
  const [currentTheme, setCurrentTheme] = useState("gold");
  const [isFrozen, setIsFrozen] = useState(false);
  const [isGhostCard, setIsGhostCard] = useState(false);

  // 🟢 NEW: Score is now dynamic (Starts at 750)
  const [score, setScore] = useState(750);

  // 🟢 NEW: Logic to switch between normal and elite status
  const toggleScore = () => {
    const newScore = score === 750 ? 890 : 750;
    setScore(newScore);

    // Auto-reset card style if score drops back down
    if (newScore === 750) {
      setIsGhostCard(false);
    }
  };

  const theme = themes[currentTheme];

  if (authState !== "authenticated") {
    return (
      <AuthPage
        theme={theme}
        setAuthState={setAuthState}
        authState={authState}
        onLogin={() => setAuthState("authenticated")}
      />
    );
  }

  return (
    <div
      className={`min-h-screen ${theme.bg} text-white font-sans transition-colors duration-700 overflow-x-hidden`}
    >
      {/* Structural Overlays */}
      {theme.grid && (
        <div
          className="fixed inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      )}
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% -10%, ${theme.glow} 0%, transparent 60%)`,
        }}
      />

      <div className="max-w-md mx-auto px-6 pt-12 pb-40 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* 1. HOME VIEW */}
            {activeTab === "home" && (
              <HomeView
                theme={theme}
                isFrozen={isFrozen}
                setIsFrozen={setIsFrozen}
                isGhostCard={isGhostCard}
              />
            )}

            {/* 🟢 2. RESTORED: HISTORY VIEW */}
            {activeTab === "history" && <HistoryView theme={theme} />}

            {/* 🟢 3. RESTORED: TRADING VIEW */}
            {activeTab === "trading" && <TradingView theme={theme} />}

            {/* 4. CREDIT VIEW (With ZK-Scan Logic) */}
            {activeTab === "credit" && (
              <CreditScoreView
                theme={theme}
                score={score}
                isGhostCard={isGhostCard}
                setIsGhostCard={setIsGhostCard}
                toggleScore={toggleScore}
              />
            )}

            {/* 5. SETTINGS VIEW */}
            {activeTab === "settings" && (
              <SettingsView
                theme={theme}
                setCurrentTheme={setCurrentTheme}
                currentTheme={currentTheme}
                onLogout={() => setAuthState("login")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
      />
    </div>
  );
}

// --- 4. AUTHENTICATION (Login, Signup, Forgot) ---
function AuthPage({ theme, setAuthState, authState, onLogin }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  // Local view state: 'login' | 'signup' | 'forgot'
  const [view, setView] = useState("login");

  const handleAuthAction = () => {
    triggerHaptic("medium");

    // If biometrics are ON and it's a login, show the scanner
    if (biometricsEnabled && view === "login") {
      setIsScanning(true);
      setTimeout(() => {
        setScanComplete(true);
        triggerHaptic("heavy");
        setTimeout(() => {
          onLogin();
        }, 800);
      }, 2000);
    } else {
      // Direct login if biometrics are off or it's signup/forgot
      onLogin();
    }
  };

  return (
    <div
      className={`fixed inset-0 ${theme.bg} flex flex-col justify-center px-8 z-[300]`}
    >
      {/* 1. BIOMETRIC SCANNER OVERLAY */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center"
          >
            <div className="relative w-40 h-40">
              <motion.div
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 border-2 rounded-[40px]"
                style={{ borderColor: theme.primary }}
              />
              {!scanComplete && (
                <motion.div
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-4 right-4 h-[1px] z-10 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  style={{ backgroundColor: theme.primary }}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center p-10">
                <img
                  src="/logo.png"
                  alt="Verve"
                  className={`w-full h-full object-contain transition-all duration-700 ${
                    scanComplete ? "scale-110" : "opacity-20 grayscale"
                  }`}
                />
              </div>
            </div>
            <p
              className="mt-10 font-black uppercase tracking-[0.4em] text-[10px]"
              style={{ color: scanComplete ? "#4ade80" : "#fff" }}
            >
              {scanComplete ? "Identity Confirmed" : "Scanning FaceID..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. LOGO SECTION */}
      <div className="text-center mb-10">
        <motion.div
          layoutId="app-logo"
          className="w-24 h-24 mx-auto mb-4 flex items-center justify-center relative"
        >
          <div
            className="absolute inset-0 blur-[20px] opacity-20 rounded-full"
            style={{ backgroundColor: theme.primary }}
          />
          <img
            src="/logo.png"
            alt="VervePay"
            className="w-full h-full object-contain relative z-10"
          />
        </motion.div>
        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
          VervePay
        </h1>
      </div>

      {/* 3. DYNAMIC FORM CONTAINER */}
      <motion.div
        layout
        className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[40px] p-8 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            <h2 className="text-center text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-50">
              {view === "login"
                ? "Vault Access"
                : view === "signup"
                ? "New Membership"
                : "Account Recovery"}
            </h2>

            <AuthInput
              icon={<Mail size={18} />}
              placeholder="Email Address"
              type="email"
            />

            {view !== "forgot" && (
              <AuthInput
                icon={<Lock size={18} />}
                placeholder="Password"
                type="password"
              />
            )}

            {/* BIOMETRIC TOGGLE (Only on Login) */}
            {view === "login" && (
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                  Biometrics
                </span>
                <button
                  onClick={() => {
                    setBiometricsEnabled(!biometricsEnabled);
                    triggerHaptic("light");
                  }}
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    biometricsEnabled ? "bg-green-500/20" : "bg-white/10"
                  }`}
                >
                  <motion.div
                    animate={{ x: biometricsEnabled ? 22 : 4 }}
                    className="absolute top-1 w-3 h-3 rounded-full shadow-lg"
                    style={{
                      backgroundColor: biometricsEnabled ? "#4ade80" : "#666",
                    }}
                  />
                </button>
              </div>
            )}

            <button
              onClick={handleAuthAction}
              className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs mt-2"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 10px 30px ${theme.glow}`,
              }}
            >
              {view === "login"
                ? "Authorize"
                : view === "signup"
                ? "Create"
                : "Reset"}
            </button>
          </motion.div>
        </AnimatePresence>

        {/* 4. NAVIGATION LINKS */}
        <div className="mt-8 flex flex-col gap-4 text-center">
          {view === "login" ? (
            <>
              <button
                onClick={() => setView("forgot")}
                className="text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100"
              >
                Forgot Password?
              </button>
              <div className="h-[1px] bg-white/5 w-10 mx-auto" />
              <button
                onClick={() => setView("signup")}
                className="text-xs font-black uppercase italic"
                style={{ color: theme.primary }}
              >
                Create New Identity
              </button>
            </>
          ) : (
            <button
              onClick={() => setView("login")}
              className="text-xs font-black uppercase italic"
              style={{ color: theme.primary }}
            >
              Back to Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const AuthInput = ({ icon, ...props }) => (
  <div className="relative flex items-center">
    <div className="absolute left-4 opacity-30">{icon}</div>
    <input
      {...props}
      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
    />
  </div>
);

// --- 5. HOME VIEW (Logo, +, Card, Pulse) ---
function HomeView({ theme, isFrozen, setIsFrozen, isGhostCard }) {
  // 🟢 Added isGhostCard
  const [isActionMenuOpen, setIsActionMenuOpen] = React.useState(false);
  // ... the rest of your quickActions code stays the same

  // 2. Action Items
  const quickActions = [
    { label: "Send", icon: <Send size={18} /> },
    { label: "Receive", icon: <Download size={18} /> },
    { label: "Withdraw", icon: <ArrowUpRight size={18} /> },
    { label: "Transfer", icon: <RefreshCw size={18} /> },
  ];

  return (
    <>
      {/* --- 1. HEADER & PLUS MENU --- */}
      <header className="flex justify-between items-center mb-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="VervePay Logo"
              className="max-w-full max-h-full object-contain"
              style={{ filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.5))" }}
            />
          </div>
          <h1
            className={`text-xl font-black italic tracking-tighter uppercase leading-none ${
              theme.isLight ? "text-black" : "text-white"
            }`}
          >
            VervePay
          </h1>
        </div>

        <div className="relative">
          <button
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-90 z-50"
            onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
          >
            <Plus
              size={20}
              style={{ color: theme.primary }}
              className={`transition-transform duration-300 ${
                isActionMenuOpen ? "rotate-45" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isActionMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsActionMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 mt-4 w-48 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[24px] p-2 shadow-2xl z-50 overflow-hidden"
                >
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors rounded-xl group"
                      onClick={() => setIsActionMenuOpen(false)}
                    >
                      <div className="text-white/40 group-hover:text-white transition-colors">
                        {action.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* --- 2. VIRTUAL CARD & FREEZE LOGIC --- */}
      <section className="mb-10">
        <div className="flex justify-between items-end mb-4 px-1">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
            Virtual Card
          </p>
          <button
            onClick={() => {
              setIsFrozen(!isFrozen);
              triggerHaptic("heavy");
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
          >
            {isFrozen ? (
              <Unlock size={12} className="text-green-400" />
            ) : (
              <Lock size={12} className="text-red-400" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              {isFrozen ? "Unfreeze" : "Freeze"}
            </span>
          </button>
        </div>

        <div className="relative">
          {/* 🟢 ONLY THIS LINE UPDATED: Added isGhost prop */}
          <InteractiveCard
            theme={theme}
            isFrozen={isFrozen}
            isGhost={isGhostCard}
          />

          <AnimatePresence>
            {isFrozen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 rounded-[32px] backdrop-blur-md bg-black/40 flex flex-col items-center justify-center border border-white/10"
              >
                <Lock size={32} className="opacity-20 mb-2" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 text-white">
                  Security Active
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <ActionCard
          icon={<BarChart3 size={20} className="text-blue-400" />}
          label="Market Pulse"
          sub="SOL Trends"
        />
        <ActionCard
          icon={<ShieldCheck size={20} style={{ color: theme.primary }} />}
          label="Reputation"
          sub="ZK-Verified"
        />
      </div>
      <SpendingChart theme={theme} />
    </>
  );
}

// // --- 6. TRADING VIEW (Unified: Market, TVL, Live Feed & History) ---
function TradingView({ theme }) {
  // --- STATE ---
  const [selectedAsset, setSelectedAsset] = useState("SOL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tradeTab, setTradeTab] = useState("favourite");
  const [liveNewCoins, setLiveNewCoins] = useState([]);
  const [solanaTVL, setSolanaTVL] = useState("12.27B");
  const [hideHighRisk, setHideHighRisk] = useState(false);
  const [activeSheetAsset, setActiveSheetAsset] = useState(null);
  const [tradeAmount, setTradeAmount] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("0.00");
  const [showToast, setShowToast] = useState(false);

  // --- TERMINAL & SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- PERSISTENCE STATE ---
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("verve_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("verve_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // --- LOGIC: HANDLE CA SEARCH ---
  const handleCASearch = async (address) => {
    const cleanAddress = address.trim().split(" ")[0];
    if (cleanAddress.length < 32) return;
    setIsSearching(true);

    try {
      // 1. HELIUS (Using your verified key)
      const heliusRes = await fetch(
        `https://mainnet.helius-rpc.com/?api-key=0cb3ef0d-c6ed-4b98-b975-142a670980ff`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "getAsset",
            params: { id: cleanAddress },
          }),
        }
      );
      const metadata = await heliusRes.json();

      // 2. DEXSCREENER (Using thingproxy to bypass 403 Forbidden)
      const dexTarget = `https://api.dexscreener.com/latest/dex/pairs/solana/${cleanAddress}`;
      const dexRes = await fetch(
        `https://thingproxy.freeboard.io/fetch/${dexTarget}`
      );

      // Safety check for valid JSON
      const dexData = await dexRes.json();

      if (dexData?.pair) {
        setActiveSheetAsset({
          name:
            metadata?.result?.content?.metadata?.name ||
            dexData.pair.baseToken.name,
          symbol: dexData.pair.baseToken.symbol,
          price: dexData.pair.priceUsd,
          ca: cleanAddress,
          fdv: dexData.pair.fdv,
          icon:
            metadata?.result?.content?.links?.image ||
            dexData.pair.info?.imageUrl ||
            "",
        });
      }
    } catch (e) {
      console.error("Search Error:", e.message);
    } finally {
      setIsSearching(false);
    }
  };

  // --- LOGIC: COPY TO CLIPBOARD ---
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- LOGIC FUNCTIONS ---
  const toggleFavorite = (coin) => {
    setFavorites((prev) =>
      prev.find((f) => f.pairAddress === coin.pairAddress)
        ? prev.filter((f) => f.pairAddress !== coin.pairAddress)
        : [...prev, coin]
    );
  };

  // KEEP ONLY THIS VERSION OF THE FUNCTION
  const handleConfirmOrder = () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) return;
    if (typeof triggerHaptic === "function") triggerHaptic("heavy");

    setShowToast(true);
    setActiveSheetAsset(null);
    setTradeAmount("");

    setTimeout(() => setShowToast(false), 3000);
  };

  // --- DATA ---
  const balance = 1245.5;
  const assets = [
    { name: "SOL", sub: "Solana Ecosystem", price: "104.22", change: "+5.24%" },
    { name: "USDC", sub: "USD Coin", price: "1.00", change: "0.00%" },
  ];

  const currentAsset = assets.find((a) => a.name === selectedAsset);

  // --- LIVE FETCHING (Updated with CORS Proxy & Fixed Syntax) ---
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const targetUrl =
          "https://api.dexscreener.com/latest/dex/networks/solana";
        // We try a direct fetch first (sometimes CSB allows it), then fallback
        let response = await fetch(
          `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
        );
        let result = await response.json();

        // Check if the contents is actually JSON and not an HTML error string
        if (result.contents.trim().startsWith("<!DOCTYPE")) {
          throw new Error("Proxy returned HTML instead of JSON");
        }

        const dexData = JSON.parse(result.contents);

        if (dexData && dexData.pairs) {
          setLiveNewCoins(
            dexData.pairs.slice(0, 15).map((pair) => ({
              pairAddress: pair.pairAddress,
              baseToken: pair.baseToken,
              fdv: pair.fdv,
              priceUsd: pair.priceUsd,
              info: pair.info,
              liquidity: pair.liquidity || { usd: 0 },
            }))
          );
        }
      } catch (e) {
        console.warn("Market Sync: Retrying via secondary route...", e.message);
        // Silent fail to keep the "Scanning" UI active without crashing
      }
    };
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);
  // --- DYNAMIC CONTENT RENDERING ---
  const renderTabContent = () => {
    if (tradeTab === "new") {
      // 1. Show scanner if no coins are found yet
      if (liveNewCoins.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <RadarScanner />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-6 animate-pulse">
              Scanning Solana...
            </p>
          </div>
        );
      }

      // 2. Filter and Map the coins if data exists
      return (
        <div className="space-y-3">
          {liveNewCoins
            .filter((coin) => true)
            .map((coin) => (
              <LaunchItem
                key={coin.pairAddress}
                name={coin.baseToken.name}
                sym={coin.baseToken.symbol}
                cap={coin.fdv ? (coin.fdv / 1000).toFixed(0) + "K" : "NEW"}
                icon={coin.info?.imageUrl}
                riskScore={calculateRiskScore(coin)}
                onSelect={() =>
                  setActiveSheetAsset({
                    name: coin.baseToken.name,
                    symbol: coin.baseToken.symbol,
                    price: coin.priceUsd,
                    ca: coin.pairAddress,
                  })
                }
              />
            ))}
        </div>
      );
    }

    // ... other tabs (favourite, history)
    return (
      <div className="text-white/20 text-center py-10 uppercase font-black">
        No History
      </div>
    );
  };

  // --- HELPER: Safe Risk Calculation ---
  const getRiskScore = (coin) => {
    try {
      if (typeof calculateRiskScore === "function") {
        return calculateRiskScore(coin);
      }
    } catch (e) {
      console.error("Risk Calc Error:", e);
    }
    return 5;
  };

  return (
    <div className="pt-2 relative pb-32">
      {/* 🟢 SUCCESS TOAST */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-6 right-6 z-[200] bg-white text-black p-4 rounded-[24px] shadow-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <Check size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Execution Success
              </p>
              <p className="text-sm font-bold">Order Confirmed</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TERMINAL HEADER & SEARCH (Replaces old Header) */}
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
            Terminal
          </h2>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            {["Market", "Limit"].map((t) => (
              <button
                key={t}
                className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${
                  t === "Market"
                    ? "bg-white/10 text-white"
                    : "opacity-30 text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            {isSearching ? (
              <RefreshCw size={16} className="text-indigo-500 animate-spin" />
            ) : (
              <Search size={16} className="text-white/20" />
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length >= 32) handleCASearch(e.target.value);
            }}
            placeholder="PASTE CA OR COIN NAME..."
            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-4 pl-14 pr-12 text-[11px] font-black text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all uppercase tracking-widest"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* TRENDING CHIPS */}
        {!searchQuery && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
            {["$SOL", "$JUP", "$PYTH", "$BONK"].map((ticker) => (
              <button
                key={ticker}
                onClick={() => setSearchQuery(ticker)}
                className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-white/40 border border-white/5 uppercase transition-colors hover:border-indigo-500/50 hover:text-white"
              >
                {ticker}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. NAVIGATION TABS (Updated version) */}
      <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-[24px]">
        {["favourite", "new", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setTradeTab(tab);
              if (typeof triggerHaptic === "function") triggerHaptic("light");
            }}
            className={`flex-1 py-3 text-[10px] font-black uppercase rounded-[20px] transition-all ${
              tradeTab === tab
                ? "bg-white text-black shadow-lg"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. DYNAMIC CONTENT */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tradeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* NEW TAB (SCANNER) */}
            {tradeTab === "new" && (
              <div className="space-y-3">
                {liveNewCoins && liveNewCoins.length > 0 ? (
                  liveNewCoins
                    .filter(
                      (c) =>
                        !hideHighRisk ||
                        (typeof calculateRiskScore === "function" &&
                          calculateRiskScore(c) < 7)
                    )
                    .map((coin) => (
                      <div key={coin.pairAddress} className="relative group">
                        <LaunchItem
                          name={coin.baseToken.name}
                          sym={coin.baseToken.symbol}
                          cap={
                            coin.fdv
                              ? (coin.fdv / 1000).toFixed(0) + "K"
                              : "NEW"
                          }
                          icon={coin.info?.imageUrl}
                          riskScore={
                            typeof calculateRiskScore === "function"
                              ? calculateRiskScore(coin)
                              : 5
                          }
                          onSelect={() =>
                            setActiveSheetAsset({
                              symbol: coin.baseToken.symbol,
                              price: coin.priceUsd,
                            })
                          }
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(coin);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 z-10"
                        >
                          <Star
                            size={16}
                            className={
                              favorites.some(
                                (f) => f.pairAddress === coin.pairAddress
                              )
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-white/20 hover:text-white/50 transition-colors"
                            }
                          />
                        </button>
                      </div>
                    ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <RadarScanner />
                    <p className="text-[10px] font-black uppercase mt-6 text-gray-600 animate-pulse tracking-widest">
                      Scanning Solana...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* FAVOURITE TAB */}
            {tradeTab === "favourite" && (
              <div className="space-y-3">
                {favorites.length > 0 ? (
                  favorites.map((coin) => (
                    <div key={coin.pairAddress} className="relative group">
                      <LaunchItem
                        name={coin.baseToken.name}
                        sym={coin.baseToken.symbol}
                        cap={
                          coin.fdv ? (coin.fdv / 1000).toFixed(0) + "K" : "NEW"
                        }
                        icon={coin.info?.imageUrl}
                        riskScore={
                          typeof calculateRiskScore === "function"
                            ? calculateRiskScore(coin)
                            : 5
                        }
                        onSelect={() =>
                          setActiveSheetAsset({
                            symbol: coin.baseToken.symbol,
                            price: coin.priceUsd,
                          })
                        }
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(coin);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 z-10"
                      >
                        <Star
                          size={16}
                          className="fill-yellow-400 text-yellow-400"
                        />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-20">
                    <Star size={32} className="mx-auto mb-4 text-white" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">
                      Your list is empty
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* HISTORY TAB */}
            {tradeTab === "history" && (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-[40px] opacity-20 text-white">
                <History size={32} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  No Trade History
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 🟢 BUY SHEET */}
      <AnimatePresence>
        {activeSheetAsset && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSheetAsset(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#0D0D0D] border-t border-white/10 rounded-t-[40px] z-[120] p-8 pb-12"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-10" />

              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">
                    Executing Buy
                  </p>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                    Buy {activeSheetAsset.symbol}
                  </h3>
                </div>
                <p className="text-xl font-black text-white/40">
                  ${activeSheetAsset.price}
                </p>
              </div>

              {/* TRADE INPUT */}
              <div className="relative mb-6">
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 p-8 rounded-[32px] text-5xl font-black text-white outline-none border border-white/5"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-gray-500 uppercase tracking-widest">
                  USDC
                </div>
              </div>

              {/* VERIFIED CA & COPY BUTTON (Added here for flow) */}
              {activeSheetAsset?.ca && (
                <div className="mb-10 p-5 bg-white/[0.03] border border-white/5 rounded-[24px] flex items-center justify-between group">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">
                      Verified Contract
                    </span>
                    <span className="text-[11px] font-mono text-white/60">
                      {activeSheetAsset.ca.slice(0, 8)}...
                      {activeSheetAsset.ca.slice(-8)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(activeSheetAsset.ca)}
                      className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all active:scale-90"
                    >
                      {copied ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <FileText size={18} className="text-indigo-400" />
                      )}
                    </button>
                    <a
                      href={`https://solscan.io/token/${activeSheetAsset.ca}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
                    >
                      <ExternalLink size={18} className="text-white/40" />
                    </a>
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleConfirmOrder}
                  className="py-6 bg-white text-black font-black uppercase rounded-[24px] active:scale-95 transition-transform"
                >
                  Confirm Order
                </button>
                <button
                  onClick={() => setActiveSheetAsset(null)}
                  className="py-6 bg-white/5 text-white font-black uppercase rounded-[24px] active:scale-95 transition-transform"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- 7. CREDIT SCORE VIEW (Score, ZK Scan, Yield) ---
function CreditScoreView({
  theme,
  score,
  isGhostCard,
  setIsGhostCard,
  toggleScore,
}) {
  return (
    <div className="pt-2">
      <div className="flex flex-col items-center mb-6 py-10">
        {/* SCORE CIRCLE */}
        <div className="relative w-52 h-52 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed opacity-20"
            style={{ borderColor: theme.primary }}
          />
          <div className="text-center">
            <p
              className="text-6xl font-black tracking-tighter"
              style={{ color: theme.primary }}
            >
              {score}
            </p>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mt-3">
              Identity Score
            </p>
          </div>
        </div>

        {/* 🟢 SCAN BUTTON: Now moved up and linked to toggleScore */}
        <div
          onClick={toggleScore}
          className="mt-10 w-full bg-white/5 border border-white/10 p-6 rounded-[32px] flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-all active:scale-95 shadow-xl"
        >
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-blue-400" />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold uppercase tracking-widest text-white">
                ZK-Scan Portal
              </span>
              <span className="text-[9px] text-gray-500 uppercase font-black">
                {score === 750 ? "Tap to Scan Blockchain" : "Scan Complete"}
              </span>
            </div>
          </div>
          <ArrowUpRight
            size={18}
            className="opacity-20 group-hover:opacity-100 text-white"
          />
        </div>

        {/* UPGRADE NOTIFICATION: Only shows when score is elite (890) */}
        {score >= 888 && !isGhostCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-[32px] backdrop-blur-md text-center w-full shadow-2xl"
          >
            <div className="flex justify-center mb-3 text-purple-400">
              <ShieldCheck className="animate-pulse" size={32} />
            </div>
            <h4 className="text-white font-black uppercase italic tracking-tighter text-sm mb-1">
              Ghost Tier Unlocked
            </h4>
            <p className="text-[10px] text-purple-200/60 uppercase tracking-[0.2em] mb-4 leading-relaxed">
              Your ZK-Score is Elite. Claim your premium card.
            </p>
            <button
              onClick={() => {
                setIsGhostCard(true);
                triggerHaptic("heavy");
              }}
              className="w-full py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              Upgrade to Diamond Card
            </button>
          </motion.div>
        )}
      </div>

      {/* REWARDS SECTION */}
      <div className="p-6 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/10 rounded-[32px] flex justify-between items-center">
        <div>
          <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">
            Rewards
          </p>
          <h4 className="font-bold text-lg text-white">4.1% USDC APY</h4>
        </div>
        <div className="text-right font-black text-xl text-white">₦42,000</div>
      </div>
    </div>
  );
}

// --- 8. SETTINGS VIEW (Profile, Themes, Extended Menu) ---
function SettingsView({ theme, setCurrentTheme, currentTheme, onLogout }) {
  return (
    <div className="pt-2 pb-20">
      {/* --- PROFILE HEADER (UNTOUCHED) --- */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-[32px] bg-white/5 mb-4 flex items-center justify-center border border-white/10 relative">
          <User size={40} className="opacity-20" />
          <div className="absolute top-0 right-0 p-1">
            <CheckCircle2 size={16} className="text-blue-500" />
          </div>
        </div>
        <h2 className="text-2xl font-black">Alex Carter</h2>
        <p className="text-xs text-gray-500 font-bold mb-4">
          alex.carter@vervepay.io
        </p>
        <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] text-blue-400 font-black uppercase tracking-widest">
          Verified Account
        </div>
      </div>

      {/* --- SYSTEM THEME GRID (UNTOUCHED) --- */}
      <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] ml-4 mb-4">
        System Theme
      </p>
      <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-[32px] border border-white/5 mb-10">
        {Object.keys(themes).map((t) => (
          <button
            key={t}
            onClick={() => {
              setCurrentTheme(t);
              triggerHaptic("light");
            }}
            className={`h-12 rounded-2xl transition-all flex items-center justify-center ${
              currentTheme === t ? "ring-2 ring-white scale-105" : "opacity-30"
            }`}
            style={{ backgroundColor: themes[t].primary }}
          >
            {currentTheme === t && <Check size={18} color="white" />}
          </button>
        ))}
      </div>

      {/* --- 🟢 NEW: PREFERENCES --- */}
      <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] ml-4 mb-4">
        Preferences
      </p>
      <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden mb-8">
        <SettingsItem icon={<Wallet size={16} />} label="Wallet" />
        <SettingsItem
          icon={<Bell size={16} />}
          label="Push Notification"
          isLast
        />
      </div>

      {/* --- 🟢 NEW: ACCOUNT --- */}
      <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] ml-4 mb-4">
        Account
      </p>
      <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden mb-8">
        <SettingsItem icon={<UserCheck size={16} />} label="Verification" />
        <SettingsItem
          icon={<FileText size={16} />}
          label="Account Details"
          isLast
        />
      </div>

      {/* --- 🟢 NEW: SECURITY --- */}
      <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] ml-4 mb-4">
        Security
      </p>
      <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden mb-8">
        <SettingsItem icon={<Key size={16} />} label="Export Private Key" />
        <SettingsItem
          icon={<Shield size={16} />}
          label="Two-Factor Auth"
          isLast
        />
      </div>

      {/* --- 🟢 NEW: LEGAL --- */}
      <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] ml-4 mb-4">
        Legal
      </p>
      <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden mb-8">
        <SettingsItem icon={<Info size={16} />} label="About Us" />
        <SettingsItem
          icon={<Scale size={16} />}
          label="Terms & Conditions"
          isLast
        />
      </div>

      {/* --- SESSION ACTIONS --- */}
      <div className="space-y-4">
        <button
          onClick={onLogout}
          className="w-full py-5 rounded-[32px] border border-white/5 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all hover:bg-white/5"
        >
          Terminate Session
        </button>

        <button className="w-full py-5 rounded-[32px] border border-red-500/10 text-[10px] font-black uppercase tracking-[0.4em] text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all">
          Delete Account
        </button>
      </div>
    </div>
  );
}

// 🟢 Helper Component for Menu Items (Add this below SettingsView)
function SettingsItem({ icon, label, isLast }) {
  return (
    <div
      className={`flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer group ${
        !isLast ? "border-b border-white/5" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="text-white/20 group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors tracking-tight">
          {label}
        </span>
      </div>
      <ChevronRight
        size={14}
        className="opacity-10 group-hover:opacity-100 text-white transition-all"
      />
    </div>
  );
}

// --- 9. SHARED HARDWARE COMPONENTS ---
function InteractiveCard({ theme, isFrozen, isGhost }) {
  const [flipped, setFlipped] = useState(false);
  const flip = useSpring(0, { stiffness: 260, damping: 20 });

  useEffect(() => {
    flip.set(flipped ? 180 : 0);
  }, [flipped]);

  return (
    <div
      className="perspective-[1200px] h-56 w-full cursor-pointer"
      onClick={() => {
        setFlipped(!flipped);
        triggerHaptic("medium");
      }}
    >
      <motion.div
        style={{ rotateY: flip, transformStyle: "preserve-3d" }}
        className="relative w-full h-full"
      >
        {/* FRONT - Dynamic Theme/Ghost Tier */}
        <div
          className={`absolute inset-0 rounded-[32px] p-8 border shadow-2xl backface-hidden flex flex-col justify-between transition-all duration-700 ${
            isGhost
              ? "bg-gradient-to-br from-zinc-900 via-black to-zinc-800 border-white/20"
              : `bg-gradient-to-br ${theme.gradient} border-white/20`
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Ghost Texture Overlay */}
          {isGhost && (
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          )}

          <div className="flex justify-between items-start relative z-10">
            {/* High-end Branding */}
            <span
              className={`font-serif italic text-3xl tracking-tighter ${
                isGhost ? "text-white" : "text-black"
              }`}
            >
              Verve
            </span>
            {/* The Chip */}
            <div
              className={`w-14 h-10 rounded-xl backdrop-blur-xl border ${
                isGhost
                  ? "bg-zinc-700/50 border-white/10"
                  : "bg-black/10 border-black/5"
              }`}
            />
          </div>

          <div className="mb-4 relative z-10">
            {/* Card Number - Changes based on score */}
            <p
              className={`font-mono text-xl tracking-[0.3em] ${
                isGhost ? "text-white" : "text-black/80"
              }`}
            >
              **** **** **** {isGhost ? "8888" : "8842"}
            </p>
          </div>

          <div className="flex justify-between items-end relative z-10">
            <p
              className={`text-xs font-serif italic tracking-[0.2em] uppercase ${
                isGhost ? "text-white/80" : "text-black"
              }`}
            >
              {isGhost ? "Diamond card" : "Alex Carter"}
            </p>
            <Eye
              size={20}
              className={
                isGhost ? "text-white opacity-40" : "text-black opacity-30"
              }
            />
          </div>
        </div>

        {/* BACK - Stays Dark/Minimalist */}
        <div
          className="absolute inset-0 rounded-[32px] bg-[#111] p-8 border border-white/10 shadow-2xl backface-hidden flex flex-col justify-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-[120%] h-12 bg-black/80 -mx-8 mb-8" />
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
            <div>
              <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                CVV Security
              </p>
              <p className="font-mono text-lg text-white">
                {isGhost ? "888" : "884"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                Expiry
              </p>
              <p className="font-mono text-lg text-white">12/28</p>
            </div>
          </div>
          <p className="mt-6 text-[7px] text-gray-600 uppercase font-bold leading-tight">
            Property of VervePay. Solana L2 Private Network. If found, return to
            nearest architect.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab, theme }) {
  const tabs = [
    { id: "home", icon: <Home /> },
    { id: "history", icon: <History /> },
    { id: "trading", icon: <CandlestickChart /> },
    { id: "credit", icon: <ShieldCheck /> },
    { id: "settings", icon: <Settings /> },
  ];
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex justify-around items-center shadow-2xl z-[100]">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            setActiveTab(t.id);
            triggerHaptic("light");
          }}
          className={`p-4 rounded-full transition-all duration-300 ${
            activeTab === t.id ? "scale-110 opacity-100" : "opacity-20"
          }`}
          style={{
            color: activeTab === t.id ? theme.primary : "#fff",
            backgroundColor:
              activeTab === t.id ? `${theme.primary}10` : "transparent",
          }}
        >
          {t.icon}
        </button>
      ))}
    </nav>
  );
}

// --- 10. REUSABLE MINI-COMPONENTS ---
const HistoryView = ({ theme }) => (
  <div className="pt-2">
    <h2 className="text-2xl font-black uppercase italic mb-8">History</h2>
    <div className="space-y-4">
      <TransactionItem
        theme={theme}
        name="Drafting Fees"
        price="+₦250,000"
        isIncome
      />
      <TransactionItem theme={theme} name="SOL/USDC Trade" price="-₦45,000" />
      <TransactionItem theme={theme} name="Office Rent" price="-₦120,000" />
    </div>
  </div>
);

const ActionCard = ({ icon, label, sub }) => (
  <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 hover:bg-white/10 transition-all cursor-pointer">
    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
      {icon}
    </div>
    <h4 className="text-sm font-black uppercase tracking-tighter">{label}</h4>
    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
      {sub}
    </p>
  </div>
);

// 🟢 HELPER 2: Capital Flow Chart
const SpendingChart = ({ theme }) => (
  <div className="bg-white/5 border border-white/10 rounded-[32px] p-6">
    <div className="flex justify-between items-center mb-8">
      <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">
        Capital Flow
      </p>
      <TrendingUp size={16} style={{ color: theme.primary }} />
    </div>
    <div className="h-20 flex items-end gap-1.5">
      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-lg transition-all"
          style={{
            height: `${h}%`,
            backgroundColor: theme.primary,
            opacity: i === 3 ? 1 : 0.2,
          }}
        />
      ))}
    </div>
  </div>
);

// 🟢 HELPER 3: Market Row with Fixed Sparkline
function TradeItem({
  symbol,
  name,
  price,
  change,
  theme,
  isDown,
  chartData,
  onSelect,
}) {
  return (
    <div
      onClick={() => {
        if (typeof triggerHaptic === "function") triggerHaptic("medium");
        onSelect();
      }}
      className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-[32px] hover:bg-white/10 transition-all cursor-pointer group active:scale-[0.98] overflow-hidden"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center font-black text-[9px] border border-white/10 text-white">
          {symbol}
        </div>
        <div className="w-20">
          <h4 className="text-xs font-bold text-white truncate">{name}</h4>
          <p className="text-[8px] text-gray-500 font-black tracking-widest">
            {symbol}/USDC
          </p>
        </div>
      </div>

      {/* 🟢 Sparkline Container with fixed vertical scaling */}
      <div className="flex-1 px-4 h-10 flex items-center overflow-hidden">
        <svg
          viewBox="0 0 100 40"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            /* 🟢 Changed 40-val to 32-(val*0.6) to keep line centered and safe from edges */
            d={`M ${chartData
              .map(
                (val, i) =>
                  `${(i * 100) / (chartData.length - 1)} ${32 - val * 0.6}`
              )
              .join(" L ")}`}
            fill="none"
            stroke={isDown ? "#f87171" : "#4ade80"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="text-right min-w-[70px]">
        <p className="text-xs font-bold text-white tracking-tighter">{price}</p>
        <p
          className={`text-[9px] font-black ${
            isDown ? "text-red-400" : "text-green-400"
          }`}
        >
          {change}
        </p>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS (CLEAN VERSION) ---

const TransactionItem = ({ theme, name, price, isIncome }) => {
  // We use a safe fallback color if theme isn't fully loaded
  const primaryColor = theme?.primary || "#6366f1";
  const glowColor = theme?.glow || "rgba(99, 102, 241, 0.5)";

  return (
    <div className="flex justify-between items-center p-6 bg-white/5 border border-white/10 rounded-[28px]">
      <div className="flex gap-4 items-center">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: primaryColor,
            boxShadow: `0 0 10px ${glowColor}`,
          }}
        />
        <span className="text-sm font-black uppercase tracking-tighter text-white">
          {name}
        </span>
      </div>
      <span
        className={`font-black ${isIncome ? "text-green-500" : "text-white"}`}
      >
        {price}
      </span>
    </div>
  );
};

const RadarScanner = () => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
      <motion.div
        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 border-2 border-indigo-500/30 rounded-full"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute w-full h-full rounded-full bg-gradient-to-tr from-transparent via-transparent to-indigo-500/20"
      />
      <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_15px_#6366f1]" />
    </div>
  );
};

const LaunchItem = ({ name, sym, cap, icon, riskScore, onSelect }) => {
  const riskColor =
    riskScore > 7
      ? "text-red-500"
      : riskScore > 4
      ? "text-yellow-500"
      : "text-green-500";

  return (
    <div
      onClick={onSelect}
      className="p-5 bg-white/[0.03] border border-white/5 rounded-[28px] flex justify-between items-center cursor-pointer transition-all hover:bg-white/10 active:scale-95"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
          {icon ? (
            <img src={icon} alt={sym} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-black text-white">{sym}</span>
          )}
        </div>
        <div>
          <h4 className="font-black text-white text-sm uppercase italic">
            {name}
          </h4>
          <p
            className={`text-[9px] font-black uppercase tracking-widest ${riskColor}`}
          >
            Risk: {riskScore}/10
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-black text-white">${cap}</p>
        <p className="text-[8px] text-gray-500 font-bold uppercase">Mkt Cap</p>
      </div>
    </div>
  );
};
