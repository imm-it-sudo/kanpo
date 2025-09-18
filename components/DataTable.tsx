import React from 'react';
import type { ExtractedData } from '../types';
import { Button } from './Button';

interface DataTableProps {
  data: ExtractedData[];
  onDownloadCsv: () => void;
  onClearData: () => void;
  onDeleteRow: (id: number) => void;
  selectedRows: number[];
  onSelectionChange: (id: number | 'all', checked: boolean) => void;
  onDeleteSelected: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  onDownloadCsv, 
  onClearData, 
  onDeleteRow,
  selectedRows,
  onSelectionChange,
  onDeleteSelected
}) => {
  const allKeys = React.useMemo(() => {
    const keySet = new Set<string>();
    data.forEach(entry => {
      Object.keys(entry.data).forEach(key => keySet.add(key));
    });
    return Array.from(keySet).sort();
  }, [data]);

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-white">Extracted Data</h2>
        <div className="flex items-center space-x-2">
           {selectedRows.length > 0 && (
            <Button onClick={onDeleteSelected} variant="danger">
              {`Delete Selected (${selectedRows.length})`}
            </Button>
          )}
          <Button onClick={onClearData} disabled={data.length === 0} variant="danger">
            Clear All
          </Button>
          <Button onClick={onDownloadCsv} disabled={data.length === 0} variant="secondary">
            Download CSV
          </Button>
        </div>
      </div>
      <div className="flex-grow overflow-auto border border-gray-700 rounded-lg bg-brand-dark/50">
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="sticky left-0 bg-gray-800/50 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-500 bg-brand-dark text-brand-primary focus:ring-brand-primary"
                      checked={isAllSelected}
                      onChange={(e) => onSelectionChange('all', e.target.checked)}
                      aria-label="Select all rows"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Image Name</th>
                  {allKeys.map(key => (
                    <th key={key} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{key}</th>
                  ))}
                  <th scope="col" className="sticky right-0 bg-gray-800/50 px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.map((row) => (
                  <tr key={row.id} className="group transition-colors hover:bg-gray-700/30">
                     <td className="sticky left-0 px-4 py-3 whitespace-nowrap bg-brand-gray group-hover:bg-gray-700/40">
                       <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-500 bg-brand-dark text-brand-primary focus:ring-brand-primary"
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => onSelectionChange(row.id, e.target.checked)}
                        aria-label={`Select row for ${row.imageName}`}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200 truncate max-w-xs">{row.imageName}</td>
                    {allKeys.map(key => (
                      <td key={`${row.id}-${key}`} className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{row.data[key] ?? 'N/A'}</td>
                    ))}
                    <td className="sticky right-0 px-4 py-3 whitespace-nowrap text-sm text-right bg-brand-gray group-hover:bg-gray-700/40">
                      <button 
                        onClick={() => onDeleteRow(row.id)} 
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        aria-label={`Delete row for ${row.imageName}`}
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Processed data will appear here.</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Data is saved automatically in your browser's local storage.
      </p>
    </div>
  );
};