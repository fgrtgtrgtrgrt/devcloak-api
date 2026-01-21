import { useMemo } from "react";
import { useScriptAnalytics, Script } from "@/hooks/useScripts";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Users, CheckCircle, XCircle } from "lucide-react";

interface AnalyticsDashboardProps {
  scripts: Script[];
}

export function AnalyticsDashboard({ scripts }: AnalyticsDashboardProps) {
  // Get analytics for all scripts
  const allScriptIds = scripts.map(s => s.id);
  
  // Calculate overview stats
  const totalScripts = scripts.length;
  const activeScripts = scripts.filter(s => s.is_active).length;
  const keyProtected = scripts.filter(s => s.protection_mode === "key").length;
  const whitelistProtected = scripts.filter(s => s.protection_mode === "whitelist").length;

  // Mock data for charts (in a real app, aggregate from all script analytics)
  const executionTrends = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      executions: Math.floor(Math.random() * 100) + 20,
      successful: Math.floor(Math.random() * 80) + 15,
      failed: Math.floor(Math.random() * 20) + 2,
    }));
  }, []);

  const protectionDistribution = useMemo(() => [
    { name: 'Key System', value: keyProtected, color: 'hsl(280, 85%, 60%)' },
    { name: 'Whitelist', value: whitelistProtected, color: 'hsl(330, 85%, 60%)' },
    { name: 'Keyless', value: scripts.filter(s => s.protection_mode === "keyless").length, color: 'hsl(260, 50%, 50%)' },
  ], [keyProtected, whitelistProtected, scripts]);

  const hourlyActivity = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      activity: Math.floor(Math.random() * 50) + 5,
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalScripts}</p>
              <p className="text-xs text-muted-foreground">Total Scripts</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeScripts}</p>
              <p className="text-xs text-muted-foreground">Active Scripts</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{keyProtected}</p>
              <p className="text-xs text-muted-foreground">Key Protected</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">+24%</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Execution Trends */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Executions</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={executionTrends}>
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="successful" fill="hsl(280, 85%, 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="hsl(330, 85%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Protection Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Protection Modes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={protectionDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {protectionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {protectionDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">24-Hour Activity</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={hourlyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="hour" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10}
              interval={3}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="activity" 
              stroke="hsl(280, 85%, 60%)" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
