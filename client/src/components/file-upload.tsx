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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Meeting Transcript</h2>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragActive 
            ? 'border-primary bg-blue-50' 
            : 'border-gray-300 hover:border-primary hover:bg-blue-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">Drop your transcript here</p>
        <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
        <p className="text-xs text-gray-400">Supports .txt, .docx, .pdf files up to 10MB</p>
        
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
        <div className="mt-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary mr-3" />
              <span className="text-sm font-medium text-primary">Processing transcript...</span>
            </div>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="mt-2" />
        </div>
      )}
    </div>
  );
}
