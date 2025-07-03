import { useEffect, useState } from 'react';

interface PerformanceStats {
  fps: number;
  memoryUsage: number;
  renderTime: number;
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // @ts-ignore - memory API might not be available in all browsers
        const memoryUsage = (performance.memory?.usedJSHeapSize || 0) / 1024 / 1024;
        
        setStats({
          fps,
          memoryUsage: Math.round(memoryUsage),
          renderTime: Math.round(currentTime - lastTime)
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    measurePerformance();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Toggle visibility with Ctrl+Shift+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 backdrop-blur-sm">
      <div className="space-y-1">
        <div className={`flex justify-between gap-4 ${stats.fps < 30 ? 'text-red-400' : stats.fps < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
          <span>FPS:</span>
          <span>{stats.fps}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Memory:</span>
          <span>{stats.memoryUsage}MB</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Render:</span>
          <span>{stats.renderTime}ms</span>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-2 border-t border-gray-600 pt-1">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}