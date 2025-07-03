import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain, Plus, User, Search, BarChart3, TrendingUp, Clock, Users, FileText, Activity, PieChart, LogOut, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import FileUpload from "@/components/file-upload";
import MeetingAnalysis from "@/components/meeting-analysis";
import MeetingInsights from "@/components/meeting-insights";
import AIStatus from "@/components/ai-status";
import MeetingDebug from "@/components/meeting-debug";
import { MeetingCard, MeetingCardSkeleton } from "@/components/meeting-card";
import { getQueryFn } from "@/lib/queryClient";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedButton, FloatingActionButton } from "@/components/ui/animated-button";
import { AIProcessingLoader } from "@/components/ui/animated-loader";
import { FadeInPage } from "@/components/ui/page-transition";
import { AnimatedSearch } from "@/components/ui/animated-search";
import { useNotifications, NotificationContainer } from "@/components/ui/animated-notification";
import { AnimatedWidget, MetricWidget, ProgressWidget } from "@/components/ui/animated-widget";
import { useStaggerAnimation, useTextAnimation, useScrollAnimation } from "@/hooks/useGSAP";
import { gsap } from "@/lib/animations";
import { PerformanceMonitor } from "@/components/performance-monitor";
import type { Meeting } from "@shared/schema";

export default function Home() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("analysis");
  const { user, logout } = useAuth();
  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotifications();
  
  // Animation refs
  const { containerRef: statsRef, triggerAnimation: triggerStatsAnimation } = useStaggerAnimation<HTMLDivElement>('.stats-card', 'scaleIn');
  const { ref: titleRef, animate: titleAnimate } = useTextAnimation<HTMLHeadingElement>();
  const pageRef = useScrollAnimation<HTMLDivElement>('fadeIn');
  
  // Helper function for user initials
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const { data: meetings = [], isLoading, error } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Trigger animations when data loads
  useEffect(() => {
    if (meetings.length > 0) {
      // Reduced delay for better performance
      setTimeout(() => {
        triggerStatsAnimation();
      }, 100);
    }
  }, [meetings.length, triggerStatsAnimation]);

  // Animate title on mount (optimized)
  useEffect(() => {
    // Reduced delay
    setTimeout(() => {
      titleAnimate.fadeInWords();
    }, 200);
  }, [titleAnimate]);

  // Show notification when meeting is selected (disabled for performance)
  // useEffect(() => {
  //   if (selectedMeetingId) {
  //     const meeting = meetings.find(m => m.id === selectedMeetingId);
  //     if (meeting) {
  //       showInfo('Meeting Selected', `Now viewing analysis for "${meeting.filename}"`);
  //     }
  //   }
  // }, [selectedMeetingId, meetings, showInfo]);

  // Debug logging
  console.log('Meetings Debug:', {
    isLoading,
    error: error?.message,
    meetingsCount: meetings.length,
    meetings: meetings.map(m => ({ id: m.id, filename: m.filename, status: m.processingStatus }))
  });

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter(meeting =>
    meeting.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const completedMeetings = meetings.filter(m => m.processingStatus === 'completed').length;
  const totalActionItems = meetings.reduce((sum, m) => sum + (m.actionItems?.length || 0), 0);
  const avgSentiment = meetings.length > 0 
    ? Math.round(meetings.reduce((sum, m) => sum + (m.sentimentAnalysis?.overall || 50), 0) / meetings.length)
    : 50;

  return (
    <FadeInPage className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-300">
      {/* Enhanced Header with gradient */}
      <header className="animate-item bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-12">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 ref={titleRef} className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Meeting Summarizer
                  </h1>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
                    <AIStatus />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <AnimatedButton 
                variant="outline"
                onClick={() => setActiveTab("insights")}
                className={`${
                  activeTab === "insights" ? "bg-primary text-primary-foreground" : ""
                }`}
                icon={<PieChart className="w-4 h-4" />}
              >
                Insights
              </AnimatedButton>
              <AnimatedButton 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl"
                onClick={() => {
                  setSelectedMeetingId(null);
                  setActiveTab("analysis");
                }}
                icon={<Plus className="w-4 h-4" />}
                gradient
                ripple
              >
                New Analysis
              </AnimatedButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-primary/10">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.username || 'User'
                        }
                      </span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center text-red-600 focus:text-red-600"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="animate-item max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        {meetings.length > 0 && (
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard
              className="stats-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800"
              title="Total Meetings"
              icon={<FileText className="w-5 h-5 text-blue-500" />}
              animation="scale"
            >
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{meetings.length}</div>
                <p className="text-xs text-blue-600 dark:text-blue-400">{completedMeetings} completed</p>
              </div>
            </AnimatedCard>

            <AnimatedCard
              className="stats-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800"
              title="Action Items"
              icon={<BarChart3 className="w-5 h-5 text-green-500" />}
              animation="scale"
            >
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{totalActionItems}</div>
                <p className="text-xs text-green-600 dark:text-green-400">across all meetings</p>
              </div>
            </AnimatedCard>

            <div className="stats-card">
              <MetricWidget
                title="Avg Sentiment"
                value={`${avgSentiment}%`}
                subtitle={avgSentiment > 60 ? 'Positive' : avgSentiment > 40 ? 'Neutral' : 'Negative'}
                icon={<TrendingUp className="w-5 h-5" />}
                change={{
                  value: Math.random() * 10 - 5, // Mock change data
                  period: 'last week'
                }}
                variant="gradient"
                refreshable={true}
                onRefresh={() => {
                  showInfo('Refreshed', 'Sentiment data has been updated');
                }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800"
              />
            </div>

            <AnimatedCard
              className="stats-card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800"
              title="Total Duration"
              icon={<Clock className="w-5 h-5 text-orange-500" />}
              animation="scale"
            >
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {Math.round(meetings.reduce((sum, m) => sum + (m.duration || 0), 0))}m
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400">meeting time analyzed</p>
              </div>
            </AnimatedCard>
          </div>
        )}

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Meeting Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Team Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Upload & Search */}
              <div className="lg:col-span-1 space-y-6">
                <div className="animate-in slide-in-from-left duration-500">
                  <FileUpload onMeetingCreated={(id) => {
                    setSelectedMeetingId(id);
                    setActiveTab("analysis");
                  }} />
                </div>
                
                {/* Debug Info */}
                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm text-yellow-800 dark:text-yellow-200">Debug Info:</h4>
                    <ul className="text-xs space-y-1 text-yellow-700 dark:text-yellow-300">
                      <li>Loading: {isLoading ? 'Yes' : 'No'}</li>
                      <li>Error: {error ? String(error) : 'None'}</li>
                      <li>Meetings Count: {meetings.length}</li>
                      <li>User ID: {user?.id}</li>
                    </ul>
                    {meetings.length > 0 && (
                      <div className="mt-2">
                        <h5 className="font-semibold text-xs text-yellow-800 dark:text-yellow-200">Recent Meetings:</h5>
                        <ul className="text-xs text-yellow-700 dark:text-yellow-300">
                          {meetings.slice(0, 3).map(m => (
                            <li key={m.id}>#{m.id} - {m.filename} ({m.processingStatus})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Search and Recent Meetings */}
                {meetings.length > 0 && (
                  <Card className="animate-in slide-in-from-left duration-700 bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                        <Search className="w-5 h-5 mr-2 text-primary" />
                        Meeting Library
                      </CardTitle>
                      <AnimatedSearch
                        placeholder="Search meetings..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                        suggestions={meetings.map(m => m.filename)}
                        showFilters={true}
                        filters={[
                          { label: 'Completed', value: 'completed', active: false },
                          { label: 'Processing', value: 'processing', active: false },
                          { label: 'Recent', value: 'recent', active: false }
                        ]}
                        variant="default"
                        size="md"
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                          // Show skeleton loaders while loading
                          Array.from({ length: 3 }).map((_, index) => (
                            <MeetingCardSkeleton key={index} index={index} />
                          ))
                        ) : (
                          filteredMeetings.slice(0, 10).map((meeting, index) => (
                            <MeetingCard
                              key={meeting.id}
                              meeting={meeting}
                              isSelected={selectedMeetingId === meeting.id}
                              onClick={() => {
                                setSelectedMeetingId(meeting.id);
                                setActiveTab("analysis");
                              }}
                              index={index}
                            />
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Results */}
              <div className="lg:col-span-2">
                <div className="animate-in slide-in-from-right duration-500">
                  {selectedMeeting ? (
                    <div className="space-y-4">
                      <MeetingAnalysis meeting={selectedMeeting} />
                      <MeetingDebug meetingId={selectedMeeting.id} />
                    </div>
                  ) : (
                    <Card className="bg-gradient-to-br from-primary/5 to-background border-border shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-12 text-center">
                        <div className="transition-transform duration-300 group-hover:scale-110">
                          <Brain className="w-20 h-20 text-primary/60 mx-auto mb-6 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-semibold text-foreground mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                          Welcome to AI Meeting Analyzer
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Upload a meeting transcript to get started with AI-powered analysis featuring sentiment tracking, action item extraction, and speaker insights.
                        </p>
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                            Sentiment Analysis
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Users className="w-4 h-4 mr-2 text-primary" />
                            Speaker Insights
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <FileText className="w-4 h-4 mr-2 text-primary" />
                            Smart Summaries
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2 text-primary" />
                            Action Items
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="animate-in fade-in duration-500">
            <div className="animate-in slide-in-from-bottom duration-500">
              <MeetingInsights meetings={meetings} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => {
          setSelectedMeetingId(null);
          setActiveTab("analysis");
        }}
      >
        <Plus className="w-6 h-6" />
      </FloatingActionButton>

      {/* Notification Container */}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />

      {/* Performance Monitor (Ctrl+Shift+P to toggle) */}
      <PerformanceMonitor />
    </FadeInPage>
  );
}
