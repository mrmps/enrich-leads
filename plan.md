# CSV Export Feature Implementation Plan

## Task
Add ability to export all companies as CSV, with filtering by fit score and status.

## Progress Tracking

### 1. Discovery Phase ✅
- [x] Explore project structure - Next.js app with API routes
- [x] Identify database schema and models - Using Drizzle ORM with PostgreSQL
- [x] Find existing company data structures - companies table in schema.ts
- [x] Understand fit score and status fields:
  - fitScore: text field (1-10 scale)
  - status: text field (pending, processing, completed, failed)
- [x] Check for existing export functionality - None found, need to create

### 2. Planning Phase 🔄
- [x] Design CSV export endpoint/function
- [x] Determine filtering parameters
- [x] Plan CSV structure/columns

### 3. Implementation Phase ✅
- [x] Create CSV export API endpoint
- [x] Add CSV generation logic
- [x] Add filtering by fit score
- [x] Add filtering by status
- [x] Add filtering by date range (added per user request)
- [x] Add export button to UI with all filter controls
- [x] Test the implementation

### 4. Testing Phase ✅
- [x] Test basic CSV export
- [x] Test filtering combinations
- [x] Verify CSV format correctness

### 5. Additional Features ✅
- [x] Add employee count to database schema
- [x] Extract employee count from Parallel response (OpenAI analyzer updated)
- [x] Update webhook to save employee count
- [x] Display employee count in CompanyList table
- [x] Add employee count filtering to export controls
- [x] Update CSV export API to handle employee count filtering

### 6. Testing Phase 🔄
- [ ] Test employee count extraction from new companies
- [ ] Test employee count filtering in CSV export
- [ ] Test combined filters (fit score + status + date + employees)

## Database Schema Found
- **companies** table with:
  - id (UUID)
  - url (text, unique)
  - runId (text)
  - status (text: pending/processing/completed/failed)
  - response (JSONB)
  - error (text)
  - fitScore (text: 1-10)
  - pitch (text)
  - createdAt (timestamp)
  - updatedAt (timestamp)

## Implementation Plan
1. Create new API endpoint: `/api/companies/export`
2. Accept query parameters for filtering:
   - `fitScoreMin` and `fitScoreMax` for fit score range
   - `status` for status filter (can be comma-separated for multiple)
3. Generate CSV with columns:
   - URL
   - Status
   - Fit Score
   - Pitch
   - Created At
   - Updated At
4. Add export button to CompanyList component with filter controls

## Notes
- Using pnpm for all package management
- Dev environment is already running
- Can execute db commands as needed