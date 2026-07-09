import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Layout } from '../components/Layout';
import { calculateDailyStrategy } from '../lib/strategyEngine';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export default function Analytics() {
  const { user, userProfile } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !userProfile) return;
      try {
        const q = query(
          collection(db, `users/${user.uid}/dailyProgress`),
          orderBy('day', 'asc')
        );
        const snapshot = await getDocs(q);
        const chartData: any[] = [];
        
        let cumulativeData = userProfile.startingCoins;
        
        // Generate ideal trajectory
        let idealCurrent = userProfile.startingCoins;
        
        // Add day 0 (start)
        chartData.push({
          day: 0,
          name: 'Start',
          balance: cumulativeData,
          ideal: idealCurrent,
          profit: 0
        });

        snapshot.forEach((doc) => {
          const dayData = doc.data();
          if (dayData.endBalance) {
            const idealStrategy = calculateDailyStrategy(idealCurrent, dayData.day, false);
            idealCurrent = idealStrategy.targetBalance;
            
            chartData.push({
              day: dayData.day,
              name: `D${dayData.day}`,
              balance: dayData.endBalance,
              ideal: idealCurrent,
              profit: dayData.endBalance - cumulativeData,
              status: dayData.status
            });
            cumulativeData = dayData.endBalance;
          }
        });

        setData(chartData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user, userProfile]);

  if (!userProfile || loading) {
    return <Layout><div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></Layout>;
  }

  const successDays = data.filter(d => d.status === 'completed').length;
  const lossDays = data.filter(d => d.status === 'loss').length;
  const currentBalance = data[data.length - 1]?.balance || userProfile.startingCoins;
  const totalProfit = currentBalance - userProfile.startingCoins;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-white/10 p-4 rounded-lg shadow-xl">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-muted-foreground capitalize">{entry.name}:</span>
              <span className="font-bold text-foreground">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Performance metrics and growth trajectory.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-foreground">
            {successDays + lossDays > 0 ? Math.round((successDays / (successDays + lossDays)) * 100) : 0}%
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-sm text-muted-foreground mb-1">Total Profit</div>
          <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-secondary' : 'text-destructive'}`}>
            {totalProfit > 0 ? '+' : ''}{totalProfit.toLocaleString()}
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-sm text-muted-foreground mb-1">Target Days Hit</div>
          <div className="text-2xl font-bold text-secondary">{successDays}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-sm text-muted-foreground mb-1">Stop Loss Hits</div>
          <div className="text-2xl font-bold text-destructive">{lossDays}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-foreground mb-6">Growth Trajectory</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={10000} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ position: 'top', value: 'Goal (10k)', fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <Line type="monotone" dataKey="ideal" name="Target" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="balance" name="Actual" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 6, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit/Loss Chart */}
        <div className="glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-foreground mb-6">Daily Profit/Loss</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.filter(d => d.day > 0)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                <Bar 
                  dataKey="profit" 
                  name="Profit"
                  radius={[4, 4, 4, 4]}
                >
                  {data.filter(d => d.day > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? 'hsl(var(--secondary))' : 'hsl(var(--destructive))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
