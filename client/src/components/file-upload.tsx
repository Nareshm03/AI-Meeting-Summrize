import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
      onMeetingCreated(data.meetingId);
      setUploadProgress(0);
      toast({
        title: "Upload successful",
        description: "Your meeting transcript is being analyzed.",
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
    // Validate file type
    const allowedTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
    const allowedExtensions = ['.txt', '.docx', '.pdf'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt, .docx, or .pdf file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
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
    <div className="bg-card rounded-xl shadow-lg border border-border p-6 transition-all duration-300 hover:shadow-xl group">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <CloudUpload className="w-5 h-5 mr-2 text-primary" />
        Upload Meeting Transcript
      </h2>
      
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
            {dragActive ? 'Release to upload' : 'Drop your transcript here'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
          <div className="flex justify-center space-x-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">.txt</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">.docx</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">.pdf</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Maximum file size: 10MB</p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".txt,.docx,.pdf"
          onChange={handleFileSelect}
        />
      </div>

      {/* Processing Status */}
      {uploadMutation.isPending && (
        <div className="mt-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center">
              <div className="relative">
                <Loader2 className="w-5 h-5 animate-spin text-primary mr-3" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
              </div>
              <div>
                <span className="text-sm font-medium text-primary">Processing transcript...</span>
                <p className="text-xs text-muted-foreground">AI is analyzing your meeting</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-primary">{uploadProgress}%</span>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={uploadProgress} className="h-2 transition-all duration-300" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Uploading...</span>
              <span>Analyzing content...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
