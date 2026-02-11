import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, MessageSquare, TrendingUp, Activity, 
  ArrowLeft, Crown, BarChart3, Clock
} from "lucide-react";
import { Link } from "wouter";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });
  
  const { data: coachUsage, isLoading: coachLoading } = trpc.admin.coachUsage.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });
  
  const { data: userGrowth, isLoading: growthLoading } = trpc.admin.userGrowth.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });
  
  const { data: conversationGrowth } = trpc.admin.conversationGrowth.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });
  
  const { data: recentConversations, isLoading: recentLoading } = trpc.admin.recentConversations.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });
  
  const { data: allUsers, isLoading: usersLoading } = trpc.admin.users.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

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
              Please log in to access the admin dashboard.
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
              You don't have permission to access the admin dashboard.
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

  const isLoading = statsLoading || coachLoading || growthLoading;

  return (
    <div className="min-h-screen bg-cosmos-dark">
      {/* Header */}
      <header className="border-b border-amber-500/20 bg-cosmos-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-amber-400 hover:bg-amber-500/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">A.Cosmos Analytics</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/usage">
              <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                <BarChart3 className="w-4 h-4 mr-2" />
                Usage Analytics
              </Button>
            </Link>
            <div className="text-sm text-gray-400">
              Welcome, <span className="text-amber-400">{user.name || user.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-amber-400 animate-pulse">Loading analytics...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                Key Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-cosmos-card border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Users</p>
                        <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
                      </div>
                      <Users className="w-10 h-10 text-amber-400/50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Conversations</p>
                        <p className="text-3xl font-bold text-white">{stats?.totalConversations || 0}</p>
                      </div>
                      <MessageSquare className="w-10 h-10 text-blue-400/50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Messages</p>
                        <p className="text-3xl font-bold text-white">{stats?.totalMessages || 0}</p>
                      </div>
                      <Activity className="w-10 h-10 text-green-400/50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">New Users (7d)</p>
                        <p className="text-3xl font-bold text-white">{stats?.newUsersLast7Days || 0}</p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-purple-400/50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-cosmos-card border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active Users (7d)</p>
                        <p className="text-3xl font-bold text-white">{stats?.activeUsersLast7Days || 0}</p>
                      </div>
                      <Clock className="w-10 h-10 text-orange-400/50" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card className="bg-cosmos-card border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">User Growth (30 Days)</CardTitle>
                  <CardDescription className="text-gray-400">New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userGrowth || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9ca3af" 
                          fontSize={12}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b33' }}
                          labelStyle={{ color: '#f59e0b' }}
                        />
                        <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Guide Usage Pie Chart */}
              <Card className="bg-cosmos-card border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Guide Popularity</CardTitle>
                  <CardDescription className="text-gray-400">Conversations by guide</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center">
                    <ResponsiveContainer width="50%" height="100%">
                      <PieChart>
                        <Pie
                          data={coachUsage || []}
                          dataKey="conversationCount"
                          nameKey="roleName"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ roleName }) => roleName}
                          labelLine={false}
                        >
                          {(coachUsage || []).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b33' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-1/2 space-y-2">
                      {(coachUsage || []).map((coach, index) => (
                        <div key={coach.roleSlug} className="flex items-center gap-2 text-sm">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-gray-300">{coach.roleName}</span>
                          <span className="text-gray-500 ml-auto">{coach.conversationCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversation Growth Chart */}
            <Card className="bg-cosmos-card border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Conversation Activity (30 Days)</CardTitle>
                <CardDescription className="text-gray-400">Daily conversation count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversationGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af" 
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b33' }}
                        labelStyle={{ color: '#f59e0b' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Conversations & Users Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Conversations */}
              <Card className="bg-cosmos-card border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Recent Conversations</CardTitle>
                  <CardDescription className="text-gray-400">Latest conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {recentLoading ? (
                      <div className="text-gray-400 text-center py-4">Loading...</div>
                    ) : (recentConversations || []).length === 0 ? (
                      <div className="text-gray-400 text-center py-4">No conversations yet</div>
                    ) : (
                      (recentConversations || []).map((conv) => (
                        <div key={conv.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{conv.title || 'Untitled'}</p>
                            <p className="text-gray-500 text-xs">
                              {conv.userName || conv.userEmail || 'Anonymous'} • {conv.roleName}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 ml-2">
                            {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Users List */}
              <Card className="bg-cosmos-card border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Users</CardTitle>
                  <CardDescription className="text-gray-400">Registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {usersLoading ? (
                      <div className="text-gray-400 text-center py-4">Loading...</div>
                    ) : (allUsers || []).length === 0 ? (
                      <div className="text-gray-400 text-center py-4">No users yet</div>
                    ) : (
                      (allUsers || []).map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white text-sm truncate">{u.name || 'Anonymous'}</p>
                              {u.role === 'admin' && (
                                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Admin</span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs truncate">{u.email || 'No email'}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xs text-amber-400">{u.conversationCount} chats</p>
                            <p className="text-xs text-gray-500">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
