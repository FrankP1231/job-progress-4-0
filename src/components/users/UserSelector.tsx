
import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserSelectorProps {
  selectedUserIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ 
  selectedUserIds, 
  onSelectionChange 
}) => {
  const [open, setOpen] = React.useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  const handleSelect = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onSelectionChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedUserIds, userId]);
    }
  };

  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            type="button"
          >
            Select users
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search users..." className="h-9" />
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {isLoading ? (
                <CommandItem disabled>Loading users...</CommandItem>
              ) : (
                users.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleSelect(user.id)}
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
                onClick={() => handleSelect(user.id)}
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
