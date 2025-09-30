'use client';

import { useEffect, useState } from 'react';
import type { Company } from '@/db/schema';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
  ColumnResizeMode,
} from '@tanstack/react-table';

// Type for the nested response content structure
type ResponseContent = Record<string, unknown>;

export function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: Company;
    field: string;
    value: unknown;
  } | null>(null);
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      setCompanies(data.companies);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const deleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      const response = await fetch(`/api/companies?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete company');
      }

      // Close sidebar if the deleted company is selected
      if (selectedCell?.row.id === id) {
        setSelectedCell(null);
      }

      // Refresh the list
      await fetchCompanies();
    } catch (error) {
      console.error('Failed to delete company:', error);
      alert('Failed to delete company. Please try again.');
    }
  };

  useEffect(() => {
    fetchCompanies();

    // Poll every 20 seconds for updates
    const interval = setInterval(fetchCompanies, 20000);
    return () => clearInterval(interval);
  }, []);

  const columns: ColumnDef<Company>[] = [
    {
      id: 'url',
      accessorKey: 'url',
      header: 'Company URL',
      size: 250,
      minSize: 150,
      maxSize: 500,
      cell: ({ getValue, row }) => {
        const url = getValue() as string;
        return (
          <div
            className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
            onClick={() => setSelectedCell({ row: row.original, field: 'URL', value: url })}
            title={url}
          >
            {url}
          </div>
        );
      },
    },
    {
      id: 'fitScore',
      accessorKey: 'fitScore',
      header: 'Fit Score',
      size: 100,
      minSize: 80,
      maxSize: 120,
      cell: ({ getValue, row }) => {
        const score = getValue() as string | null;
        if (!score) {
          return <span className="text-gray-400 text-sm">—</span>;
        }
        const numScore = parseInt(score.split('/')[0]);
        const color = numScore >= 8 ? 'text-green-600' : 
                      numScore >= 6 ? 'text-yellow-600' : 
                      numScore >= 4 ? 'text-orange-600' : 'text-red-600';
        return (
          <div
            className={`text-2xl font-bold ${color} cursor-pointer`}
            onClick={() => setSelectedCell({ row: row.original, field: 'Fit Score', value: score })}
            title={score}
          >
            {score}
          </div>
        );
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      minSize: 100,
      maxSize: 150,
      cell: ({ getValue, row }) => {
        const status = getValue() as string;
        const colors = {
          pending: 'bg-gray-200 text-gray-800',
          processing: 'bg-blue-200 text-blue-800',
          completed: 'bg-green-200 text-green-800',
          failed: 'bg-red-200 text-red-800',
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${colors[status as keyof typeof colors] || colors.pending} cursor-pointer`}
            onClick={() => setSelectedCell({ row: row.original, field: 'Status', value: status })}
            title={status}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: 'pitch',
      accessorKey: 'pitch',
      header: 'Best Pitch',
      size: 400,
      minSize: 200,
      maxSize: 600,
      cell: ({ getValue, row }) => {
        const pitch = getValue() as string | null;
        if (!pitch) {
          return <span className="text-gray-400 text-sm">—</span>;
        }
        return (
          <div
            className="text-sm text-gray-700 truncate cursor-pointer hover:text-blue-600"
            onClick={() => setSelectedCell({ row: row.original, field: 'Best Pitch', value: pitch })}
            title={pitch}
          >
            {pitch}
          </div>
        );
      },
    },
    {
      id: 'executiveSummary',
      accessorFn: (row) => {
        const response = row.response as ResponseContent | null;
        const content = response?.content as ResponseContent | undefined;
        return (content?.executive_summary || response?.executive_summary) as string | undefined;
      },
      header: 'Executive Summary',
      size: 350,
      minSize: 200,
      maxSize: 600,
      cell: ({ getValue, row }) => {
        const value = getValue() as string | undefined;
        if (!value) {
          return <span className="text-gray-400 text-sm">—</span>;
        }
        return (
          <div
            className="text-sm text-gray-700 truncate cursor-pointer hover:text-blue-600"
            onClick={() => setSelectedCell({ row: row.original, field: 'Executive Summary', value })}
            title={value}
          >
            {value}
          </div>
        );
      },
    },
    {
      id: 'keyAIApplications',
      accessorFn: (row) => {
        const response = row.response as ResponseContent | null;
        const content = response?.content as ResponseContent | undefined;
        return (content?.key_ai_applications || response?.key_ai_applications) as unknown[] | undefined;
      },
      header: 'Key AI Applications',
      size: 180,
      minSize: 120,
      maxSize: 250,
      cell: ({ getValue, row }) => {
        const value = getValue() as unknown[] | undefined;
        if (!value || !Array.isArray(value)) {
          return <span className="text-gray-400 text-sm">—</span>;
        }
        const text = `${value.length} application${value.length !== 1 ? 's' : ''}`;
        return (
          <div
            className="text-sm text-gray-700 truncate cursor-pointer hover:text-blue-600"
            onClick={() => setSelectedCell({ row: row.original, field: 'Key AI Applications', value })}
            title={text}
          >
            {text}
          </div>
        );
      },
    },
    {
      id: 'techPartners',
      accessorFn: (row) => {
        const response = row.response as ResponseContent | null;
        const content = response?.content as ResponseContent | undefined;
        return (content?.technology_and_ai_partners || response?.technology_and_ai_partners) as unknown[] | undefined;
      },
      header: 'Tech Partners',
      size: 150,
      minSize: 100,
      maxSize: 250,
      cell: ({ getValue, row }) => {
        const value = getValue() as unknown[] | undefined;
        if (!value || !Array.isArray(value)) {
          return <span className="text-gray-400 text-sm">—</span>;
        }
        const text = `${value.length} partner${value.length !== 1 ? 's' : ''}`;
        return (
          <div
            className="text-sm text-gray-700 truncate cursor-pointer hover:text-blue-600"
            onClick={() => setSelectedCell({ row: row.original, field: 'Tech Partners', value })}
            title={text}
          >
            {text}
          </div>
        );
      },
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      size: 130,
      minSize: 100,
      maxSize: 180,
      cell: ({ getValue, row }) => {
        const date = getValue() as string;
        const dateStr = new Date(date).toLocaleDateString();
        return (
          <div
            className="text-xs text-gray-500 cursor-pointer hover:text-blue-600"
            onClick={() => setSelectedCell({ row: row.original, field: 'Last Updated', value: new Date(date).toLocaleString() })}
            title={new Date(date).toLocaleString()}
          >
            {dateStr}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 80,
      minSize: 80,
      maxSize: 100,
      enableResizing: false,
      cell: ({ row }) => {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteCompany(row.original.id);
            }}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
            title="Delete company"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: companies,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    defaultColumn: {
      minSize: 50,
      maxSize: 600,
    },
  });

  if (companies.length === 0) {
    return <p className="text-gray-500 text-center py-8">No companies yet. Add one above!</p>;
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-300px)]">
      {/* DataGrid */}
      <div className={`${selectedCell ? 'w-2/3' : 'w-full'} transition-all duration-300 flex flex-col`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Company Research</h2>
          <span className="text-sm text-gray-500">
            {companies.length} {companies.length === 1 ? 'company' : 'companies'} tracked
          </span>
        </div>

        <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm bg-white" style={{ maxHeight: 'calc(100vh - 350px)' }}>
          <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', minWidth: '100%' }}>
            <thead className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                      style={{ 
                        width: `${header.getSize()}px`,
                        maxWidth: `${header.getSize()}px`,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      
                      {/* Resize handle */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none hover:bg-blue-400 ${
                            header.column.getIsResizing() ? 'bg-blue-500' : 'bg-gray-300 opacity-30 hover:opacity-100'
                          }`}
                          style={{ transition: header.column.getIsResizing() ? 'none' : 'opacity 0.2s' }}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 overflow-hidden"
                      style={{ 
                        width: `${cell.column.getSize()}px`,
                        maxWidth: `${cell.column.getSize()}px`,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidebar */}
      {selectedCell && (
        <div className="w-1/3 transition-all duration-300">
          <div className="sticky top-0">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedCell.field}</h3>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Company:</strong> {selectedCell.row.url}
                </div>
                <div className="mt-4">
                  {renderContent(selectedCell.value)}
                </div>
              </div>

              {/* Full company data */}
              {selectedCell.row.response ? (
                <details className="mt-6 border-t border-gray-200 pt-4">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 font-medium">
                    View All Research Data
                  </summary>
                  <div className="mt-4 space-y-3">
                    <ResearchDataView data={selectedCell.row.response as Record<string, unknown>} />
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentRenderer({ value }: { value: unknown }): React.ReactElement {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">Not available</span>;
  }

  if (typeof value === 'string') {
    return <div className="text-gray-900 whitespace-pre-wrap break-words">{value}</div>;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return <div className="text-gray-900">{String(value)}</div>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400 italic">None</span>;
    return (
      <div className="space-y-2">
        {value.map((item, idx) => (
          <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
            <ContentRenderer value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'object') {
    return (
      <div className="space-y-2">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="break-words">
            <div className="font-medium text-gray-700 text-sm mb-1">{formatKey(k)}:</div>
            <div className="ml-4">
              <ContentRenderer value={v} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="text-gray-900">{String(value)}</div>;
}

function ResearchDataView({ data }: { data: Record<string, unknown> }) {
  // Flatten the response structure
  const content = data.content as ResponseContent | undefined;
  const displayData = content || data;
  const basisValue = content?.basis || data.basis;

  return (
    <div className="space-y-3">
      {Object.entries(displayData).map(([key, value]) => {
        if (key === 'basis') return null; // Skip basis in summary view
        
        return (
          <details key={key} className="bg-gray-50 rounded p-3">
            <summary className="font-medium text-gray-700 text-sm cursor-pointer hover:text-gray-900">
              {formatKey(key)}
            </summary>
            <div className="mt-2 ml-2">
              {renderContent(value)}
            </div>
          </details>
        );
      })}
      
      {/* Basis in a separate collapsed section */}
      {basisValue ? (
        <details className="bg-gray-50 rounded p-3 border-2 border-gray-300">
          <summary className="font-medium text-gray-700 text-sm cursor-pointer hover:text-gray-900">
            📋 Basis (Research Sources)
          </summary>
          <div className="mt-2 ml-2 max-h-96 overflow-y-auto">
            {renderContent(basisValue)}
          </div>
        </details>
      ) : null}
    </div>
  );
}

// Helper to safely render content
function renderContent(value: unknown): React.ReactNode {
  return <ContentRenderer value={value} />;
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}