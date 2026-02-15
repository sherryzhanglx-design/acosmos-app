import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, User, Mail, Calendar, Crown, MessageSquare, 
  Activity, Clock, Zap, TrendingUp
} from "lucide-react";
import { Link, useParams } from "wouter";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const ACTION_TYPE_LABELS: Record<string, string> = {
  'conversation_start': 'Started Conversation',
  'message_sent': 'Sent Message',
  'card_drawn': 'Drew Card',
  'apex_session': 'Apex Session',
  'voice_input': 'Voice Input',
};

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const userIdNum = parseInt(userId || '0', 10);
  const { user: currentUser, loading: authLoading } = useAuth();
  
  const { data: userDetail, isLoading: detailLoading } = trpc.usage.adminUserDetail.useQuery(
    { userId: userIdNum },
    { enabled: currentUser?.role === 'admin' && userIdNum > 0 }
  );
  
  const { data: usageLogs, isLoading: logsLoading } = trpc.usage.adminUserLogs.useQuery(
    { userId: userIdNum, limit: 100 },
    { enabled: currentUser?.role === 'admin' && userIdNum > 0 }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cosmos-dark flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-cosmos-dark flex items-center justify-center">
        <Card className="bg-cosmos-card border-amber-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-amber-400">Access Denied</CardTitle>
            <CardDescription className="text-gray-400">
              Please log in to access the user detail page.
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

  if (currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cosmos-dark flex items-center justify-center">
        <Card className="bg-cosmos-card border-red-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400">Unauthorized</CardTitle>
            <CardDescription className="text-gray-400">
              You don't have permission to access this page.
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

  const isLoading = detailLoading || logsLoading;

  if (!isLoading && !userDetail) {
    return (
      <div className="min-h-screen bg-cosmos-dark flex items-center justify-center">
        <Card className="bg-cosmos-card border-amber-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-amber-400">User Not Found</CardTitle>
            <CardDescription className="text-gray-400">
              The user you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/usage">
              <Button variant="outline" className="border-amber-500/30 text-amber-400">
                Back to Usage Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare coach usage data for pie chart
  const coachPieData = userDetail?.conversationsByCoach?.map((item, index) => ({
    name: item.roleName || 'Unknown',
    value: item.count,
    color: COLORS[index % COLORS.length],
  })) || [];

  // Group usage logs by date for activity chart
  const activityByDate: Record<string, number> = {};
  (usageLogs || []).forEach(log => {
    const date = new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    activityByDate[date] = (activityByDate[date] || 0) + 1;
  });
  const activityChartData = Object.entries(activityByDate)
    .slice(0, 14)
    .reverse()
    .map(([date, count]) => ({ date, count }));

  return (
    <div className="min-h-screen bg-cosmos-dark">
      {/* Header */}
      <header className="border-b border-amber-500/20 bg-cosmos-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/usage">
              <Button variant="ghost" size="icon" className="text-amber-400 hover:bg-amber-500/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {userDetail?.user?.name || 'Anonymous User'}
                </h1>
                <p className="text-sm text-gray-400">User Detail & Activity</p>
              </div>
            </div>
          </div>
          <Link href="/admin/usage">
            <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
              <Activity className="w-4 h-4 mr-2" />
              Usage Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-amber-400 animate-pulse">Loading user details...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* User Profile Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Info Card */}
              <Card className="bg-cosmos-card border-amber-500/20 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-400" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white">
                      {(userDetail?.user?.name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{userDetail?.user?.name || 'Anonymous'}</p>
                      <span className={`
                        text-xs px-2 py-1 rounded
                        ${userDetail?.usage?.tier === 'premium' ? 'bg-purple-500/20 text-purple-400' : ''}
                        ${userDetail?.usage?.tier === 'basic' ? 'bg-blue-500/20 text-blue-400' : ''}
                        ${userDetail?.usage?.tier === 'free' || !userDetail?.usage?.tier ? 'bg-gray-500/20 text-gray-400' : ''}
                      `}>
                        {userDetail?.usage?.tier || 'free'} tier
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">{userDetail?.user?.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">
                        Joined {userDetail?.user?.createdAt 
                          ? new Date(userDetail.user.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', month: 'long', day: 'numeric' 
                            })
                          : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">
                        Last active {userDetail?.user?.lastSignedIn 
                          ? new Date(userDetail.user.lastSignedIn).toLocaleDateString('en-US', { 
                              year: 'numeric', month: 'short', day: 'numeric' 
                            })
                          : 'Unknown'}
                      </span>
                    </div>
                    {userDetail?.user?.role === 'admin' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400">Administrator</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-cosmos-card border-purple-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <MessageSquare className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{userDetail?.usage?.totalConversations || 0}</p>
                      <p className="text-xs text-gray-500">Total Conversations</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-blue-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Activity className="w-8 h-8 text-blue-400/50 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{userDetail?.usage?.totalMessages || 0}</p>
                      <p className="text-xs text-gray-500">Total Messages</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-green-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-green-400/50 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{userDetail?.usage?.dailyConversations || 0}</p>
                      <p className="text-xs text-gray-500">Today's Conversations</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Zap className="w-8 h-8 text-amber-400/50 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{userDetail?.usage?.dailyMessages || 0}</p>
                      <p className="text-xs text-gray-500">Today's Messages</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coach Usage Distribution */}
              <Card className="bg-cosmos-card border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Guide Usage</CardTitle>
                  <CardDescription className="text-gray-400">Conversations by coach</CardDescription>
                </CardHeader>
                <CardContent>
                  {coachPieData.length > 0 ? (
                    <div className="h-64 flex items-center">
                      <ResponsiveContainer width="50%" height="100%">
                        <PieChart>
                          <Pie
                            data={coachPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          >
                            {coachPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b33' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="w-1/2 space-y-2">
                        {coachPieData.map((item) => (
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
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      No conversation data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Chart */}
              <Card className="bg-cosmos-card border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400">Actions over the past 14 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityChartData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                          <YAxis stroke="#9ca3af" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b33' }}
                            labelStyle={{ color: '#f59e0b' }}
                          />
                          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Actions" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      No activity data yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Conversations */}
            <Card className="bg-cosmos-card border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  Recent Conversations
                </CardTitle>
                <CardDescription className="text-gray-400">Latest conversations with guardians</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {(userDetail?.recentConversations || []).length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No conversations yet</div>
                  ) : (
                    userDetail?.recentConversations?.map((conv) => (
                      <div key={conv.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{conv.title || 'Untitled Conversation'}</p>
                          <p className="text-gray-500 text-xs">with {conv.roleName || 'Unknown Guide'}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-400">
                            {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            }) : ''}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card className="bg-cosmos-card border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Activity Log
                </CardTitle>
                <CardDescription className="text-gray-400">Detailed usage history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Action</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(usageLogs || []).slice(0, 50).map((log) => (
                        <tr key={log.id} className="border-b border-gray-800 hover:bg-white/5">
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {new Date(log.createdAt).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`
                              text-xs px-2 py-1 rounded
                              ${log.actionType === 'conversation_start' ? 'bg-purple-500/20 text-purple-400' : ''}
                              ${log.actionType === 'message_sent' ? 'bg-blue-500/20 text-blue-400' : ''}
                              ${log.actionType === 'card_drawn' ? 'bg-amber-500/20 text-amber-400' : ''}
                              ${log.actionType === 'apex_session' ? 'bg-green-500/20 text-green-400' : ''}
                              ${log.actionType === 'voice_input' ? 'bg-pink-500/20 text-pink-400' : ''}
                            `}>
                              {ACTION_TYPE_LABELS[log.actionType] || log.actionType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-sm">
                            {log.metadata ? (
                              <span className="truncate max-w-xs block">
                                {typeof log.metadata === 'string' 
                                  ? log.metadata 
                                  : JSON.stringify(log.metadata).slice(0, 50)}
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                      {(!usageLogs || usageLogs.length === 0) && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-gray-500">
                            No activity logs yet
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
