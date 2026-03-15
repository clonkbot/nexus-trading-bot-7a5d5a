import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Trade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  profit: number;
  timestamp: Date;
}

interface BotStats {
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  activePositions: number;
  uptime: string;
}

// Generate random trade data
const generateTrade = (): Trade => {
  const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ARB/USDT', 'MATIC/USDT', 'AVAX/USDT'];
  const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
  const profit = (Math.random() - 0.4) * 500;
  return {
    id: Math.random().toString(36).substr(2, 9),
    pair: pairs[Math.floor(Math.random() * pairs.length)],
    type,
    price: Math.random() * 50000 + 100,
    amount: Math.random() * 2 + 0.01,
    profit,
    timestamp: new Date(),
  };
};

// Animated pulse component
const PulseWave = ({ isActive }: { isActive: boolean }) => {
  const [points, setPoints] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setPoints(prev => {
        const newPoint = Math.sin(Date.now() / 200) * 30 + Math.random() * 20;
        const updated = [...prev, newPoint].slice(-50);
        return updated;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isActive]);

  const pathData = points.length > 1
    ? `M 0,50 ${points.map((p, i) => `L ${i * 8},${50 - p}`).join(' ')}`
    : 'M 0,50 L 0,50';

  return (
    <svg className="w-full h-24" viewBox="0 0 400 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ffcc" stopOpacity="0" />
          <stop offset="50%" stopColor="#00ffcc" stopOpacity="1" />
          <stop offset="100%" stopColor="#00ffcc" stopOpacity="0.3" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={pathData}
        fill="none"
        stroke="url(#pulseGradient)"
        strokeWidth="2"
        filter="url(#glow)"
        className="transition-all"
      />
      {isActive && (
        <circle
          cx={points.length * 8}
          cy={50 - (points[points.length - 1] || 0)}
          r="4"
          fill="#00ffcc"
          filter="url(#glow)"
        />
      )}
    </svg>
  );
};

// Status indicator
const StatusIndicator = ({ active }: { active: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={`relative w-3 h-3 rounded-full ${active ? 'bg-[#39ff14]' : 'bg-[#ff3366]'}`}>
      {active && (
        <motion.div
          className="absolute inset-0 rounded-full bg-[#39ff14]"
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
    <span className={`text-xs font-mono uppercase tracking-widest ${active ? 'text-[#39ff14]' : 'text-[#ff3366]'}`}>
      {active ? 'ACTIVE' : 'OFFLINE'}
    </span>
  </div>
);

// Trade row component
const TradeRow = ({ trade, index }: { trade: Trade; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ delay: index * 0.05 }}
    className="grid grid-cols-5 gap-2 md:gap-4 py-2 md:py-3 px-2 md:px-4 border-b border-[#1a1a2e] hover:bg-[#0f0f1a] transition-colors font-mono text-xs md:text-sm"
  >
    <div className="text-[#00ffcc] truncate">{trade.pair}</div>
    <div className={trade.type === 'BUY' ? 'text-[#39ff14]' : 'text-[#ff3366]'}>
      {trade.type}
    </div>
    <div className="text-gray-400 hidden md:block">${trade.price.toFixed(2)}</div>
    <div className="text-gray-300 hidden md:block">{trade.amount.toFixed(4)}</div>
    <div className={`text-right col-span-3 md:col-span-1 ${trade.profit >= 0 ? 'text-[#39ff14]' : 'text-[#ff3366]'}`}>
      {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)} USDT
    </div>
  </motion.div>
);

// Stat card component
const StatCard = ({ label, value, prefix = '', suffix = '', color = 'cyan' }: {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  color?: 'cyan' | 'green' | 'amber' | 'red';
}) => {
  const colorMap = {
    cyan: 'text-[#00ffcc] border-[#00ffcc]/30',
    green: 'text-[#39ff14] border-[#39ff14]/30',
    amber: 'text-[#ffb800] border-[#ffb800]/30',
    red: 'text-[#ff3366] border-[#ff3366]/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#0a0a0f] border ${colorMap[color]} p-3 md:p-4 relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
      <div className="relative">
        <div className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-1 md:mb-2 font-mono">{label}</div>
        <div className={`text-xl md:text-2xl lg:text-3xl font-mono font-bold ${colorMap[color].split(' ')[0]}`}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
      </div>
    </motion.div>
  );
};

// Strategy selector
const StrategyButton = ({ name, active, onClick }: { name: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-3 md:px-4 py-2 md:py-3 font-mono text-xs uppercase tracking-wider transition-all min-h-[44px] ${
      active
        ? 'bg-[#00ffcc] text-black'
        : 'bg-transparent border border-[#1a1a2e] text-gray-400 hover:border-[#00ffcc] hover:text-[#00ffcc]'
    }`}
  >
    {name}
  </button>
);

export default function App() {
  const [botActive, setBotActive] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategy, setStrategy] = useState('GRID');
  const [stats, setStats] = useState<BotStats>({
    totalTrades: 1847,
    winRate: 67.3,
    totalProfit: 12847.52,
    activePositions: 4,
    uptime: '14d 7h 23m',
  });

  // Simulate incoming trades
  useEffect(() => {
    if (!botActive) return;
    const interval = setInterval(() => {
      const newTrade = generateTrade();
      setTrades(prev => [newTrade, ...prev].slice(0, 15));
      setStats(prev => ({
        ...prev,
        totalTrades: prev.totalTrades + 1,
        totalProfit: prev.totalProfit + newTrade.profit,
        winRate: Math.min(99, Math.max(40, prev.winRate + (Math.random() - 0.5) * 0.5)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [botActive]);

  // Initialize with some trades
  useEffect(() => {
    const initialTrades = Array.from({ length: 8 }, generateTrade);
    setTrades(initialTrades);
  }, []);

  const toggleBot = useCallback(() => {
    setBotActive(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-[#05050a] text-white relative overflow-x-hidden">
      {/* Scan line overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,204,0.03) 2px, rgba(0,255,204,0.03) 4px)',
        }}
      />

      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,204,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,204,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-20">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8"
        >
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-mono font-bold tracking-tight">
                <span className="text-[#00ffcc]">[</span>
                NEXUS
                <span className="text-[#00ffcc]">]</span>
              </h1>
              <div className="text-[10px] md:text-xs text-gray-500 font-mono tracking-[0.3em] mt-1">TRADING_PROTOCOL_v3.2</div>
            </div>
            <StatusIndicator active={botActive} />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleBot}
            className={`px-6 md:px-8 py-3 md:py-4 font-mono text-xs md:text-sm uppercase tracking-widest transition-all relative overflow-hidden min-h-[48px] ${
              botActive
                ? 'bg-[#ff3366] text-white hover:bg-[#ff4477]'
                : 'bg-[#39ff14] text-black hover:bg-[#4aff25]'
            }`}
          >
            <span className="relative z-10">{botActive ? '[ TERMINATE ]' : '[ INITIATE ]'}</span>
          </motion.button>
        </motion.header>

        {/* Pulse Visualizer */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 md:mb-8 bg-[#0a0a0f] border border-[#1a1a2e] p-4 md:p-6 relative overflow-hidden"
        >
          <div className="absolute top-4 left-4 md:top-6 md:left-6 text-[10px] md:text-xs font-mono text-gray-500 tracking-widest">
            SYSTEM_PULSE
          </div>
          <PulseWave isActive={botActive} />
          {!botActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="font-mono text-[#ff3366] text-sm md:text-lg tracking-widest animate-pulse">
                [ SYSTEM OFFLINE ]
              </span>
            </div>
          )}
        </motion.section>

        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8"
        >
          <StatCard label="Total Trades" value={stats.totalTrades} color="cyan" />
          <StatCard label="Win Rate" value={stats.winRate.toFixed(1)} suffix="%" color="green" />
          <StatCard
            label="Total P/L"
            value={stats.totalProfit.toFixed(2)}
            prefix="$"
            color={stats.totalProfit >= 0 ? 'green' : 'red'}
          />
          <StatCard label="Active Pos." value={stats.activePositions} color="amber" />
          <StatCard label="Uptime" value={stats.uptime} color="cyan" />
        </motion.section>

        {/* Strategy Selection */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 md:mb-8"
        >
          <div className="text-[10px] md:text-xs font-mono text-gray-500 tracking-widest mb-3 md:mb-4">SELECT_STRATEGY</div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {['GRID', 'DCA', 'SCALP', 'MOMENTUM', 'ARB'].map(s => (
              <StrategyButton key={s} name={s} active={strategy === s} onClick={() => setStrategy(s)} />
            ))}
          </div>
        </motion.section>

        {/* Trade Feed */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0a0a0f] border border-[#1a1a2e]"
        >
          <div className="border-b border-[#1a1a2e] p-3 md:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[10px] md:text-xs font-mono text-gray-500 tracking-widest">TRADE_FEED</div>
              <motion.div
                animate={{ opacity: botActive ? [0.5, 1] : 0.3 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                className="w-2 h-2 rounded-full bg-[#00ffcc]"
              />
            </div>
            <div className="text-[10px] md:text-xs font-mono text-gray-600">
              {strategy}_PROTOCOL
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-5 gap-2 md:gap-4 py-2 md:py-3 px-2 md:px-4 border-b border-[#1a1a2e] text-[10px] md:text-xs font-mono text-gray-600 uppercase tracking-wider">
            <div>Pair</div>
            <div>Type</div>
            <div className="hidden md:block">Price</div>
            <div className="hidden md:block">Amount</div>
            <div className="text-right col-span-3 md:col-span-1">P/L</div>
          </div>

          {/* Trade Rows */}
          <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {trades.map((trade, i) => (
                <TradeRow key={trade.id} trade={trade} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {trades.length === 0 && (
            <div className="p-8 md:p-12 text-center font-mono text-gray-600 text-sm">
              [ NO TRADES RECORDED ]
            </div>
          )}
        </motion.section>

        {/* Console Output */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 md:mt-8 bg-[#0a0a0f] border border-[#1a1a2e] p-3 md:p-4"
        >
          <div className="text-[10px] md:text-xs font-mono text-gray-500 tracking-widest mb-2 md:mb-3">SYSTEM_LOG</div>
          <div className="font-mono text-[10px] md:text-xs text-gray-600 space-y-1">
            <div className="flex gap-2 md:gap-4 flex-wrap">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-[#00ffcc]">INFO</span>
              <span>Strategy {strategy} initialized successfully</span>
            </div>
            <div className="flex gap-2 md:gap-4 flex-wrap">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-[#ffb800]">WARN</span>
              <span>Market volatility detected - adjusting parameters</span>
            </div>
            <div className="flex gap-2 md:gap-4 flex-wrap">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-[#39ff14]">EXEC</span>
              <span>Order engine ready - {stats.activePositions} positions active</span>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4 text-center">
        <p className="text-[10px] md:text-xs font-mono text-gray-600 tracking-wider">
          Requested by <span className="text-gray-500">@rng_rn</span> · Built by <span className="text-gray-500">@clonkbot</span>
        </p>
      </footer>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0a0f;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a1a2e;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00ffcc;
        }
      `}</style>
    </div>
  );
}
