import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Activity, Cpu, RefreshCw, Search, RotateCcw } from "lucide-react";
import { useScriptAnalytics, useScriptKeys } from "@/hooks/useScripts";

interface ExecutionLogsProps {
  scriptId: string;
}

export function ExecutionLogs({ scriptId }: ExecutionLogsProps) {
  const { executions, stats, loading, fetchAnalytics } = useScriptAnalytics(scriptId);
  const { keys, resetHwid } = useScriptKeys(scriptId);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExecutions = executions.filter((exec) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      exec.executor_ip?.toLowerCase().includes(search) ||
      exec.executor_hwid?.toLowerCase().includes(search) ||
      exec.error_message?.toLowerCase().includes(search)
    );
  });

  // Get unique HWIDs from executions
  const uniqueHwids = Array.from(
    new Map(
      executions
        .filter((e) => e.executor_hwid)
        .map((e) => [e.executor_hwid, e])
    ).values()
  );

  // Get keys with locked HWIDs
  const lockedKeys = keys.filter((k) => k.hwid_locked);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Analytics Overview
          </h3>
          <Button variant="outline" size="sm" onClick={() => fetchAnalytics()}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

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

      {/* Logs Tabs */}
      <Tabs defaultValue="executions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="executions">Execution Logs</TabsTrigger>
          <TabsTrigger value="hwid">HWID Logs</TabsTrigger>
          <TabsTrigger value="locked">Locked HWIDs</TabsTrigger>
        </TabsList>

        <TabsContent value="executions" className="mt-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by IP, HWID, or error..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {filteredExecutions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No execution logs found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>HWID</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExecutions.slice(0, 50).map((exec) => (
                      <TableRow key={exec.id}>
                        <TableCell>
                          {exec.success ? (
                            <span className="flex items-center gap-1 text-success text-xs">
                              <CheckCircle className="w-4 h-4" /> Success
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-destructive text-xs">
                              <XCircle className="w-4 h-4" /> Failed
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{exec.executor_ip || "-"}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {exec.executor_hwid?.substring(0, 16) || "-"}
                          {exec.executor_hwid && exec.executor_hwid.length > 16 && "..."}
                        </TableCell>
                        <TableCell className="text-sm">{new Date(exec.executed_at).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-destructive max-w-[200px] truncate">
                          {exec.error_message || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hwid" className="mt-4">
          <div className="glass-card p-6">
            <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              Unique HWIDs ({uniqueHwids.length})
            </h4>

            {uniqueHwids.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No HWIDs recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>HWID</TableHead>
                      <TableHead>Last IP</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uniqueHwids.map((exec) => (
                      <TableRow key={exec.executor_hwid}>
                        <TableCell className="font-mono text-xs">
                          {exec.executor_hwid?.substring(0, 24)}
                          {exec.executor_hwid && exec.executor_hwid.length > 24 && "..."}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{exec.executor_ip || "-"}</TableCell>
                        <TableCell className="text-sm">{new Date(exec.executed_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {exec.success ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
                              Success
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                              Failed
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="locked" className="mt-4">
          <div className="glass-card p-6">
            <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              Locked HWIDs ({lockedKeys.length})
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Keys with HWID lock enabled that have been bound to a device
            </p>

            {lockedKeys.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No keys with locked HWIDs.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Locked HWID</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lockedKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-mono text-xs">
                          {key.key_value.substring(0, 16)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {key.hwid_locked?.substring(0, 24)}
                          {key.hwid_locked && key.hwid_locked.length > 24 && "..."}
                        </TableCell>
                        <TableCell className="text-sm">
                          {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetHwid(key.id)}
                            title="Reset HWID lock"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
