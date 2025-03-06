
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getJobById } from '@/lib/supabase/jobUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wrench, Scissors } from 'lucide-react';
import ProductionPhasesTab from './ProductionPhasesTab';

const ProductionLaborView: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [activeTab, setActiveTab] = useState<'welding' | 'sewing'>('welding');
  
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId || ''),
    enabled: !!jobId
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-20 border-t-primary rounded-full" />
    </div>;
  }

  if (error) {
    console.error('Error fetching job:', error);
    return <div className="text-red-500">Error loading job</div>;
  }

  if (!job) {
    return <div className="text-center py-6">Job not found</div>;
  }

  // Filter phases based on active tab
  const weldingPhases = job.phases.filter(phase => phase.weldingLabor.status !== 'not-needed');
  const sewingPhases = job.phases.filter(phase => phase.sewingLabor.status !== 'not-needed');

  // Calculate total estimated hours
  const totalWeldingHours = weldingPhases.reduce((total, phase) => {
    return total + (phase.weldingLabor.hours || 0);
  }, 0);

  const totalSewingHours = sewingPhases.reduce((total, phase) => {
    return total + (phase.sewingLabor.hours || 0);
  }, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/production">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{job.projectName || job.jobNumber}</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'welding' | 'sewing')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="welding" className="flex items-center">
            <Wrench className="mr-2 h-4 w-4" />
            Welding ({weldingPhases.length})
          </TabsTrigger>
          <TabsTrigger value="sewing" className="flex items-center">
            <Scissors className="mr-2 h-4 w-4" />
            Sewing ({sewingPhases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="welding" className="mt-6">
          <ProductionPhasesTab 
            phases={weldingPhases} 
            tabType="welding" 
            totalHours={totalWeldingHours}
          />
        </TabsContent>

        <TabsContent value="sewing" className="mt-6">
          <ProductionPhasesTab 
            phases={sewingPhases} 
            tabType="sewing"
            totalHours={totalSewingHours}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionLaborView;
