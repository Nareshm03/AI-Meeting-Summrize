import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  CheckSquare, 
  TrendingUp, 
  Users, 
  Download,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  FileJson,
  FileSpreadsheet,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import SentimentChart from "./sentiment-chart";
import { exportToJSON, exportToCSV, exportToPDF } from "@/lib/export";
import type { Meeting } from "@shared/schema";

interface MeetingAnalysisProps {
  meeting: Meeting;
}

export default function MeetingAnalysis({ meeting }: MeetingAnalysisProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const { toast } = useToast();

  // Poll for updates if still processing
  const { data: updatedMeeting } = useQuery<Meeting>({
    queryKey: ["/api/meetings", meeting.id],
    refetchInterval: meeting.processingStatus === "processing" ? 2000 : false,
  });

  const currentMeeting = updatedMeeting || meeting;
  
  // Debug logging
  console.log('Meeting Analysis Debug:', {
    processingStatus: currentMeeting.processingStatus,
    hasSummary: !!currentMeeting.summary,
    summary: currentMeeting.summary?.substring(0, 100),
    keyPoints: currentMeeting.keyPoints?.length,
    actionItems: currentMeeting.actionItems?.length
  });

  const handleExport = (type: string, format: string) => {
    try {
      switch (format) {
        case 'json':
          exportToJSON(currentMeeting);
          break;
        case 'csv-actions':
          exportToCSV(currentMeeting, 'actions');
          break;
        case 'csv-speakers':
          exportToCSV(currentMeeting, 'speakers');
          break;
        case 'pdf':
          exportToPDF(currentMeeting);
          break;
      }
      toast({
        title: "Export successful",
        description: `${type} exported successfully`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  if (currentMeeting.processingStatus === "processing") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Meeting</h3>
          <p className="text-gray-600">AI is processing your transcript and extracting insights...</p>
        </div>
      </div>
    );
  }

  if (currentMeeting.processingStatus === "failed") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Failed</h3>
          <p className="text-gray-600">There was an error processing your transcript. Please try again.</p>
        </div>
      </div>
    );
  }

  if (currentMeeting.processingStatus !== "completed" || !currentMeeting.summary) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Available</h3>
          <p className="text-gray-600">Upload a transcript to see AI-powered meeting insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Duration</span>
            <span className="text-sm font-medium text-gray-900">
              {currentMeeting.duration ? `${currentMeeting.duration} min` : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Participants</span>
            <span className="text-sm font-medium text-gray-900">
              {currentMeeting.participantCount ? `${currentMeeting.participantCount} people` : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Action Items</span>
            <span className="text-sm font-medium text-warning">
              {currentMeeting.actionItems?.length || 0} items
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Overall Sentiment</span>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                currentMeeting.overallSentiment === 'positive' ? 'bg-green-500' :
                currentMeeting.overallSentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className={`text-sm font-medium capitalize ${
                currentMeeting.overallSentiment === 'positive' ? 'text-green-600' :
                currentMeeting.overallSentiment === 'negative' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {currentMeeting.overallSentiment || 'neutral'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="summary" 
                className="flex items-center space-x-2 py-4 px-6 border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <FileText className="w-4 h-4" />
                <span>Summary</span>
              </TabsTrigger>
              <TabsTrigger 
                value="actions"
                className="flex items-center space-x-2 py-4 px-6 border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Action Items</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sentiment"
                className="flex items-center space-x-2 py-4 px-6 border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Sentiment Analysis</span>
              </TabsTrigger>
              <TabsTrigger 
                value="speakers"
                className="flex items-center space-x-2 py-4 px-6 border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Users className="w-4 h-4" />
                <span>Speakers</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="summary" className="mt-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Meeting Summary</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('Summary', 'pdf')}>
                      <Printer className="w-4 h-4 mr-2" />
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('Summary', 'json')}>
                      <FileJson className="w-4 h-4 mr-2" />
                      Export JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-6">
                {/* Summary */}
                {currentMeeting.summary && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Overview</h4>
                    <p className="text-gray-700">{currentMeeting.summary}</p>
                  </div>
                )}

                {/* Key Points */}
                {currentMeeting.keyPoints && currentMeeting.keyPoints.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Key Discussion Points</h4>
                    <ul className="space-y-2">
                      {currentMeeting.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                          <p className="text-gray-700">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Decisions Made */}
                {currentMeeting.decisions && currentMeeting.decisions.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Decisions Made</h4>
                    <div className="space-y-3">
                      {currentMeeting.decisions.map((decision, index) => (
                        <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800">{decision}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {currentMeeting.nextSteps && currentMeeting.nextSteps.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Next Meeting Topics</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {currentMeeting.nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="mt-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Action Items</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('Action Items', 'csv-actions')}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('Action Items', 'json')}>
                      <FileJson className="w-4 h-4 mr-2" />
                      Export JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-4">
                {currentMeeting.actionItems && currentMeeting.actionItems.length > 0 ? (
                  currentMeeting.actionItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                            item.priority === 'high' ? 'bg-red-500' :
                            item.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}>
                            <span className="text-white text-xs font-semibold">
                              {item.priority.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.task}</p>
                            {item.context && (
                              <p className="text-sm text-gray-600 mt-1">{item.context}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{item.assignee}</p>
                          <Badge 
                            variant={
                              item.priority === 'high' ? 'destructive' :
                              item.priority === 'medium' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {item.priority} Priority
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        {item.deadline && (
                          <span className="text-xs text-gray-500">Due: {item.deadline}</span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {item.status === 'completed' ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No action items identified in this meeting.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sentiment" className="mt-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Sentiment Analysis</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('Sentiment Analysis', 'json')}>
                      <FileJson className="w-4 h-4 mr-2" />
                      Export JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('Sentiment Analysis', 'pdf')}>
                      <Printer className="w-4 h-4 mr-2" />
                      Export PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {currentMeeting.sentimentAnalysis ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Overall Sentiment */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Overall Meeting Sentiment</h4>
                      <div className="flex items-center justify-center mb-4">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                          currentMeeting.sentimentAnalysis.overall > 60 ? 'bg-green-500' :
                          currentMeeting.sentimentAnalysis.overall > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          <span className="text-white text-3xl">
                            {currentMeeting.sentimentAnalysis.overall > 60 ? '😊' :
                             currentMeeting.sentimentAnalysis.overall > 40 ? '😐' : '😞'}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold mb-2 ${
                          currentMeeting.sentimentAnalysis.overall > 60 ? 'text-green-600' :
                          currentMeeting.sentimentAnalysis.overall > 40 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {currentMeeting.sentimentAnalysis.overall}%
                        </p>
                        <p className="text-sm text-gray-600">
                          {currentMeeting.sentimentAnalysis.overall > 60 ? 'Positive' :
                           currentMeeting.sentimentAnalysis.overall > 40 ? 'Neutral' : 'Negative'} Sentiment
                        </p>
                      </div>
                    </div>

                    {/* Sentiment Timeline */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Sentiment Timeline</h4>
                      <SentimentChart data={currentMeeting.sentimentAnalysis.timeline} />
                    </div>
                  </div>

                  {/* Topic Breakdown */}
                  {currentMeeting.sentimentAnalysis.topicBreakdown && currentMeeting.sentimentAnalysis.topicBreakdown.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Sentiment Breakdown by Topic</h4>
                      <div className="space-y-4">
                        {currentMeeting.sentimentAnalysis.topicBreakdown.map((topic, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{topic.topic}</p>
                              <p className="text-sm text-gray-600">{topic.timeRange}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-20 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className={`h-2 rounded-full ${
                                    topic.sentiment > 60 ? 'bg-green-500' :
                                    topic.sentiment > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${topic.sentiment}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-medium ${
                                topic.sentiment > 60 ? 'text-green-600' :
                                topic.sentiment > 40 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {topic.sentiment}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No sentiment analysis available.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="speakers" className="mt-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Speaker Analysis</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('Speaker Analysis', 'csv-speakers')}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('Speaker Analysis', 'json')}>
                      <FileJson className="w-4 h-4 mr-2" />
                      Export JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {currentMeeting.speakerAnalysis && currentMeeting.speakerAnalysis.speakers.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Speaking Time Distribution */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Speaking Time Distribution</h4>
                      <div className="space-y-3">
                        {currentMeeting.speakerAnalysis.speakers.map((speaker, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                index % 3 === 0 ? 'bg-primary' :
                                index % 3 === 1 ? 'bg-green-500' : 'bg-yellow-500'
                              }`}>
                                <span className="text-white text-sm font-semibold">{speaker.initials}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{speaker.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className={`h-2 rounded-full ${
                                    index % 3 === 0 ? 'bg-primary' :
                                    index % 3 === 1 ? 'bg-green-500' : 'bg-yellow-500'
                                  }`}
                                  style={{ 
                                    width: `${Math.min(100, (speaker.speakingTime / Math.max(...currentMeeting.speakerAnalysis!.speakers.map(s => s.speakingTime))) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{speaker.speakingTime} min</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Contributors */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Key Contributors</h4>
                      <div className="space-y-4">
                        {currentMeeting.speakerAnalysis.speakers.slice(0, 3).map((speaker, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index % 3 === 0 ? 'bg-primary' :
                              index % 3 === 1 ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                              <span className="text-white text-sm font-semibold">{speaker.initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{speaker.name}</p>
                              <p className="text-xs text-gray-600">{speaker.contribution}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Speaker Insights */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Speaker Insights</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-900">Meeting Balance Analysis</p>
                          <p className="text-sm text-blue-700 mt-1">{currentMeeting.speakerAnalysis.insights}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No speaker analysis available.</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
