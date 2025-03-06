
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllJobs } from '@/lib/supabase/jobUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, Scissors, PackageCheck } from 'lucide-react';
import { useProductionPhases } from '@/hooks/useProductionPhases';
import WeldingTabContent from './WeldingTabContent';
import SewingTabContent from './SewingTabContent';
import ReadyForInstallTabContent from './ReadyForInstallTabContent';

const ProductionOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'welding' | 'sewing' | 'readyForInstall'>('welding');
  
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: getAllJobs
  });

  const {
    weldingPhases,
    sewingPhases, 
    readyForInstallPhases,
    totalWeldingHours,
    totalSewingHours,
    totalInstallHours
  } = useProductionPhases(jobs);

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-20 border-t-primary rounded-full" />
    </div>;
  }

  if (error) {
    console.error('Error fetching jobs:', error);
    return <div className="text-red-500">Error loading jobs</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Production Overview</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'welding' | 'sewing' | 'readyForInstall')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="welding" className="flex items-center">
            <Wrench className="mr-2 h-4 w-4" />
            Welding ({weldingPhases.length})
          </TabsTrigger>
          <TabsTrigger value="sewing" className="flex items-center">
            <Scissors className="mr-2 h-4 w-4" />
            Sewing ({sewingPhases.length})
          </TabsTrigger>
          <TabsTrigger value="readyForInstall" className="flex items-center">
            <PackageCheck className="mr-2 h-4 w-4" />
            Ready for Install ({readyForInstallPhases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="welding" className="mt-6">
          <WeldingTabContent 
            weldingPhases={weldingPhases} 
            totalWeldingHours={totalWeldingHours} 
          />
        </TabsContent>

        <TabsContent value="sewing" className="mt-6">
          <SewingTabContent 
            sewingPhases={sewingPhases} 
            totalSewingHours={totalSewingHours} 
          />
        </TabsContent>

        <TabsContent value="readyForInstall" className="mt-6">
          <ReadyForInstallTabContent 
            readyForInstallPhases={readyForInstallPhases} 
            totalInstallHours={totalInstallHours} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionOverview;
