import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, ArrowLeft, Crown, BarChart3, MessageSquare, 
  Users, Zap, TrendingUp, Calendar, Clock, Download
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const ACTION_TYPE_LABELS: Record<string, string> = {
  'conversation_start': 'New Conversations',
  'message_sent': 'Messages Sent',
  'card_drawn': 'Cards Drawn',
  'apex_session': 'Apex Sessions',
  'voice_input': 'Voice Inputs',
};

const ACTION_TYPE_ICONS: Record<string, React.ReactNode> = {
  'conversation_start': <MessageSquare className="w-4 h-4" />,
  'message_sent': <Activity className="w-4 h-4" />,
  'card_drawn': <Zap className="w-4 h-4" />,
  'apex_session': <Crown className="w-4 h-4" />,
  'voice_input': <Activity className="w-4 h-4" />,
};

// Helper function to convert data to CSV
function convertToCSV(data: Record<string, unknown>[], headers: { key: string; label: string }[]): string {
  const headerRow = headers.map(h => h.label).join(',');
  const rows = data.map(row => 
    headers.map(h => {
      const value = row[h.key];
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
      const strValue = String(value);
      // Escape quotes and wrap in quotes if contains comma or newline
      if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    }).join(',')
  ).join('\n');
  return `${headerRow}\n${rows}`;
}

// Helper function to download CSV
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function UsageDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [exporting, setExporting] = useState<'users' | 'logs' | null>(null);
  
  const { data: usageStats, isLoading: statsLoading } = trpc.usage.adminStats.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });
  
  const { data: topUsers, isLoading: topUsersLoading } = trpc.usage.adminTopUsers.useQuery(
    { limit: 15 },
    { enabled: user?.role === 'admin' }
  );
  
  const { data: actionCounts, isLoading: actionLoading } = trpc.usage.adminActionCounts.useQuery(
    { days: 7 },
    { enabled: user?.role === 'admin' }
  );
  
  const { data: actionCounts30d } = trpc.usage.adminActionCounts.useQuery(
    { days: 30 },
    { enabled: user?.role === 'admin' }
  );

  // Export queries - only fetch when exporting
  const { refetch: refetchUsersExport } = trpc.usage.exportUsers.useQuery(undefined, {
    enabled: false,
  });
  
  const { refetch: refetchLogsExport } = trpc.usage.exportLogs.useQuery(
    { days: 30 },
    { enabled: false }
  );

  const handleExportUsers = async () => {
    setExporting('users');
    try {
      const result = await refetchUsersExport();
      if (result.data) {
        const headers = [
          { key: 'userId', label: 'User ID' },
          { key: 'userName', label: 'Name' },
          { key: 'userEmail', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'tier', label: 'Tier' },
          { key: 'totalConversations', label: 'Total Conversations' },
          { key: 'totalMessages', label: 'Total Messages' },
          { key: 'dailyConversations', label: 'Daily Conversations' },
          { key: 'dailyMessages', label: 'Daily Messages' },
          { key: 'weeklyConversations', label: 'Weekly Conversations' },
          { key: 'weeklyMessages', label: 'Weekly Messages' },
          { key: 'monthlyConversations', label: 'Monthly Conversations' },
          { key: 'monthlyMessages', label: 'Monthly Messages' },
          { key: 'createdAt', label: 'Created At' },
          { key: 'lastSignedIn', label: 'Last Signed In' },
        ];
        const csv = convertToCSV(result.data as Record<string, unknown>[], headers);
        const date = new Date().toISOString().split('T')[0];
        downloadCSV(csv, `acosmos-users-${date}.csv`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportLogs = async () => {
    setExporting('logs');
    try {
      const result = await refetchLogsExport();
      if (result.data) {
        const headers = [
          { key: 'logId', label: 'Log ID' },
          { key: 'userId', label: 'User ID' },
          { key: 'userName', label: 'User Name' },
          { key: 'userEmail', label: 'User Email' },
          { key: 'actionType', label: 'Action Type' },
          { key: 'metadata', label: 'Metadata' },
          { key: 'createdAt', label: 'Created At' },
        ];
        const csv = convertToCSV(result.data as Record<string, unknown>[], headers);
        const date = new Date().toISOString().split('T')[0];
        downloadCSV(csv, `acosmos-usage-logs-${date}.csv`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cosmos-dark flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cosmos-dark flex items-center justify-center">
        <Card className="bg-cosmos-card border-amber-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-amber-400">Access Denied</CardTitle>
            <CardDescription className="text-gray-400">
              Please log in to access the usage dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                Go to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cosmos-dark flex items-center justify-center">
        <Card className="bg-cosmos-card border-red-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400">Unauthorized</CardTitle>
            <CardDescription className="text-gray-400">
              You don't have permission to access the usage dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline" className="border-amber-500/30 text-amber-400">
                Go to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = statsLoading || topUsersLoading || actionLoading;

  // Prepare action type data for pie chart
  const actionPieData = actionCounts?.map((item, index) => ({
    name: ACTION_TYPE_LABELS[item.actionType] || item.actionType,
    value: item.count,
    color: COLORS[index % COLORS.length],
  })) || [];

  // Prepare top users data for bar chart
  const topUsersChartData = topUsers?.slice(0, 10).map(u => ({
    name: u.userName || u.userEmail?.split('@')[0] || 'Anonymous',
    messages: u.totalMessages,
    conversations: u.totalConversations,
  })) || [];

  return (
    <div className="min-h-screen bg-cosmos-dark">
      {/* Header */}
      <header className="border-b border-amber-500/20 bg-cosmos-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-amber-400 hover:bg-amber-500/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Usage Analytics</h1>
                <p className="text-sm text-gray-400">User behavior patterns & metrics</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              onClick={handleExportUsers}
              disabled={exporting !== null}
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting === 'users' ? 'Exporting...' : 'Export Users'}
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              onClick={handleExportLogs}
              disabled={exporting !== null}
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting === 'logs' ? 'Exporting...' : 'Export Logs'}
            </Button>
            <Link href="/admin">
              <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                <Crown className="w-4 h-4 mr-2" />
                Main Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-amber-400 animate-pulse">Loading usage analytics...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Usage Overview Cards */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Usage Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-cosmos-card border-purple-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Messages</p>
                        <p className="text-3xl font-bold text-white">{usageStats?.totalMessages || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">All time</p>
                      </div>
                      <MessageSquare className="w-10 h-10 text-purple-400/50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-blue-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Conversations</p>
                        <p className="text-3xl font-bold text-white">{usageStats?.totalConversations || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">All time</p>
                      </div>
                      <Users className="w-10 h-10 text-blue-400/50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-green-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active Users (Today)</p>
                        <p className="text-3xl font-bold text-white">{usageStats?.activeUsersToday || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">With activity</p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-green-400/50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Avg Messages/User</p>
                        <p className="text-3xl font-bold text-white">
                          {usageStats?.avgMessagesPerUser?.toFixed(1) || '0'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Per active user</p>
                      </div>
                      <Zap className="w-10 h-10 text-amber-400/50" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Time-based Stats */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Time-based Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-cosmos-card border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">Today</p>
                      <div className="flex justify-center gap-8">
                        <div>
                          <p className="text-2xl font-bold text-amber-400">{usageStats?.todayConversations || 0}</p>
                          <p className="text-xs text-gray-500">Conversations</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-400">{usageStats?.todayMessages || 0}</p>
                          <p className="text-xs text-gray-500">Messages</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">This Week</p>
                      <div className="flex justify-center gap-8">
                        <div>
                          <p className="text-2xl font-bold text-amber-400">{usageStats?.weekConversations || 0}</p>
                          <p className="text-xs text-gray-500">Conversations</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-400">{usageStats?.weekMessages || 0}</p>
                          <p className="text-xs text-gray-500">Messages</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">This Month</p>
                      <div className="flex justify-center gap-8">
                        <div>
                          <p className="text-2xl font-bold text-amber-400">{usageStats?.monthConversations || 0}</p>
                          <p className="text-xs text-gray-500">Conversations</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-400">{usageStats?.monthMessages || 0}</p>
                          <p className="text-xs text-gray-500">Messages</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Action Type Distribution */}
              <Card className="bg-cosmos-card border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Action Distribution (7 Days)</CardTitle>
                  <CardDescription className="text-gray-400">Breakdown of user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center">
                    <ResponsiveContainer width="50%" height="100%">
                      <PieChart>
                        <Pie
                          data={actionPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {actionPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b33' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-1/2 space-y-2">
                      {actionPieData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-300 flex-1">{item.name}</span>
                          <span className="text-gray-500">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Users Bar Chart */}
              <Card className="bg-cosmos-card border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Top Users by Activity</CardTitle>
                  <CardDescription className="text-gray-400">Most active users by message count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topUsersChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          stroke="#9ca3af" 
                          fontSize={11}
                          width={80}
                          tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + '...' : value}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b33' }}
                          labelStyle={{ color: '#f59e0b' }}
                        />
                        <Legend />
                        <Bar dataKey="messages" fill="#8b5cf6" name="Messages" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="conversations" fill="#f59e0b" name="Conversations" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Type Details (30 Days) */}
            <Card className="bg-cosmos-card border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Action Type Breakdown (30 Days)</CardTitle>
                <CardDescription className="text-gray-400">Detailed view of all action types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={actionCounts30d || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="actionType" 
                        stroke="#9ca3af" 
                        fontSize={12}
                        tickFormatter={(value) => ACTION_TYPE_LABELS[value] || value}
                      />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b33' }}
                        labelStyle={{ color: '#f59e0b' }}
                        labelFormatter={(value) => ACTION_TYPE_LABELS[value] || value}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {(actionCounts30d || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Users Table */}
            <Card className="bg-cosmos-card border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  Top Users by Usage
                </CardTitle>
                <CardDescription className="text-gray-400">Users ranked by total activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Rank</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Tier</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Daily Conv.</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Daily Msg.</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Total Conv.</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Total Msg.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(topUsers || []).map((u, index) => (
                        <tr key={u.userId} className="border-b border-gray-800 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <span className={`
                              ${index === 0 ? 'text-amber-400' : ''}
                              ${index === 1 ? 'text-gray-300' : ''}
                              ${index === 2 ? 'text-orange-400' : ''}
                              ${index > 2 ? 'text-gray-500' : ''}
                              font-medium
                            `}>
                              #{index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Link href={`/admin/user/${u.userId}`}>
                              <div className="cursor-pointer hover:bg-white/10 rounded p-1 -m-1 transition-colors">
                                <p className="text-white text-sm hover:text-amber-400 transition-colors">{u.userName || 'Anonymous'}</p>
                                <p className="text-gray-500 text-xs">{u.userEmail || 'No email'}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`
                              text-xs px-2 py-1 rounded
                              ${u.tier === 'premium' ? 'bg-purple-500/20 text-purple-400' : ''}
                              ${u.tier === 'basic' ? 'bg-blue-500/20 text-blue-400' : ''}
                              ${u.tier === 'free' ? 'bg-gray-500/20 text-gray-400' : ''}
                            `}>
                              {u.tier}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-amber-400">{u.dailyConversations}</td>
                          <td className="py-3 px-4 text-right text-purple-400">{u.dailyMessages}</td>
                          <td className="py-3 px-4 text-right text-white">{u.totalConversations}</td>
                          <td className="py-3 px-4 text-right text-white font-medium">{u.totalMessages}</td>
                        </tr>
                      ))}
                      {(!topUsers || topUsers.length === 0) && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
                            No usage data yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
