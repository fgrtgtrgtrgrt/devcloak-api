import { CheckCircle, XCircle, Globe, Activity } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useScriptAnalytics } from "@/hooks/useScripts";

interface AnalyticsPanelProps {
  scriptId: string;
}

export function AnalyticsPanel({ scriptId }: AnalyticsPanelProps) {
  const { executions, stats, loading } = useScriptAnalytics(scriptId);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Analytics Overview
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
            <div className="text-2xl font-bold text-foreground">{stats.totalExecutions}</div>
            <div className="text-sm text-muted-foreground">Total Executions</div>
          </div>
          <div className="p-4 rounded-lg bg-success/10 border border-success/30">
            <div className="text-2xl font-bold text-success">{stats.successfulExecutions}</div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <div className="text-2xl font-bold text-destructive">{stats.failedExecutions}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="text-2xl font-bold text-primary">{stats.uniqueIPs}</div>
            <div className="text-sm text-muted-foreground">Unique IPs</div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-foreground mb-4">Recent Executions</h3>

        {executions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No executions recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>HWID</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions.slice(0, 20).map((exec) => (
                  <TableRow key={exec.id}>
                    <TableCell>
                      {exec.success ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {exec.executor_ip || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {exec.executor_hwid?.substring(0, 12) || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(exec.executed_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-destructive">
                      {exec.error_message || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
