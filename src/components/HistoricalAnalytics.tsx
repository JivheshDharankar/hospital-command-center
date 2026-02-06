import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Calendar, RefreshCw, 
  Activity, Clock, AlertTriangle, Building2, Download, FileText
} from 'lucide-react';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import { SectionCard } from './SectionCard';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { generateAnalyticsPDF } from '@/services/pdfGenerator';
import { useRef } from 'react';

const TIME_RANGES = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 }
];

export default function HistoricalAnalytics() {
  const [selectedRange, setSelectedRange] = useState(30);
  const { data, loading, refetch, generateSnapshot } = useHistoricalData(selectedRange);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch(selectedRange);
    setIsRefreshing(false);
  };

  const handleGenerateSnapshot = async () => {
    setIsRefreshing(true);
    await generateSnapshot();
    setIsRefreshing(false);
  };

  // Calculate trends
  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];
  
  const occupancyTrend = latestData && previousData 
    ? Number(latestData.avg_occupancy) - Number(previousData.avg_occupancy)
    : 0;
  
  const patientTrend = latestData && previousData
    ? Number(latestData.total_patients) - Number(previousData.total_patients)
    : 0;

  // Format data for charts
  const chartData = data.map(d => ({
    date: new Date(d.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    occupancy: Number(d.avg_occupancy),
    patients: Number(d.total_patients),
    waitTime: d.avg_wait,
    alerts: Number(d.critical_events)
  }));

  const exportData = () => {
    const csv = [
      ['Date', 'Avg Occupancy (%)', 'Total Patients', 'Avg Wait (min)', 'Critical Events'],
      ...chartData.map(d => [d.date, d.occupancy, d.patients, d.waitTime, d.alerts])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${selectedRange}days.csv`;
    a.click();
  };

  const exportPDF = async () => {
    const snapshots = data.map(d => ({
      snapshot_date: d.snapshot_date,
      total_patients: Number(d.total_patients),
      avg_wait_minutes: Number(d.avg_wait),
      occupancy_rate: Number(d.avg_occupancy),
      critical_events: Number(d.critical_events)
    }));
    await generateAnalyticsPDF(snapshots, chartContainerRef.current || undefined);
  };

  if (loading) {
    return (
      <SectionCard
        title="Historical Analytics"
        subtitle="Loading analytics data..."
        icon={<TrendingUp className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      id="historical-analytics"
      title="Historical Analytics"
      subtitle="Track trends and patterns over time"
      icon={<TrendingUp className="w-6 h-6" />}
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {TIME_RANGES.map(range => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedRange(range.value);
                refetch(range.value);
              }}
            >
              <Calendar className="w-4 h-4 mr-1" />
              {range.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateSnapshot} disabled={isRefreshing}>
            <Activity className="w-4 h-4 mr-1" />
            Generate Snapshot
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("w-4 h-4 mr-1", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <FileText className="w-4 h-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-premium p-4 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Occupancy</p>
              <p className="text-2xl font-bold">{latestData?.avg_occupancy || 0}%</p>
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm",
              occupancyTrend >= 0 ? "text-destructive" : "text-emerald-500"
            )}>
              {occupancyTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(occupancyTrend).toFixed(1)}%
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-premium p-4 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold">{latestData?.total_patients || 0}</p>
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm",
              patientTrend >= 0 ? "text-primary" : "text-muted-foreground"
            )}>
              {patientTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(patientTrend)}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-premium p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Wait Time</p>
              <p className="text-2xl font-bold">{latestData?.avg_wait || 0} min</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-premium p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Critical Events</p>
              <p className="text-2xl font-bold">{latestData?.critical_events || 0}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div ref={chartContainerRef}>
        <Tabs defaultValue="occupancy" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="waitTime">Wait Time</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="occupancy" className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="occupancy" 
                stroke="hsl(var(--primary))" 
                fill="url(#occupancyGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="patients" className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="patients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="waitTime" className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit=" min" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="waitTime" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--secondary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="alerts" className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="alerts" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No historical data available yet.</p>
          <p className="text-sm">Click "Generate Snapshot" to start tracking.</p>
        </div>
      )}
    </SectionCard>
  );
}
