import type { Meeting } from "@shared/schema";

export function exportToJSON(meeting: Meeting, filename?: string) {
  const data = {
    meetingInfo: {
      filename: meeting.filename,
      date: meeting.createdAt,
      duration: meeting.duration,
      participants: meeting.participantCount,
    },
    summary: meeting.summary,
    keyPoints: meeting.keyPoints,
    decisions: meeting.decisions,
    nextSteps: meeting.nextSteps,
    actionItems: meeting.actionItems,
    sentimentAnalysis: meeting.sentimentAnalysis,
    speakerAnalysis: meeting.speakerAnalysis,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `meeting-analysis-${meeting.filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(meeting: Meeting, type: 'actions' | 'speakers', filename?: string) {
  let csvContent = '';
  let defaultFilename = '';

  if (type === 'actions' && meeting.actionItems) {
    csvContent = 'Task,Assignee,Priority,Deadline,Context,Status\n';
    csvContent += meeting.actionItems.map(item => 
      `"${item.task}","${item.assignee}","${item.priority}","${item.deadline || ''}","${item.context}","${item.status}"`
    ).join('\n');
    defaultFilename = `action-items-${meeting.filename}.csv`;
  } else if (type === 'speakers' && meeting.speakerAnalysis) {
    csvContent = 'Name,Speaking Time (minutes),Contribution\n';
    csvContent += meeting.speakerAnalysis.speakers.map(speaker => 
      `"${speaker.name}","${speaker.speakingTime}","${speaker.contribution}"`
    ).join('\n');
    defaultFilename = `speakers-${meeting.filename}.csv`;
  }

  if (csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export function exportToPDF(meeting: Meeting, filename?: string) {
  // For PDF export, we'll create an HTML representation and use browser's print functionality
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Meeting Analysis - ${meeting.filename}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #3b82f6; border-left: 4px solid #3b82f6; padding-left: 10px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
        .action-item { border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 10px; border-radius: 8px; }
        .priority-high { border-left: 4px solid #ef4444; }
        .priority-medium { border-left: 4px solid #f59e0b; }
        .priority-low { border-left: 4px solid #6b7280; }
        .speaker { margin-bottom: 15px; padding: 10px; background-color: #f9fafb; border-radius: 6px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Meeting Analysis Report</h1>
        <p><strong>File:</strong> ${meeting.filename}</p>
        <p><strong>Date:</strong> ${meeting.createdAt ? new Date(meeting.createdAt).toLocaleDateString() : 'N/A'}</p>
      </div>

      <div class="stats">
        <div class="stat-card">
          <h3>Duration</h3>
          <p>${meeting.duration || 'N/A'} minutes</p>
        </div>
        <div class="stat-card">
          <h3>Participants</h3>
          <p>${meeting.participantCount || 'N/A'}</p>
        </div>
        <div class="stat-card">
          <h3>Action Items</h3>
          <p>${meeting.actionItems?.length || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Sentiment Score</h3>
          <p>${meeting.sentimentAnalysis?.overall || 'N/A'}%</p>
        </div>
      </div>

      ${meeting.summary ? `
        <div class="section">
          <h2>Meeting Summary</h2>
          <p>${meeting.summary}</p>
        </div>
      ` : ''}

      ${meeting.keyPoints?.length ? `
        <div class="section">
          <h2>Key Discussion Points</h2>
          <ul>
            ${meeting.keyPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${meeting.decisions?.length ? `
        <div class="section">
          <h2>Decisions Made</h2>
          <ul>
            ${meeting.decisions.map(decision => `<li>${decision}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${meeting.actionItems?.length ? `
        <div class="section">
          <h2>Action Items</h2>
          ${meeting.actionItems.map(item => `
            <div class="action-item priority-${item.priority}">
              <h4>${item.task}</h4>
              <p><strong>Assignee:</strong> ${item.assignee}</p>
              <p><strong>Priority:</strong> ${item.priority}</p>
              ${item.deadline ? `<p><strong>Deadline:</strong> ${item.deadline}</p>` : ''}
              ${item.context ? `<p><strong>Context:</strong> ${item.context}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${meeting.speakerAnalysis?.speakers?.length ? `
        <div class="section">
          <h2>Speaker Analysis</h2>
          ${meeting.speakerAnalysis.speakers.map(speaker => `
            <div class="speaker">
              <h4>${speaker.name} (${speaker.speakingTime} minutes)</h4>
              <p>${speaker.contribution}</p>
            </div>
          `).join('')}
          <p><strong>Insights:</strong> ${meeting.speakerAnalysis.insights}</p>
        </div>
      ` : ''}

      ${meeting.nextSteps?.length ? `
        <div class="section">
          <h2>Next Meeting Topics</h2>
          <ul>
            ${meeting.nextSteps.map(step => `<li>${step}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </body>
    </html>
  `;

  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.print();
  }
}