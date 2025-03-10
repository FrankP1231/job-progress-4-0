
import React, { useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/lib/supabase';
import { WorkArea } from '@/lib/types';

interface User {
  id: string;
  email: string;
  name: string;
  work_area?: string;
}

interface UserSelectorProps {
  selectedUserIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  workArea?: WorkArea;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUserIds,
  onSelectionChange,
  workArea,
}) => {
  const [open, setOpen] = React.useState(false);

  // Debug logging
  useEffect(() => {
    console.log('UserSelector received workArea:', workArea);
  }, [workArea]);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users', workArea],
    queryFn: () => {
      console.log(`Fetching users for work area: ${workArea || 'all'}`);
      return getAllUsers(workArea).catch(err => {
        console.error('Query failed:', err);
        return []; // Return empty array on error to prevent crash
      });
    },
    staleTime: 60000,
    retry: 1,
  });

  const handleSelect = (userId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      console.log('Selecting user:', userId);
      console.log('Current selected users:', selectedUserIds);
      
      if (selectedUserIds.includes(userId)) {
        const newSelected = selectedUserIds.filter(id => id !== userId);
        console.log('Removing user, new selection:', newSelected);
        onSelectionChange(newSelected);
      } else {
        const newSelected = [...selectedUserIds, userId];
        console.log('Adding user, new selection:', newSelected);
        onSelectionChange(newSelected);
      }
    } catch (err) {
      console.error('Error handling user selection:', err);
    }
  };

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
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
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
            {selectedUsers.length > 0
              ? `${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} selected`
              : 'Select users'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          onPointerDownOutside={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onInteractOutside={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
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
                        console.log('User selected via CommandItem:', user.id);
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
                    {user.work_area && <span className="ml-1 text-muted-foreground">({user.work_area})</span>}
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
                    handleSelect(user.id, e);
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
