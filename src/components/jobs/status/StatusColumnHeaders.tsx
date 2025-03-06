
import React from 'react';
import { TableHead, TableRow } from '@/components/ui/table';
import { Wrench, Scissors, Package, Palette, Truck } from 'lucide-react';

const StatusColumnHeaders: React.FC = () => {
  return (
    <TableRow className="bg-gray-50 border-y border-gray-200">
      <TableHead className="font-semibold text-gray-700 py-3">Phase</TableHead>
      <TableHead className="text-center font-semibold text-gray-700 py-3">
        <div className="flex items-center justify-center">
          <Wrench className="mr-1.5 h-4 w-4 text-gray-500" />
          <span>Welding</span>
        </div>
      </TableHead>
      <TableHead className="text-center font-semibold text-gray-700 py-3">
        <div className="flex items-center justify-center">
          <Scissors className="mr-1.5 h-4 w-4 text-gray-500" />
          <span>Sewing</span>
        </div>
      </TableHead>
      <TableHead className="text-center font-semibold text-gray-700 py-3">
        <div className="flex items-center justify-center">
          <Package className="mr-1.5 h-4 w-4 text-gray-500" />
          <span>Installation</span>
        </div>
      </TableHead>
      <TableHead className="text-center font-semibold text-gray-700 py-3">
        <div className="flex items-center justify-center">
          <Palette className="mr-1.5 h-4 w-4 text-gray-500" />
          <span>Powder Coat</span>
        </div>
      </TableHead>
      <TableHead className="text-center font-semibold text-gray-700 py-3">
        <div className="flex items-center justify-center">
          <Truck className="mr-1.5 h-4 w-4 text-gray-500" />
          <span>Install Crew</span>
        </div>
      </TableHead>
    </TableRow>
  );
};

export default StatusColumnHeaders;
