import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain, Plus, User, Search, BarChart3, TrendingUp, Clock, Users, FileText, Activity, PieChart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import FileUpload from "@/components/file-upload";
import MeetingAnalysis from "@/components/meeting-analysis";
import MeetingInsights from "@/components/meeting-insights";
import type { Meeting } from "@shared/schema";

export default function Home() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("analysis");
  const { user, logout } = useAuth();

  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
  });

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };

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
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Enhanced Header with gradient */}
      <header className="bg-gradient-to-r from-primary/10 via-background to-primary/10 shadow-sm border-b border-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center group">
              <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <Brain className="text-primary text-2xl animate-pulse" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-foreground bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  AI Meeting Analyzer
                </h1>
                <p className="text-xs text-muted-foreground">Powered by GPT-4o</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button 
                variant="outline"
                onClick={() => setActiveTab("insights")}
                className={`transition-all duration-200 hover:scale-105 ${
                  activeTab === "insights" ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <PieChart className="w-4 h-4 mr-2" />
                Insights
              </Button>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={() => {
                  setSelectedMeetingId(null);
                  setActiveTab("analysis");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-primary/20">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        {meetings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 transition-all duration-300 hover:shadow-lg hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Total Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{meetings.length}</div>
                <p className="text-xs text-blue-600 dark:text-blue-400">{completedMeetings} completed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 transition-all duration-300 hover:shadow-lg hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{totalActionItems}</div>
                <p className="text-xs text-green-600 dark:text-green-400">across all meetings</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 transition-all duration-300 hover:shadow-lg hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Avg Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{avgSentiment}%</div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {avgSentiment > 60 ? 'Positive' : avgSentiment > 40 ? 'Neutral' : 'Negative'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 transition-all duration-300 hover:shadow-lg hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Total Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {Math.round(meetings.reduce((sum, m) => sum + (m.duration || 0), 0))}m
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400">meeting time analyzed</p>
              </CardContent>
            </Card>
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
                
                {/* Search and Recent Meetings */}
                {meetings.length > 0 && (
                  <Card className="animate-in slide-in-from-left duration-700 bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                        <Search className="w-5 h-5 mr-2 text-primary" />
                        Meeting Library
                      </CardTitle>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search meetings..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        {filteredMeetings.slice(0, 10).map((meeting, index) => (
                          <button
                            key={meeting.id}
                            onClick={() => {
                              setSelectedMeetingId(meeting.id);
                              setActiveTab("analysis");
                            }}
                            className={`w-full text-left p-4 rounded-lg border transition-all duration-200 hover:shadow-md group animate-in slide-in-from-bottom ${
                              selectedMeetingId === meeting.id
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border hover:border-primary/50 hover:bg-primary/2'
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {meeting.filename}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {meeting.createdAt ? new Date(meeting.createdAt).toLocaleDateString() : 'Recently uploaded'}
                                </p>
                                {meeting.duration && (
                                  <p className="text-xs text-muted-foreground">
                                    {meeting.duration} minutes
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <Badge
                                  variant={
                                    meeting.processingStatus === 'completed' ? 'default' :
                                    meeting.processingStatus === 'processing' ? 'secondary' :
                                    meeting.processingStatus === 'failed' ? 'destructive' : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {meeting.processingStatus}
                                </Badge>
                                {meeting.actionItems && meeting.actionItems.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {meeting.actionItems.length} actions
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Results */}
              <div className="lg:col-span-2">
                <div className="animate-in slide-in-from-right duration-500">
                  {selectedMeeting ? (
                    <MeetingAnalysis meeting={selectedMeeting} />
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
    </div>
  );
}
