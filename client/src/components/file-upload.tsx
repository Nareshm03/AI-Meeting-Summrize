import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AnimatedCard } from "@/components/ui/animated-card";
import { UploadLoader, TranscriptionLoader, AIProcessingLoader } from "@/components/ui/animated-loader";
import { AnimatedProgress, StepProgress } from "@/components/ui/animated-progress";
import { AnimatedTooltip, InfoTooltip } from "@/components/ui/animated-tooltip";

interface FileUploadProps {
  onMeetingCreated: (meetingId: number) => void;
}

export default function FileUpload({ onMeetingCreated }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('transcript', file);
      
      const response = await apiRequest('POST', '/api/meetings/upload', formData);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-status'] });
      onMeetingCreated(data.meetingId);
      setUploadProgress(0);
      toast({
        title: "✅ Upload successful!",
        description: "Your meeting content is being processed and analyzed with AI. Video/audio files will be transcribed first. Check back in a few moments for results.",
      });
    },
    onError: (error) => {
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type - now includes video and audio files
    const allowedTypes = [
      'text/plain', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/pdf',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/webm',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'audio/mpeg'
    ];
    const allowedExtensions = ['.txt', '.docx', '.pdf', '.mp4', '.avi', '.mov', '.wmv', '.webm', '.mp3', '.wav', '.m4a'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      toast({
        title: "Invalid file type",
        description: "Please upload a text file (.txt, .docx, .pdf) or video/audio file (.mp4, .avi, .mov, .mp3, .wav, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size - increased for video files (100MB)
    const maxSize = file.type.startsWith('video/') || file.type.startsWith('audio/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Please upload a file smaller than ${file.type.startsWith('video/') || file.type.startsWith('audio/') ? '100MB' : '10MB'}.`,
        variant: "destructive",
      });
      return;
    }

    // Simulate upload progress
    setUploadProgress(25);
    setTimeout(() => setUploadProgress(50), 500);
    setTimeout(() => setUploadProgress(75), 1000);

    uploadMutation.mutate(file);
  };

  return (
    <AnimatedCard
      title="Upload Meeting Content"
      icon={<CloudUpload className="w-5 h-5 text-primary" />}
      gradient="blue"
      animation="slideUp"
      className="group"
    >
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer relative overflow-hidden ${
          dragActive 
            ? 'border-primary bg-primary/10 scale-105 shadow-lg' 
            : 'border-border hover:border-primary hover:bg-primary/5 hover:shadow-md'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className={`relative z-10 transition-transform duration-300 ${dragActive ? 'scale-110' : 'group-hover:scale-105'}`}>
          <CloudUpload className={`w-12 h-12 mx-auto mb-4 transition-all duration-300 ${
            dragActive ? 'text-primary animate-bounce' : 'text-muted-foreground group-hover:text-primary'
          }`} />
          <p className="text-lg font-medium text-foreground mb-2 transition-colors">
            {dragActive ? 'Release to upload' : 'Drop your meeting file here'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
          <div className="flex justify-center flex-wrap gap-2 text-xs text-muted-foreground mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">📄 .txt</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">📄 .docx</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">📄 .pdf</span>
          </div>
          <div className="flex justify-center flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">🎥 .mp4</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">🎥 .avi</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">🎵 .mp3</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">🎵 .wav</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Text files: 10MB max • Video/Audio: 100MB max</p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".txt,.docx,.pdf,.mp4,.avi,.mov,.wmv,.webm,.mp3,.wav,.m4a"
          onChange={handleFileSelect}
        />
      </div>

      {/* Processing Status */}
      {uploadMutation.isPending && (
        <div className="mt-6 space-y-6">
          {/* Main Processing Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 rounded-xl border border-blue-200 dark:border-blue-800">
            <AIProcessingLoader />
            <div className="mt-4 text-center">
              <div className="text-lg font-bold text-primary">{uploadProgress}%</div>
              <p className="text-sm text-muted-foreground">Processing your meeting content...</p>
            </div>
          </div>

          {/* Step Progress */}
          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-border">
            <StepProgress
              steps={['Upload', 'Transcribe', 'Analyze', 'Complete']}
              currentStep={Math.floor(uploadProgress / 25)}
              animated={true}
            />
          </div>

          {/* Detailed Progress */}
          <div className="space-y-4">
            <AnimatedProgress
              value={uploadProgress}
              variant="gradient"
              color="blue"
              size="lg"
              showValue={true}
              animated={true}
            />
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <InfoTooltip info="File is being uploaded to our secure servers">
                <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                  <UploadLoader size="sm" />
                  <span className="text-muted-foreground">Uploading...</span>
                </div>
              </InfoTooltip>
              
              <InfoTooltip info="AI is transcribing and analyzing your meeting content">
                <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                  <TranscriptionLoader size="sm" />
                  <span className="text-muted-foreground">Analyzing...</span>
                </div>
              </InfoTooltip>
            </div>
          </div>
        </div>
      )}
    </AnimatedCard>
  );
}
