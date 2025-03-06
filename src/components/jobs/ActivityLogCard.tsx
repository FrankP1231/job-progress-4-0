
import React from 'react';
import { format } from 'date-fns';
import { ActivityLog } from '@/lib/supabase/activityLogUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, Clock } from 'lucide-react';
import ActivityLogExport from './ActivityLogExport';
import { Job } from '@/lib/types';

interface ActivityLogCardProps {
  activities: ActivityLog[];
  maxHeight?: string;
  job?: Job; // Optional job for export functionality
}

const ActivityLogCard: React.FC<ActivityLogCardProps> = ({ 
  activities, 
  maxHeight = "400px",
  job 
}) => {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <ClipboardList className="mr-2 h-4 w-4" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activities recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-lg">
          <ClipboardList className="mr-2 h-4 w-4" />
          Activity Log
        </CardTitle>
        {job && <ActivityLogExport activities={activities} job={job} />}
      </CardHeader>
      <CardContent>
        <ScrollArea className={`h-[${maxHeight}]`}>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border-b pb-3 mb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{activity.description}</p>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityLogCard;
