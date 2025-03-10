
import React, { useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/lib/supabase';
import { WorkArea } from '@/lib/types';

interface User {
  id: string;
  email: string;
  name: string;
  workArea?: string;
}

interface UserSelectorProps {
  selectedUserIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  workArea?: WorkArea; // Updated to use WorkArea type
}

export const UserSelector: React.FC<UserSelectorProps> = ({ 
  selectedUserIds, 
  onSelectionChange,
  workArea
}) => {
  const [open, setOpen] = React.useState(false);

  // Add error boundary with useEffect to prevent crashes
  useEffect(() => {
    // Log the workArea prop when it changes for debugging
    console.log('UserSelector received workArea:', workArea);
    
    // Return cleanup function
    return () => {
      // Cleanup any subscriptions or event listeners if needed
    };
  }, [workArea]);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users', workArea],
    queryFn: () => {
      console.log(`Fetching users for work area: ${workArea || 'all'}`);
      return getAllUsers(workArea);
    },
    staleTime: 60000, // Cache results for 1 minute to reduce API calls
    // Add error handling in query options
    retry: 1,
    // Log any errors that occur during the query
    onError: (err) => {
      console.error('Error fetching users in UserSelector:', err);
    }
  });

  // Safe handling of user selection to prevent UI crash
  const handleSelect = (userId: string) => {
    try {
      if (selectedUserIds.includes(userId)) {
        onSelectionChange(selectedUserIds.filter(id => id !== userId));
      } else {
        onSelectionChange([...selectedUserIds, userId]);
      }
    } catch (err) {
      console.error('Error handling user selection:', err);
    }
  };

  // Safely filter selected users
  const selectedUsers = React.useMemo(() => {
    try {
      return users.filter(user => selectedUserIds.includes(user.id));
    } catch (err) {
      console.error('Error filtering selected users:', err);
      return [];
    }
  }, [users, selectedUserIds]);

  if (error) {
    console.error('Error loading users:', error);
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={(newOpen) => {
        try {
          setOpen(newOpen);
        } catch (err) {
          console.error('Error toggling popover state:', err);
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // Prevent event bubbling
            }}
          >
            Select users
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          <Command>
            <CommandInput placeholder="Search users..." className="h-9" />
            <CommandEmpty>
              {isLoading ? 'Loading...' : workArea ? `No ${workArea} users found.` : 'No users found.'}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {isLoading ? (
                <CommandItem disabled>Loading users...</CommandItem>
              ) : (
                users.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => {
                      try {
                        handleSelect(user.id);
                      } catch (err) {
                        console.error('Error in onSelect handler:', err);
                      }
                    }}
                    className="flex items-center"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedUserIds.includes(user.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {user.name || user.email}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedUsers.map((user) => (
            <Badge 
              key={user.id} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {user.name || user.email}
              <button
                type="button"
                className="h-4 w-4 rounded-full text-xs font-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // Prevent event bubbling
                  try {
                    handleSelect(user.id);
                  } catch (err) {
                    console.error('Error removing user:', err);
                  }
                }}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
