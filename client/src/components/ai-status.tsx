import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, Zap, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AIStatus {
  currentProvider: string;
  status: 'full' | 'limited';
  message: string;
}

export default function AIStatus() {
  const { data: aiStatus } = useQuery<AIStatus>({
    queryKey: ['/api/ai-status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/ai-status');
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  if (!aiStatus) return null;

  const getStatusIcon = () => {
    switch (aiStatus.status) {
      case 'full':
        return <Brain className="h-4 w-4" />;
      case 'limited':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (aiStatus.status) {
      case 'full':
        return 'bg-green-500 hover:bg-green-600';
      case 'limited':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={`${getStatusColor()} text-white cursor-help flex items-center gap-1`}
          >
            {getStatusIcon()}
            <span className="text-xs">
              {aiStatus.currentProvider} AI
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{aiStatus.message}</p>
          {aiStatus.status === 'limited' && (
            <p className="text-xs text-muted-foreground mt-1">
              Add OpenAI or Groq API key for enhanced analysis
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}