import { useState } from "react";
import { TrendingUp, Users, MessageSquare, Clock, Target, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Meeting } from "@shared/schema";

interface MeetingInsightsProps {
  meetings: Meeting[];
}

export default function MeetingInsights({ meetings }: MeetingInsightsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  const completedMeetings = meetings.filter(m => m.processingStatus === 'completed');

  // Calculate insights
  const totalDuration = completedMeetings.reduce((sum, m) => sum + (m.duration || 0), 0);
  const totalParticipants = completedMeetings.reduce((sum, m) => sum + (m.participantCount || 0), 0);
  const totalActionItems = completedMeetings.reduce((sum, m) => sum + (m.actionItems?.length || 0), 0);
  
  // Sentiment trend
  const avgSentiment = completedMeetings.length > 0 
    ? Math.round(completedMeetings.reduce((sum, m) => sum + (m.sentimentAnalysis?.overall || 50), 0) / completedMeetings.length)
    : 50;

  // High priority action items
  const highPriorityActions = completedMeetings.reduce((sum, m) => {
    return sum + (m.actionItems?.filter(item => item.priority === 'high').length || 0);
  }, 0);

  // Most active speakers
  const allSpeakers = completedMeetings.flatMap(m => m.speakerAnalysis?.speakers || []);
  const speakerStats = allSpeakers.reduce((acc, speaker) => {
    if (!acc[speaker.name]) {
      acc[speaker.name] = { name: speaker.name, totalTime: 0, meetings: 0 };
    }
    acc[speaker.name].totalTime += speaker.speakingTime;
    acc[speaker.name].meetings += 1;
    return acc;
  }, {} as Record<string, { name: string; totalTime: number; meetings: number }>);

  const topSpeakers = Object.values(speakerStats)
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 5);

  // Recent trends
  const recentMeetings = completedMeetings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Meeting Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {Math.round(totalDuration / 60)}h {totalDuration % 60}m
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {completedMeetings.length} meetings analyzed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{totalActionItems}</div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {highPriorityActions} high priority
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Sentiment Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{avgSentiment}%</div>
            <Progress value={avgSentiment} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{totalParticipants}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Avg {Math.round(totalParticipants / (completedMeetings.length || 1))} per meeting
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Speakers */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-primary" />
              Most Active Speakers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSpeakers.map((speaker, index) => (
                <div key={speaker.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {speaker.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{speaker.name}</p>
                      <p className="text-xs text-muted-foreground">{speaker.meetings} meetings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{speaker.totalTime}m</p>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Recent Meeting Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{meeting.filename}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <span>{meeting.duration}m</span>
                      <span>{meeting.participantCount} people</span>
                      <span>{meeting.actionItems?.length || 0} actions</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`w-3 h-3 rounded-full ${
                      (meeting.sentimentAnalysis?.overall || 50) > 60 ? 'bg-green-500' :
                      (meeting.sentimentAnalysis?.overall || 50) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <p className="text-xs text-muted-foreground mt-1">
                      {meeting.sentimentAnalysis?.overall || 50}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}