import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/file-upload";
import MeetingAnalysis from "@/components/meeting-analysis";
import type { Meeting } from "@shared/schema";

export default function Home() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);

  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
  });

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Brain className="text-primary text-2xl" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Intelligent Meeting Summarizer</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                className="bg-primary text-white hover:bg-blue-700"
                onClick={() => setSelectedMeetingId(null)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Processing */}
          <div className="lg:col-span-1">
            <FileUpload onMeetingCreated={setSelectedMeetingId} />
            
            {/* Recent Meetings */}
            {meetings.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Meetings</h3>
                <div className="space-y-2">
                  {meetings.slice(0, 5).map((meeting) => (
                    <button
                      key={meeting.id}
                      onClick={() => setSelectedMeetingId(meeting.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedMeetingId === meeting.id
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-medium text-gray-900 truncate">{meeting.filename}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {meeting.createdAt ? new Date(meeting.createdAt).toLocaleDateString() : 'Recently uploaded'}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          meeting.processingStatus === 'completed' ? 'bg-green-500' :
                          meeting.processingStatus === 'processing' ? 'bg-yellow-500' :
                          meeting.processingStatus === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600 capitalize">{meeting.processingStatus}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {selectedMeeting ? (
              <MeetingAnalysis meeting={selectedMeeting} />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Meeting Analyzer</h3>
                <p className="text-gray-600">Upload a meeting transcript to get started with AI-powered analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
