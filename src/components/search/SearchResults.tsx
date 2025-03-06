
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Job } from '@/lib/types';

// This is a placeholder function - in a real app, this would query your database
const searchJobs = async (query: string): Promise<Job[]> => {
  // This is a mock implementation. In a real app, you would:
  // 1. Call your Supabase or API endpoint
  // 2. Return the search results
  console.log('Searching for:', query);
  
  // For now, we'll return an empty array
  return [];
};

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchJobs(query),
    enabled: !!query,
  });

  if (error) {
    console.error('Search error:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Search Results for "{query}"</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-20 border-t-primary rounded-full" />
        </div>
      ) : results && results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <h3 className="font-medium">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.projectName}</p>
              <Button asChild className="mt-2" variant="outline" size="sm">
                <Link to={`/jobs/${job.id}`}>View Details</Link>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-muted-foreground mt-1">Try different keywords or check the spelling</p>
        </div>
      )}

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default SearchResults;
