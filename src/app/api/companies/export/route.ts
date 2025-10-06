import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema';
import { and, gte, lte, eq, or } from 'drizzle-orm';

// Helper function to escape CSV values
function escapeCSVValue(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

// Helper function to extract executive summary from response
function extractExecutiveSummary(response: unknown): string {
  if (!response || typeof response !== 'object') return '';
  
  const responseObj = response as Record<string, unknown>;
  const content = responseObj.content as Record<string, unknown> | undefined;
  
  const executiveSummary = content?.executive_summary || responseObj.executive_summary;
  return executiveSummary ? String(executiveSummary) : '';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filter parameters
    const fitScoreMin = searchParams.get('fitScoreMin');
    const fitScoreMax = searchParams.get('fitScoreMax');
    const statusFilter = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const employeeMin = searchParams.get('employeeMin');
    const employeeMax = searchParams.get('employeeMax');
    
    // Build query conditions
    const conditions = [];
    
    // Date filtering
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!isNaN(fromDate.getTime())) {
        conditions.push(gte(companies.createdAt, fromDate));
      }
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      if (!isNaN(toDate.getTime())) {
        // Add 23:59:59 to include the entire day
        toDate.setHours(23, 59, 59, 999);
        conditions.push(lte(companies.createdAt, toDate));
      }
    }
    
    // Status filtering
    if (statusFilter) {
      const statuses = statusFilter.split(',').map(s => s.trim());
      if (statuses.length === 1) {
        conditions.push(eq(companies.status, statuses[0]));
      } else if (statuses.length > 1) {
        conditions.push(or(...statuses.map(status => eq(companies.status, status))));
      }
    }
    
    // Fetch companies with filters
    let query = db.select().from(companies);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const allCompanies = await query;
    
    // Apply fit score filtering in memory (since it's stored as text)
    let filteredCompanies = allCompanies;
    if (fitScoreMin || fitScoreMax) {
      filteredCompanies = allCompanies.filter(company => {
        if (!company.fitScore) return false;
        
        // Extract numeric score from format like "8/10"
        const scoreMatch = company.fitScore.match(/^(\d+)/);
        if (!scoreMatch) return false;
        
        const score = parseInt(scoreMatch[1]);
        
        if (fitScoreMin && score < parseInt(fitScoreMin)) return false;
        if (fitScoreMax && score > parseInt(fitScoreMax)) return false;
        
        return true;
      });
    }
    
    // Apply employee count filtering in memory
    if (employeeMin || employeeMax) {
      filteredCompanies = filteredCompanies.filter(company => {
        if (!company.employeeCount) return false;
        
        // Parse employee count - could be a single number, range (e.g., "100-500"), or "10000+"
        const countStr = company.employeeCount;
        let minCount = 0;
        let maxCount = Number.MAX_SAFE_INTEGER;
        
        // Handle "10000+" format
        if (countStr.includes('+')) {
          minCount = parseInt(countStr.replace('+', ''));
          maxCount = Number.MAX_SAFE_INTEGER;
        }
        // Handle range format "100-500"
        else if (countStr.includes('-')) {
          const [min, max] = countStr.split('-').map(s => parseInt(s.trim()));
          minCount = min || 0;
          maxCount = max || Number.MAX_SAFE_INTEGER;
        }
        // Handle single number
        else {
          const count = parseInt(countStr);
          if (!isNaN(count)) {
            minCount = count;
            maxCount = count;
          }
        }
        
        // Check against filters
        if (employeeMin && maxCount < parseInt(employeeMin)) return false;
        if (employeeMax && minCount > parseInt(employeeMax)) return false;
        
        return true;
      });
    }
    
    // Sort by createdAt descending
    filteredCompanies.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    // Generate CSV
    const csvRows = [];
    
    // Header row
    csvRows.push([
      'URL',
      'Status',
      'Fit Score',
      'Employee Count',
      'Pitch',
      'Executive Summary',
      'Created At',
      'Updated At'
    ].join(','));
    
    // Data rows
    for (const company of filteredCompanies) {
      const executiveSummary = extractExecutiveSummary(company.response);
      
      csvRows.push([
        escapeCSVValue(company.url),
        escapeCSVValue(company.status),
        escapeCSVValue(company.fitScore),
        escapeCSVValue(company.employeeCount),
        escapeCSVValue(company.pitch),
        escapeCSVValue(executiveSummary),
        escapeCSVValue(new Date(company.createdAt).toISOString()),
        escapeCSVValue(new Date(company.updatedAt).toISOString())
      ].join(','));
    }
    
    const csvContent = csvRows.join('\n');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `companies_export_${timestamp}.csv`;
    
    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
    
  } catch (error) {
    console.error('Error exporting companies:', error);
    return NextResponse.json(
      { error: 'Failed to export companies' },
      { status: 500 }
    );
  }
}