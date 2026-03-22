import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { analyticsAPI } from '../services/api';
import useTransactions from '../hooks/useTransactions';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#64748b'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  
  const title = label || payload[0].name || payload[0].payload?.name;
  
  return (
    <div className="glass-card p-3 shadow-xl border-dark-600/50">
      <p className="text-sm font-medium text-white mb-1">{title}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm font-semibold capitalize" style={{ color: entry.color || '#818cf8' }}>
          {entry.name !== title ? `${entry.name}: ` : ''}₹{entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const { transactions, loading } = useTransactions();
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, m] = await Promise.all([analyticsAPI.getCategoryBreakdown(), analyticsAPI.getMonthlyTrend()]);
        setCategoryData(c.data);
        setMonthlyData(m.data);
      } catch {
        const cats = {};
        transactions.filter(t => t.type === 'expense').forEach(t => { cats[t.category] = (cats[t.category]||0) + t.amount; });
        setCategoryData(Object.entries(cats).map(([name,value]) => ({name,value})).sort((a,b) => b.value - a.value));
        const mo = {};
        const mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        transactions.forEach(t => { const m = t.date?.substring(0,7); if(!m) return; if(!mo[m]) mo[m]={income:0,expense:0}; if(t.type==='income') mo[m].income+=t.amount; else mo[m].expense+=t.amount; });
        setMonthlyData(Object.entries(mo).sort().map(([k,v]) => ({name: mNames[parseInt(k.split('-')[1])-1]+' '+k.split('-')[0], income:v.income, expense:v.expense})));
      }
      setReady(true);
    };
    if(transactions.length > 0 || !loading) load();
  }, [transactions, loading]);

  const total = categoryData.reduce((s,i) => s+i.value, 0);

  if(loading || !ready) return (<div className="space-y-6 animate-fade-in"><div><h1 className="text-2xl lg:text-3xl font-bold text-white">Analytics</h1><p className="text-dark-400 mt-1">Visualize your spending</p></div><LoadingSpinner size="lg" text="Loading..." /></div>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Analytics</h1><p className="text-dark-400 mt-1">Visualize your spending patterns</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-6">Expense by Category</h2>
          {categoryData.length === 0 ? <p className="text-center py-12 text-dark-400">No data</p> : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={3} dataKey="value" stroke="none">
                  {categoryData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie><Tooltip content={<ChartTooltip />} /></PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full mt-4">
                {categoryData.map((item,i) => (
                  <div key={item.name} className="flex items-center gap-2 px-2 py-1">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor:COLORS[i%COLORS.length]}} />
                    <span className="text-xs text-dark-300 truncate">{item.name}</span>
                    <span className="text-xs text-dark-500 ml-auto">{total>0?((item.value/total)*100).toFixed(0):0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-6">Monthly Overview</h2>
          {monthlyData.length === 0 ? <p className="text-center py-12 text-dark-400">No data</p> : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" tick={{fill:'#94a3b8',fontSize:12}} axisLine={{stroke:'#334155'}} tickLine={false} />
                <YAxis tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{paddingTop:20}} formatter={v => <span className="text-sm text-dark-300 capitalize">{v}</span>} />
                <Bar dataKey="income" fill="#10b981" radius={[6,6,0,0]} maxBarSize={40} />
                <Bar dataKey="expense" fill="#ef4444" radius={[6,6,0,0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Category Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-dark-700/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">Category</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">Amount</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">%</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase hidden sm:table-cell">Bar</th>
            </tr></thead>
            <tbody className="divide-y divide-dark-700/30">
              {categoryData.map((item,i) => (
                <tr key={item.name} className="hover:bg-dark-700/20 transition-colors">
                  <td className="py-3 px-4"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:COLORS[i%COLORS.length]}} /><span className="text-sm text-dark-200">{item.name}</span></div></td>
                  <td className="text-right py-3 px-4 text-sm font-medium text-white">₹{item.value?.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 text-sm text-dark-400">{total>0?((item.value/total)*100).toFixed(1):0}%</td>
                  <td className="py-3 px-4 hidden sm:table-cell"><div className="w-full bg-dark-700/30 rounded-full h-2"><div className="h-2 rounded-full" style={{width:`${total>0?(item.value/total)*100:0}%`,backgroundColor:COLORS[i%COLORS.length]}} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
