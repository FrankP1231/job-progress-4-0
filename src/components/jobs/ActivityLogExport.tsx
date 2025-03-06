
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ActivityLog } from '@/lib/supabase/activityLogUtils';
import { format } from 'date-fns';
import { Job } from '@/lib/types';

interface ActivityLogExportProps {
  activities: ActivityLog[];
  job: Job;
}

const ActivityLogExport: React.FC<ActivityLogExportProps> = ({ activities, job }) => {
  const exportToPDF = () => {
    // This is a simple implementation that will open a new window with formatted content
    // In a production app, you would use a library like jsPDF or react-pdf
    
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      alert('Please allow popups for this website');
      return;
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Activity Log - Job ${job.jobNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
          }
          h1 {
            color: #333;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
          }
          .activity {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
          }
          .timestamp {
            color: #777;
            font-size: 0.8em;
          }
          .header-info {
            margin-bottom: 20px;
            color: #555;
          }
        </style>
      </head>
      <body>
        <h1>Activity Log - Job ${job.jobNumber}</h1>
        <div class="header-info">
          <p><strong>Project:</strong> ${job.projectName}</p>
          <p><strong>Buyer/Client:</strong> ${job.buyer}</p>
          <p><strong>Project Manager:</strong> ${job.salesman}</p>
          <p><strong>Generated:</strong> ${format(new Date(), 'MMMM d, yyyy h:mm a')}</p>
        </div>
        
        <h2>Activities</h2>
        ${activities.map(activity => `
          <div class="activity">
            <p>${activity.description}</p>
            <div class="timestamp">${format(new Date(activity.createdAt), 'MMMM d, yyyy h:mm a')}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    newWindow.document.write(html);
    newWindow.document.close();
    setTimeout(() => {
      newWindow.print();
    }, 500);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={exportToPDF}
      disabled={activities.length === 0}
      className="flex items-center"
    >
      <Download className="h-4 w-4 mr-2" />
      Export Log
    </Button>
  );
};

export default ActivityLogExport;
