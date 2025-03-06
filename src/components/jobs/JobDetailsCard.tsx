
import React from 'react';
import { Job } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clipboard, ClipboardList, ExternalLink } from 'lucide-react';

interface JobDetailsCardProps {
  job: Job;
}

const JobDetailsCard: React.FC<JobDetailsCardProps> = ({ job }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-1">
          <div className="text-sm font-medium">Job Number</div>
          <div>{job.jobNumber}</div>
          
          <div className="text-sm font-medium">Project Name</div>
          <div>{job.projectName}</div>
          
          <div className="text-sm font-medium">Buyer/Client</div>
          <div>{job.buyer}</div>
          
          <div className="text-sm font-medium">Project Manager</div>
          <div>{job.salesman}</div>
          
          <div className="text-sm font-medium">Calendar Title</div>
          <div>{job.title || 'Not specified'}</div>
        </div>
        
        {(job.drawingsUrl || job.worksheetUrl) && (
          <>
            <Separator />
            <div className="space-y-2">
              {job.drawingsUrl && (
                <a 
                  href={job.drawingsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  <Clipboard className="mr-1 h-4 w-4" />
                  View Drawings
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
              
              {job.worksheetUrl && (
                <a 
                  href={job.worksheetUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  <ClipboardList className="mr-1 h-4 w-4" />
                  View Worksheet
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default JobDetailsCard;
