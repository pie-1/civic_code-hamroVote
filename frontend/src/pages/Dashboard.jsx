import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import Navbar from '../components/common/Navbar';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend, ArcElement, PointElement, LineElement
);

const metrics = {
  totalBudget: '21.24 Trillion',
  actionPlanTotal: 100,
  actionPlanComplete: 29,
  actionPlanOngoing: 66,
  actionPlanDelayed: 4,
  manifestoTotal: 250,
  manifestoComplete: 2,
  manifestoPartial: 12,
  manifestoIncomplete: 236,
};

const budgetHighlights = [
  { label: 'Income Tax Exemption', value: 1 },
  { label: 'Max Tax Rate', value: 29 },
  { label: 'Salary Increase', value: 21 },
  { label: 'Excise Scrapped', value: 36 },
  { label: 'Health Insurance', value: 90 },
];

const partyData = [
  { name: 'Nepali Congress', short: 'NC', bills: 12, budget: 34, promises: 18, color: '#3B82F6' },
  { name: 'CPN-UML', short: 'UML', bills: 10, budget: 28, promises: 15, color: '#EF4444' },
  { name: 'CPN-Maoist Centre', short: 'Maoist', bills: 6, budget: 20, promises: 10, color: '#F97316' },
  { name: 'Rastriya Swatantra Party', short: 'RSP', bills: 8, budget: 15, promises: 12, color: '#A855F7' },
];

// Chart theme — dark glass
const GRID_COLOR = 'rgba(255,255,255,0.05)';
const TICK_COLOR = 'rgba(255,255,255,0.35)';
const TOOLTIP = {
  backgroundColor: 'rgba(5,10,30,0.95)',
  titleColor: 'rgba(255,255,255,0.9)',
  bodyColor: 'rgba(255,255,255,0.6)',
  borderColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  padding: 12,
  cornerRadius: 10,
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      ...TOOLTIP,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct = ((ctx.parsed / total) * 100).toFixed(1);
          return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
        },
      },
    },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: TICK_COLOR,
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
        font: { size: 12 },
      },
    },
    tooltip: TOOLTIP,
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: GRID_COLOR },
      ticks: { color: TICK_COLOR, font: { size: 11 } },
      border: { color: 'transparent' },
    },
    x: {
      grid: { display: false },
      ticks: { color: TICK_COLOR, font: { size: 11 } },
      border: { color: 'transparent' },
    },
  },
};

const budgetBarOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: TOOLTIP,
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: GRID_COLOR },
      ticks: { color: TICK_COLOR, font: { size: 11 } },
      border: { color: 'transparent' },
    },
    y: {
      grid: { display: false },
      ticks: { color: TICK_COLOR, font: { size: 11 } },
      border: { color: 'transparent' },
    },
  },
};

// Card component
const GlassCard = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl p-6 ${className}`}
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)',
    }}
  >
    {children}
  </div>
);

// Metric card
const MetricCard = ({ label, value, sub, accent }) => (
  <GlassCard className="flex flex-col gap-1 hover:border-white/14 transition-all duration-200">
    <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
      {label}
    </p>
    <p className="text-2xl font-black text-white mt-1">{value}</p>
    <p className="text-xs mt-0.5" style={{ color: accent || 'rgba(255,255,255,0.3)' }}>{sub}</p>
  </GlassCard>
);

// Progress bar
const ProgressBar = ({ label, value, max, color }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs w-16 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-xs w-8 text-right font-medium text-white/60">{pct}%</p>
    </div>
  );
};

// Dot legend item
const LegendDot = ({ color, label, value }) => (
  <div className="flex items-center gap-2">
    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
    <span className="text-xs font-semibold text-white ml-auto">{value}</span>
  </div>
);

const Dashboard = () => {
  const actionPlanData = {
    labels: ['Complete', 'Ongoing', 'Delayed'],
    datasets: [{
      data: [metrics.actionPlanComplete, metrics.actionPlanOngoing, metrics.actionPlanDelayed],
      backgroundColor: ['rgba(34,197,94,0.85)', 'rgba(59,130,246,0.85)', 'rgba(245,158,11,0.85)'],
      borderColor: ['#16A34A', '#2563EB', '#D97706'],
      borderWidth: 1.5,
      hoverOffset: 6,
    }],
  };

  const manifestoData = {
    labels: ['Complete', 'Partial', 'Incomplete'],
    datasets: [{
      data: [metrics.manifestoComplete, metrics.manifestoPartial, metrics.manifestoIncomplete],
      backgroundColor: ['rgba(34,197,94,0.85)', 'rgba(245,158,11,0.85)', 'rgba(239,68,68,0.85)'],
      borderColor: ['#16A34A', '#D97706', '#DC2626'],
      borderWidth: 1.5,
      hoverOffset: 6,
      cutout: '68%',
    }],
  };

  const partyChartData = {
    labels: partyData.map((p) => p.short),
    datasets: [
      {
        label: 'Bills Passed',
        data: partyData.map((p) => p.bills),
        backgroundColor: 'rgba(59,130,246,0.75)',
        borderColor: '#3B82F6',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Budget (Cr)',
        data: partyData.map((p) => p.budget),
        backgroundColor: 'rgba(34,197,94,0.75)',
        borderColor: '#22C55E',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Promises Kept',
        data: partyData.map((p) => p.promises),
        backgroundColor: 'rgba(168,85,247,0.75)',
        borderColor: '#A855F7',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const budgetChartData = {
    labels: budgetHighlights.map((i) => i.label),
    datasets: [{
      data: budgetHighlights.map((i) => i.value),
      backgroundColor: [
        'rgba(59,130,246,0.75)',
        'rgba(34,197,94,0.75)',
        'rgba(245,158,11,0.75)',
        'rgba(239,68,68,0.75)',
        'rgba(168,85,247,0.75)',
      ],
      borderColor: ['#3B82F6','#22C55E','#F59E0B','#EF4444','#A855F7'],
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #020818 0%, #050d1a 50%, #040a16 100%)' }}
    >
      <Navbar />

      {/* Top accent line — same as navbar */}
      <div className="fixed top-20 inset-x-0 h-px z-40" style={{ background: 'rgba(255,255,255,0.04)' }} />

      <div className="pt-28 pb-16 px-4 md:px-8 lg:px-12 xl:px-20">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase mb-4" style={{ color: 'rgba(147,197,253,0.7)' }}>
              <span className="w-4 h-px bg-blue-400/60" />
              Government Tracker
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Accountability Dashboard
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Independent tracking of government action plans and budget commitments
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Total Budget"
              value="21.24T"
              sub="NPR · FY 2081/82"
              accent="rgba(96,165,250,0.7)"
            />
            <MetricCard
              label="Action Plan"
              value={`${metrics.actionPlanComplete}/${metrics.actionPlanTotal}`}
              sub="Points complete"
              accent="rgba(34,197,94,0.7)"
            />
            <MetricCard
              label="Manifesto"
              value={`${metrics.manifestoComplete}/${metrics.manifestoTotal}`}
              sub="Promises fulfilled"
              accent="rgba(168,85,247,0.7)"
            />
            <MetricCard
              label="Health Coverage"
              value="90%"
              sub="Insurance target"
              accent="rgba(245,158,11,0.7)"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

            {/* Action Plan */}
            <GlassCard>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Action Plan</p>
                  <h3 className="text-base font-bold text-white">100-Point Progress</h3>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{ background: 'rgba(34,197,94,0.12)', color: 'rgba(134,239,172,0.9)', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  {metrics.actionPlanComplete}% done
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-48 w-48 flex-shrink-0">
                  <Pie data={actionPlanData} options={pieOptions} />
                </div>
                <div className="flex-1 space-y-3.5">
                  <LegendDot color="#22C55E" label="Complete" value={metrics.actionPlanComplete} />
                  <LegendDot color="#3B82F6" label="Ongoing" value={metrics.actionPlanOngoing} />
                  <LegendDot color="#F59E0B" label="Delayed" value={metrics.actionPlanDelayed} />
                  <div className="mt-4 pt-4 space-y-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <ProgressBar label="Complete" value={metrics.actionPlanComplete} max={metrics.actionPlanTotal} color="#22C55E" />
                    <ProgressBar label="Ongoing" value={metrics.actionPlanOngoing} max={metrics.actionPlanTotal} color="#3B82F6" />
                    <ProgressBar label="Delayed" value={metrics.actionPlanDelayed} max={metrics.actionPlanTotal} color="#F59E0B" />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Manifesto */}
            <GlassCard>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Manifesto</p>
                  <h3 className="text-base font-bold text-white">Promise Tracker</h3>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{ background: 'rgba(239,68,68,0.12)', color: 'rgba(252,165,165,0.9)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {metrics.manifestoIncomplete} pending
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-48 w-48 flex-shrink-0 relative">
                  <Doughnut data={manifestoData} options={pieOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xl font-black text-white">{metrics.manifestoTotal}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>total</p>
                  </div>
                </div>
                <div className="flex-1 space-y-3.5">
                  <LegendDot color="#22C55E" label="Complete" value={metrics.manifestoComplete} />
                  <LegendDot color="#F59E0B" label="Partial" value={metrics.manifestoPartial} />
                  <LegendDot color="#EF4444" label="Incomplete" value={metrics.manifestoIncomplete} />
                  <div className="mt-4 pt-4 space-y-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <ProgressBar label="Complete" value={metrics.manifestoComplete} max={metrics.manifestoTotal} color="#22C55E" />
                    <ProgressBar label="Partial" value={metrics.manifestoPartial} max={metrics.manifestoTotal} color="#F59E0B" />
                    <ProgressBar label="Incomplete" value={metrics.manifestoIncomplete} max={metrics.manifestoTotal} color="#EF4444" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <GlassCard>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Comparative</p>
              <h3 className="text-base font-bold text-white mb-5">Party Performance</h3>
              <div className="h-64">
                <Bar data={partyChartData} options={barOptions} />
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>FY 2081/82</p>
              <h3 className="text-base font-bold text-white mb-5">Budget Highlights</h3>
              <div className="h-64">
                <Bar data={budgetChartData} options={budgetBarOptions} />
              </div>
            </GlassCard>
          </div>

          {/* Party Table */}
          <GlassCard>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Breakdown</p>
            <h3 className="text-base font-bold text-white mb-5">Party-wise Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Party', 'Bills Passed', 'Budget Utilized (Cr)', 'Promises Kept'].map((h, i) => (
                      <th
                        key={h}
                        className={`py-3 px-4 text-xs font-semibold uppercase tracking-widest ${i === 0 ? 'text-left' : 'text-right'}`}
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partyData.map((party, idx) => (
                    <tr
                      key={party.name}
                      className="transition-all duration-150"
                      style={{ borderBottom: idx < partyData.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: party.color }} />
                          <span className="font-medium text-white/80">{party.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 font-semibold text-white">{party.bills}</td>
                      <td className="text-right py-4 px-4 font-semibold text-white">Rs.{party.budget}Cr</td>
                      <td className="text-right py-4 px-4">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'rgba(59,130,246,0.12)', color: 'rgba(147,197,253,0.9)', border: '1px solid rgba(59,130,246,0.18)' }}
                        >
                          {party.promises}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;