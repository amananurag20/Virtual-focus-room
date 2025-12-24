import { useState, useEffect } from 'react';
import {
    HiXMark,
    HiChartBar,
    HiClock,
    HiCheckCircle,
    HiTrophy,
    HiCalendar
} from 'react-icons/hi2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from '@/utils/axios';

export default function Dashboard({ isOpen, onClose }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week'); // 'today', 'week', 'month', 'total'

    useEffect(() => {
        if (isOpen) {
            fetchStats();
        }
    }, [isOpen]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/stats');
            if (res.data.success) {
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const currentStats = stats?.[timeRange] || { tasks: 0, completed: 0, meetingTime: 0 };
    const completionRate = currentStats.tasks > 0
        ? Math.round((currentStats.completed / currentStats.tasks) * 100)
        : 0;

    // Prepare chart data
    const chartData = stats?.dailyBreakdown?.map(day => ({
        date: new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }),
        time: Math.round(day.duration / 60) // Convert to minutes
    })) || [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
                <CardHeader className="flex flex-row items-center justify-between py-4 border-b sticky top-0 bg-card z-10">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <HiChartBar className="w-6 h-6 text-indigo-500" />
                        Productivity Dashboard
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <HiXMark className="w-5 h-5" />
                    </Button>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Time Range Selector */}
                            <div className="flex gap-2 flex-wrap">
                                {['today', 'week', 'month', 'total'].map(range => (
                                    <Button
                                        key={range}
                                        variant={timeRange === range ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setTimeRange(range)}
                                        className="capitalize"
                                    >
                                        {range}
                                    </Button>
                                ))}
                            </div>

                            {/* Quick Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="border-2 hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                                <HiClock className="w-6 h-6 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Focus Time</p>
                                                <p className="text-2xl font-bold">{formatTime(currentStats.meetingTime)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                                <HiCheckCircle className="w-6 h-6 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Tasks Done</p>
                                                <p className="text-2xl font-bold">{currentStats.completed}/{currentStats.tasks}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                                <HiTrophy className="w-6 h-6 text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Success Rate</p>
                                                <p className="text-2xl font-bold">{completionRate}%</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                                <HiCalendar className="w-6 h-6 text-purple-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Avg/Day</p>
                                                <p className="text-2xl font-bold">{timeRange === 'week' ? Math.round(currentStats.meetingTime / 7 / 60) : Math.round(currentStats.meetingTime / 30 / 60)}m</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Secondary Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-none">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-muted-foreground mb-1">Pending Tasks</p>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentStats.tasks - currentStats.completed}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-none">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{Math.floor(currentStats.meetingTime / 3600)}h</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-none">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-sm text-muted-foreground mb-1">Productivity</p>
                                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                            {completionRate >= 80 ? '🔥' : completionRate >= 50 ? '⭐' : '💪'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Daily Breakdown Chart */}
                            {timeRange === 'week' && chartData.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <HiCalendar className="w-5 h-5" />
                                            Weekly Focus Time (Minutes)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="date" className="text-xs" />
                                                <YAxis className="text-xs" />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))'
                                                    }}
                                                />
                                                <Bar dataKey="time" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            )}

                            {/* All-Time Summary */}
                            {stats?.total && (
                                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
                                    <CardHeader>
                                        <CardTitle className="text-base">All-Time Stats</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {formatTime(stats.total.meetingTime)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Total Focus</p>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                                {stats.total.completed}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Tasks Done</p>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                                {Math.round((stats.total.completed / stats.total.tasks) * 100) || 0}%
                                            </p>
                                            <p className="text-sm text-muted-foreground">Success Rate</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
