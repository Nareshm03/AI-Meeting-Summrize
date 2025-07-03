import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Meeting } from "@shared/schema";

interface MeetingDebugProps {
  meetingId: number;
}

export default function MeetingDebug({ meetingId }: MeetingDebugProps) {
  const { data: meeting, isLoading, error } = useQuery<Meeting>({
    queryKey: ["/api/meetings", meetingId],
    enabled: !!meetingId,
  });

  if (isLoading) return <div>Loading meeting data...</div>;
  if (error) return <div>Error loading meeting: {String(error)}</div>;
  if (!meeting) return <div>No meeting data found</div>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Meeting Debug Info
          <Badge variant={meeting.processingStatus === 'completed' ? 'default' : 'secondary'}>
            {meeting.processingStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold">Basic Info:</h4>
          <ul className="text-sm space-y-1">
            <li>ID: {meeting.id}</li>
            <li>Filename: {meeting.filename}</li>
            <li>Status: {meeting.processingStatus}</li>
            <li>Created: {meeting.createdAt ? new Date(meeting.createdAt).toLocaleString() : 'N/A'}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Analysis Data:</h4>
          <ul className="text-sm space-y-1">
            <li>Has Summary: {meeting.summary ? '✅ Yes' : '❌ No'}</li>
            <li>Summary Length: {meeting.summary?.length || 0} chars</li>
            <li>Key Points: {meeting.keyPoints?.length || 0} items</li>
            <li>Decisions: {meeting.decisions?.length || 0} items</li>
            <li>Action Items: {meeting.actionItems?.length || 0} items</li>
            <li>Duration: {meeting.duration || 'N/A'} minutes</li>
            <li>Participants: {meeting.participantCount || 'N/A'}</li>
          </ul>
        </div>

        {meeting.summary && (
          <div>
            <h4 className="font-semibold">Summary Preview:</h4>
            <p className="text-sm bg-gray-50 p-2 rounded">
              {meeting.summary.substring(0, 200)}...
            </p>
          </div>
        )}

        {meeting.keyPoints && meeting.keyPoints.length > 0 && (
          <div>
            <h4 className="font-semibold">Key Points:</h4>
            <ul className="text-sm list-disc list-inside space-y-1">
              {meeting.keyPoints.slice(0, 3).map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {meeting.actionItems && meeting.actionItems.length > 0 && (
          <div>
            <h4 className="font-semibold">Action Items:</h4>
            <ul className="text-sm list-disc list-inside space-y-1">
              {meeting.actionItems.slice(0, 3).map((item, index) => (
                <li key={index}>
                  {typeof item === 'string' ? item : item.task || 'Unknown task'}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="font-semibold">Raw Data (JSON):</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(meeting, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}