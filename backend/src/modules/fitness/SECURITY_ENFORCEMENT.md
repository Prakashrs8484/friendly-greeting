# Fitness Module - Security & Scope Enforcement

## Overview
This document describes the strict user isolation and date filtering rules enforced across all fitness APIs. Every endpoint is protected to prevent cross-user data access and enforce proper date scoping.

## Security Rules

### 1. User Isolation (req.user._id)
**Rule**: Every database query MUST filter by `userId`
**Enforcement**: Applied in all 8 controllers and 8 services

#### Coverage:
- ✅ fitnessEntry.controller.js - 3 endpoints
- ✅ fitnessDailyMetric.controller.js - 3 endpoints
- ✅ fitnessProfile.controller.js - 2 endpoints
- ✅ fitnessChatInput.controller.js - 1 endpoint
- ✅ fitnessTimeline.controller.js - 4 endpoints (CRUD)
- ✅ fitnessGoals.controller.js - 4 endpoints
- ✅ fitnessRecovery.controller.js - 3 endpoints
- ✅ fitnessInsights.controller.js - 1 endpoint
- ✅ fitnessAnalytics.controller.js - 2 endpoints

**Pattern in Controllers**:
```javascript
async handler(req, res, next) {
  const userId = req.user._id;  // ALWAYS extract from auth middleware
  const query = { userId, ...otherFilters };
  const result = await Model.find(query);  // Query always filtered by userId
}
```

**Pattern in Services**:
```javascript
async serviceMethod(userId, ...params) {
  // userId is first parameter
  const result = await Model.find({ userId, ...filters });
  return result;
}
```

---

### 2. Date Filtering
**Rule**: Every read operation MUST support date or date range filters

#### Endpoint Coverage:

**Single Date Filters** (format: `YYYY-MM-DD`):
- `GET /api/fitness/timeline?date=YYYY-MM-DD` - Entries for specific day
- `GET /api/fitness/metric/:dateKey` - Metrics for specific day
- `GET /api/fitness/recovery?date=YYYY-MM-DD` - Recovery signals for day
- `GET /api/fitness/insights?date=YYYY-MM-DD` - Insights for day
- `GET /api/fitness/analytics/weekly?endDate=YYYY-MM-DD` - 7 days ending on date

**Date Range Filters**:
- `GET /api/fitness/recovery/trend?start=YYYY-MM-DD&end=YYYY-MM-DD` - Recovery trend
- `GET /api/fitness/analytics/trends?from=YYYY-MM-DD&to=YYYY-MM-DD` - Metrics trend

**Write Operations** (date implicit):
- `POST /api/fitness/timeline` - Creates entry for specified/current date
- `POST /api/fitness/recovery/signals` - Records for specified/current date
- `POST /api/fitness/chat/input` - Parses and creates entries for specified/current date

**Pattern**:
```javascript
// Single date validation
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
}

// Date range validation
if (from > to) {
  return res.status(400).json({ message: 'fromDate cannot be after toDate' });
}
if (dayCount > 365) {
  return res.status(400).json({ message: 'Date range cannot exceed 365 days' });
}
```

---

### 3. Database Indexes
**Ensures fast queries and prevents full table scans**

#### FitnessEntry
```javascript
index({ userId: 1, dateKey: 1 });                 // Most common query
index({ userId: 1, dateKey: 1, timestamp: 1 });  // Chronological sorting
index({ userId: 1, createdAt: -1 });             // Recent entries
index({ userId: 1, timestamp: -1 });             // By timestamp
```

#### FitnessDailyMetric
```javascript
index({ userId: 1, dateKey: 1 }, { unique: true });  // Unique per user per day
```

#### FitnessChatInput
```javascript
index({ userId: 1, dateKey: 1 });          // Query by date
index({ userId: 1, createdAt: -1 });       // Recent queries
```

---

### 4. Date Key Normalization (Timezone-Aware)
**File**: `utils/dateUtils.js`

**Problem Solved**:
Users in different timezones should have entries grouped correctly. Without normalization, a user in Asia might have entries from "today" classified as "tomorrow" in UTC.

**Key Functions**:

```javascript
// Normalize date to YYYY-MM-DD in user's timezone
normalizeDateKey(date, timezone)
// Example: normalizeDateKey(new Date(), 'America/New_York')
// Returns: '2026-02-28' (local New York time, not UTC)

// Get date range boundaries in timezone
getDateRangeInTimezone(dateKey, timezone)
// Returns: { startTime: ISO string, endTime: ISO string }

// Validate date key format
isValidDateKey(dateKey)
// Returns: boolean

// Parse date key to UTC Date
parseDateKey(dateKey)
// Returns: Date object at 00:00:00 UTC
```

---

### 5. Security Utility Functions
**File**: `utils/securityEnforce.js`

#### Validation Functions:
```javascript
// Validate MongoDB ObjectId format
isValidObjectId(id)

// Ensure query includes userId filter
isQueryProperlyScoped(query, userId)

// Verify all returned docs belong to user
enforceUserOwnership(result, userId)

// Express middleware for date validation
validateDateQuery()
```

---

## Audit Checklist

### Controllers (8 files)
- [x] Every endpoint extracts `userId = req.user._id`
- [x] No queries execute without `{ userId, ... }` filter
- [x] Date parameters validated (format + range checks)
- [x] Entry IDs validated with ObjectId regex
- [x] Return errors for invalid/missing required params

### Services (8 files)
- [x] Every method takes `userId` as first parameter
- [x] All database queries include `{ userId, ... }`
- [x] Date range queries validated (365-day max)
- [x] Missing metrics computed on-demand from entries
- [x] Upserts store timezone-normalized dateKeys

### Models (6 files)
- [x] FitnessEntry: userId + dateKey + timestamp indexes
- [x] FitnessDailyMetric: unique on (userId, dateKey)
- [x] FitnessChatInput: userId + createdAt index
- [x] All other models properly indexed for userId queries

### Route Protection
- [x] `router.use(auth)` applied to all fitness routes
- [x] Auth middleware enforces JWT + populates req.user

---

## Example: Secure Query Pattern

### BAD (Vulnerable):
```javascript
// ❌ No userId filter - retrieves all users' data
const entries = await FitnessEntry.find({ dateKey: date });

// ❌ No validation - accepts invalid dates
const entries = await FitnessEntry.find({ userId, dateKey: req.query.date });

// ❌ No range limit - huge queries possible
const entries = await FitnessEntry.find({ userId, timestamp: { $gte: from, $lte: to } });
```

### GOOD (Secure):
```javascript
// ✅ Validate date format first
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  return res.status(400).json({ message: 'Invalid date format' });
}

// ✅ Always filter by userId
const entries = await FitnessEntry.find({
  userId,  // REQUIRED
  dateKey: date
})
  .sort({ timestamp: 1 })
  .lean();

// ✅ Validate and limit date ranges
if (from > to) {
  return res.status(400).json({ message: 'Invalid range' });
}
const dayCount = (to - from) / (1000 * 60 * 60 * 24) + 1;
if (dayCount > 365) {
  return res.status(400).json({ message: 'Range too large' });
}

const entries = await FitnessEntry.find({
  userId,  // REQUIRED
  dateKey: { $gte: from, $lte: to }
})
  .limit(dayCount * 10)
  .lean();
```

---

## Testing Recommendations

### User Isolation Tests
```bash
# User A should NOT see User B's data
curl -H "Authorization: Bearer <UserA_token>" /api/fitness/timeline?date=2026-02-28
# Must return only User A's entries

curl -H "Authorization: Bearer <UserB_token>" /api/fitness/timeline?date=2026-02-28
# Must return only User B's entries (different from User A)
```

### Date Scope Tests
```bash
# Without date: should fail
curl -H "Authorization: Bearer <token>" /api/fitness/timeline
# 400: date query parameter is required

# Invalid date format: should fail
curl -H "Authorization: Bearer <token>" /api/fitness/timeline?date=02-28-2026
# 400: Invalid date format. Use YYYY-MM-DD

# Date range too large: should fail
curl -H "Authorization: Bearer <token>" /api/fitness/analytics/trends?from=2025-01-01&to=2028-01-01
# 400: Date range cannot exceed 365 days
```

---

## Maintenance Notes

### When Adding New Endpoints:
1. ✅ Extract userId from req.user._id in controller
2. ✅ Validate date parameters if applicable
3. ✅ Pass userId to service method as first param
4. ✅ Apply userId filter in ALL database queries
5. ✅ Document date range limits if applicable

### When Adding New Models:
1. ✅ Include userId field (ref to User)
2. ✅ Include dateKey field for date queries (if applicable)
3. ✅ Add compound indexes: `{ userId: 1, dateKey: 1 }`
4. ✅ Add userId-filtered indexes for other queries

### Database Migration:
```javascript
// Create missing indexes in production:
db.fitnessentry.createIndex({ userId: 1, dateKey: 1, timestamp: 1 });
db.fitnessdailymetric.createIndex({ userId: 1, dateKey: 1 }, { unique: true });
db.fitnesschatinput.createIndex({ userId: 1, createdAt: -1 });
```

---

## Access Control Summary

| Endpoint | Auth | UserId | Date Filter | Max Range |
|----------|------|--------|-------------|-----------|
| GET /timeline | ✅ | ✅ | ✅ (single) | N/A |
| POST /timeline | ✅ | ✅ | Implicit | N/A |
| PUT /timeline/:id | ✅ | ✅ | Implicit | N/A |
| DELETE /timeline/:id | ✅ | ✅ | Implicit | N/A |
| GET /metric/:date | ✅ | ✅ | ✅ (single) | N/A |
| GET /dashboard | ✅ | ✅ | Implicit (today) | N/A |
| GET /goals | ✅ | ✅ | N/A | N/A |
| GET /goals/progress | ✅ | ✅ | ✅ (single) | N/A |
| GET /recovery | ✅ | ✅ | ✅ (single) | N/A |
| POST /recovery/signals | ✅ | ✅ | Implicit | N/A |
| GET /recovery/trend | ✅ | ✅ | ✅ (range) | 365 days |
| GET /insights | ✅ | ✅ | ✅ (single) | N/A |
| GET /analytics/weekly | ✅ | ✅ | ✅ (single) | 7 days |
| GET /analytics/trends | ✅ | ✅ | ✅ (range) | 365 days |
| POST /chat/input | ✅ | ✅ | Implicit | N/A |

---

**Last Updated**: 2026-02-28
**Version**: 1.0 (Complete User & Date Isolation)
