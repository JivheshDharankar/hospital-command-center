import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { SectionCard } from './SectionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Building2,
  Bed,
  Users,
  AlertTriangle,
  RefreshCw,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface HospitalAnalytics {
  totalHospitals: number;
  averageOccupancy: number;
  criticalCount: number;
  busyCount: number;
  normalCount: number;
  totalBeds: number;
  availableBeds: number;
  totalDoctors: number;
  recentUpdates: number;
  activeAlerts: number;
  byType: Record<string, number>;
  topCritical: Array<{ name: string; occupancy: number }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

const chartConfig = {
  government: { label: 'Government', color: 'hsl(var(--primary))' },
  private: { label: 'Private', color: 'hsl(var(--chart-2))' },
  trust: { label: 'Trust', color: 'hsl(var(--chart-3))' },
  occupancy: { label: 'Occupancy', color: 'hsl(var(--primary))' },
};

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<HospitalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke<HospitalAnalytics>('hospital-analytics');
      
      if (error) throw error;
      if (data) {
        setAnalytics(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchAnalytics(), 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const pieData = analytics
    ? Object.entries(analytics.byType).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  const barData = analytics?.topCritical || [];

  if (loading) {
    return (
      <SectionCard
        title="Analytics Dashboard"
        subtitle="Real-time hospital network statistics"
        icon={<BarChart3 className="w-6 h-6 text-primary-foreground" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </SectionCard>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      label: 'Total Hospitals',
      value: analytics.totalHospitals,
      Icon: Building2,
      color: 'text-primary',
    },
    {
      label: 'Total Beds',
      value: analytics.totalBeds.toLocaleString(),
      Icon: Bed,
      color: 'text-blue-500',
    },
    {
      label: 'Available Beds',
      value: analytics.availableBeds.toLocaleString(),
      Icon: Activity,
      color: 'text-green-500',
    },
    {
      label: 'Active Alerts',
      value: analytics.activeAlerts,
      Icon: AlertTriangle,
      color: 'text-destructive',
    },
  ];

  return (
    <SectionCard
      title="Analytics Dashboard"
      subtitle="Real-time hospital network statistics"
      icon={<BarChart3 className="w-6 h-6 text-primary-foreground" />}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="w-3 h-3" />
            Live
          </Badge>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.Icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Occupancy Overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-green-500/10 border border-green-500/30"
        >
          <p className="text-sm text-muted-foreground mb-1">Normal</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {analytics.normalCount}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
        >
          <p className="text-sm text-muted-foreground mb-1">Busy</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {analytics.busyCount}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-destructive/10 border border-destructive/30"
        >
          <p className="text-sm text-muted-foreground mb-1">Critical</p>
          <p className="text-2xl font-bold text-destructive">
            {analytics.criticalCount}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart - Hospitals by Type */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-xl bg-card/50 border border-border/50"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Hospitals by Type
          </h3>
          <ChartContainer config={chartConfig} className="h-48">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </motion.div>

        {/* Bar Chart - Top Critical Hospitals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-xl bg-card/50 border border-border/50"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Highest Occupancy
          </h3>
          <ChartContainer config={chartConfig} className="h-48">
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <Bar
                dataKey="occupancy"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
                label={{ position: 'right', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </motion.div>
      </div>

      {/* Average Occupancy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Network Average Occupancy</p>
            <p className="text-4xl font-bold">{analytics.averageOccupancy.toFixed(1)}%</p>
          </div>
          <div className="p-4 rounded-full bg-primary/20">
            <Activity className="w-8 h-8 text-primary" />
          </div>
        </div>
      </motion.div>
    </SectionCard>
  );
}
