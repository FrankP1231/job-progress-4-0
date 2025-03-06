
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative w-full max-w-sm ${className}`}>
      <div className="relative flex w-full items-center">
        <Input
          type="text"
          placeholder="Search jobs or projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        <Button 
          type="submit" 
          variant="ghost" 
          size="icon"
          className="absolute right-0 h-full"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
