'use client';

import { useState } from 'react';

export function ExportControls() {
  const [fitScoreMin, setFitScoreMin] = useState<string>('');
  const [fitScoreMax, setFitScoreMax] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [employeeMin, setEmployeeMin] = useState<string>('');
  const [employeeMax, setEmployeeMax] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const statuses = ['pending', 'processing', 'completed', 'failed'];

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (fitScoreMin) {
        params.append('fitScoreMin', fitScoreMin);
      }
      
      if (fitScoreMax) {
        params.append('fitScoreMax', fitScoreMax);
      }
      
      if (selectedStatuses.length > 0) {
        params.append('status', selectedStatuses.join(','));
      }
      
      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }
      
      if (dateTo) {
        params.append('dateTo', dateTo);
      }
      
      if (employeeMin) {
        params.append('employeeMin', employeeMin);
      }
      
      if (employeeMax) {
        params.append('employeeMax', employeeMax);
      }
      
      // Fetch CSV data
      const response = await fetch(`/api/companies/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to export companies');
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'companies_export.csv';
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export companies. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setFitScoreMin('');
    setFitScoreMax('');
    setSelectedStatuses([]);
    setDateFrom('');
    setDateTo('');
    setEmployeeMin('');
    setEmployeeMax('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Export Companies</h3>
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset Filters
        </button>
      </div>
      
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fit Score Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fit Score Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="10"
                value={fitScoreMin}
                onChange={(e) => setFitScoreMin(e.target.value)}
                placeholder="Min"
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                min="1"
                max="10"
                value={fitScoreMax}
                onChange={(e) => setFitScoreMax(e.target.value)}
                placeholder="Max"
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedStatuses.includes(status)
                      ? status === 'pending' ? 'bg-gray-600 text-white' :
                        status === 'processing' ? 'bg-blue-600 text-white' :
                        status === 'completed' ? 'bg-green-600 text-white' :
                        'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Employee Count Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Employees
            </label>
            <input
              type="number"
              min="0"
              value={employeeMin}
              onChange={(e) => setEmployeeMin(e.target.value)}
              placeholder="e.g., 100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Employees
            </label>
            <input
              type="number"
              min="0"
              value={employeeMax}
              onChange={(e) => setEmployeeMax(e.target.value)}
              placeholder="e.g., 5000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {fitScoreMin || fitScoreMax || selectedStatuses.length > 0 || dateFrom || dateTo || employeeMin || employeeMax ? (
            <span>
              Filters applied: 
              {fitScoreMin && ` Fit Score ≥ ${fitScoreMin}`}
              {fitScoreMax && ` Fit Score ≤ ${fitScoreMax}`}
              {selectedStatuses.length > 0 && ` Status: ${selectedStatuses.join(', ')}`}
              {dateFrom && ` From: ${dateFrom}`}
              {dateTo && ` To: ${dateTo}`}
              {employeeMin && ` Employees ≥ ${employeeMin}`}
              {employeeMax && ` Employees ≤ ${employeeMax}`}
            </span>
          ) : (
            <span>No filters applied - will export all companies</span>
          )}
        </div>
        
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isExporting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isExporting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </span>
          )}
        </button>
      </div>
    </div>
  );
}