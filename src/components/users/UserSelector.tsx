
import React from 'react';
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
  workArea?: WorkArea;
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

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => getAllUsers(),
    staleTime: 60000,
  });

  const handleSelect = (userId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (selectedUserIds.includes(userId)) {
      onSelectionChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedUserIds, userId]);
    }
  };

  // Filter users by workArea if specified
  const filteredUsers = workArea 
    ? users.filter(user => !user.workArea || user.workArea === workArea)
    : users;

  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-10 py-2"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {selectedUsers.length > 0
              ? `${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} selected`
              : 'Select users'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-full p-0 max-w-[calc(100vw-2rem)] sm:max-w-none"
          align="start"
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
          sideOffset={4}
        >
          <Command>
            <CommandInput 
              placeholder="Search users..." 
              className="h-10 text-base sm:text-sm" 
            />
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup className="max-h-[40vh] overflow-auto">
              {isLoading ? (
                <CommandItem disabled>Loading users...</CommandItem>
              ) : (
                filteredUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => {
                      try {
                        handleSelect(user.id);
                      } catch (err) {
                        console.error('Error in onSelect handler:', err);
                      }
                    }}
                    className="flex items-center py-3 px-2 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-5 w-5",
                        selectedUserIds.includes(user.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">
                      {user.name || user.email} {user.workArea && `(${user.workArea})`}
                    </span>
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
              className="flex items-center gap-1 py-1.5 px-3 my-0.5"
            >
              <span className="truncate max-w-[150px]">{user.name || user.email}</span>
              <button
                type="button"
                className="h-5 w-5 rounded-full text-xs font-semibold flex items-center justify-center ml-1 touch-manipulation"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(user.id, e);
                }}
                aria-label={`Remove ${user.name || user.email}`}
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
