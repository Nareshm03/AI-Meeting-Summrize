import { useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AnimatedCard } from '@/components/ui/animated-card';
import { FileText, Clock, Users, TrendingUp } from 'lucide-react';
import { gsap } from '@/lib/animations';
import type { Meeting } from '@shared/schema';

interface MeetingCardProps {
  meeting: Meeting;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export function MeetingCard({ meeting, isSelected, onClick, index }: MeetingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current && index < 5) { // Only animate first 5 cards for performance
      // Simplified stagger animation
      gsap.fromTo(cardRef.current, 
        { opacity: 0, y: 10 }, // Reduced movement
        { 
          opacity: 1, 
          y: 0,
          duration: 0.3, // Reduced duration
          delay: index * 0.05, // Reduced stagger
          ease: "power2.out" // Simpler easing
        }
      );
    } else if (cardRef.current) {
      // Just fade in for cards beyond the first 5
      gsap.set(cardRef.current, { opacity: 1 });
    }
  }, [index]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'processing': return '⏳';
      case 'failed': return '✗';
      default: return '○';
    }
  };

  return (
    <div ref={cardRef}>
      <AnimatedCard
        className={`cursor-pointer transition-all duration-300 ${
          isSelected 
            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' 
            : 'hover:shadow-lg hover:scale-[1.02]'
        }`}
        onClick={onClick}
        animation="scale"
        hover={!isSelected}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <h3 className="font-medium text-sm truncate max-w-[200px]" title={meeting.filename}>
                {meeting.filename}
              </h3>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(meeting.processingStatus)}`}>
              <span>{getStatusIcon(meeting.processingStatus)}</span>
              {meeting.processingStatus}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {meeting.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(meeting.createdAt).toLocaleDateString()}
              </div>
            )}
            {meeting.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {meeting.duration}m
              </div>
            )}
            {meeting.participantCount && meeting.participantCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {meeting.participantCount} participants
              </div>
            )}
            {meeting.sentimentAnalysis?.overall && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {meeting.sentimentAnalysis.overall}% positive
              </div>
            )}
          </div>

          {/* Summary Preview */}
          {meeting.summary && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {meeting.summary}
              </p>
            </div>
          )}

          {/* Action Items Count */}
          {meeting.actionItems && meeting.actionItems.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Action Items</span>
              <Badge variant="secondary" className="text-xs">
                {meeting.actionItems.length}
              </Badge>
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
}

// Skeleton loader for meeting cards
export function MeetingCardSkeleton({ index }: { index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      // Simplified entrance animation
      gsap.fromTo(cardRef.current,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 0.3,
          delay: index * 0.05,
          ease: "power2.out"
        }
      );

      // Simplified pulse animation using CSS instead of GSAP for better performance
      const skeletons = cardRef.current.querySelectorAll('.skeleton');
      skeletons.forEach(skeleton => {
        (skeleton as HTMLElement).style.animation = 'pulse 2s ease-in-out infinite';
      });
    }
  }, [index]);

  return (
    <div ref={cardRef}>
      <AnimatedCard className="animate-pulse">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="skeleton w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="skeleton w-32 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="skeleton w-16 h-6 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="skeleton w-20 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="skeleton w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
          
          <div className="space-y-2">
            <div className="skeleton w-full h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="skeleton w-3/4 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}