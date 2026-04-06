# Fitness Module - Day Reset & Edit Workflows

## Overview
The fitness module provides flexible day reset and edit capabilities with support for hard-delete, soft-delete (archive), and restore operations. All workflow operations automatically trigger metric re-aggregation.

---

## Day Reset Endpoints

### 1. Hard Reset (Permanent Delete)
**Endpoint**: `POST /api/fitness/day/reset`

**Purpose**: Permanently delete all fitness entries and daily metrics for a specific date.

**Request**:
```json
{
  "date": "2026-02-28"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Day reset successfully",
  "reset": {
    "success": true,
    "dateKey": "2026-02-28",
    "deleted": {
      "entryCount": 5,
      "byType": {
        "meal": 2,
        "workout": 1,
        "sleep": 1,
        "hydration": 1
      },
      "metricRemoved": true
    },
    "clearedPayload": {
      "dateKey": "2026-02-28",
      "date": "2026-02-28T00:00:00.000Z",
      "caloriesConsumed": 0,
      "caloriesBurned": 0,
      "proteinIntake": 0,
      "waterIntakeMl": 0,
      "workoutMinutes": 0,
      "sleepHours": 0,
      "recoveryScore": 0,
      "fitnessScore": 0,
      "streakCount": 0,
      "entries": []
    }
  }
}
```

**Behavior**:
- ✅ Hard-deletes all FitnessEntry records for (userId, date)
- ✅ Deletes corresponding FitnessDailyMetric
- ✅ Preserves FitnessGoals and FitnessProfile
- ✅ Cannot be reversed (one-way operation)
- ✅ Returns cleared day payload for UI

---

### 2. Soft Reset (Archive)
**Endpoint**: `POST /api/fitness/day/soft-reset`

**Purpose**: Archive all entries for a date (soft-delete) instead of permanent deletion. Allows for restoration and audit trails.

**Request**:
```json
{
  "date": "2026-02-28"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Day soft-reset successfully (can be restored)",
  "reset": {
    "success": true,
    "dateKey": "2026-02-28",
    "deleted": {
      "entryCount": 5,
      "metricRemoved": true,
      "method": "soft_delete"
    },
    "clearedPayload": { ... }
  }
}
```

**Behavior**:
- ✅ Marks entries as deleted (sets `isDeleted: true`, `deletedAt: timestamp`)
- ✅ Entries hidden from normal queries (auto-excluded by middleware)
- ✅ Deletes daily metric for that date
- ✅ Can be restored with `/day/restore` endpoint
- ✅ Audit trail preserved for compliance

---

### 3. Restore Archived Day
**Endpoint**: `POST /api/fitness/day/restore`

**Purpose**: Restore soft-deleted entries and recompute daily metrics.

**Request**:
```json
{
  "date": "2026-02-28"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Day restored successfully",
  "restored": {
    "success": true,
    "dateKey": "2026-02-28",
    "restored": {
      "entryCount": 5,
      "metricRecomputed": true
    },
    "restoredPayload": {
      "dateKey": "2026-02-28",
      "caloriesConsumed": 2150,
      "caloriesBurned": 450,
      "proteinIntake": 125,
      "workoutMinutes": 45,
      "sleepHours": 7.5
    }
  }
}
```

**Behavior**:
- ✅ Unmarks soft-deleted entries (removes `isDeleted`, `deletedAt`)
- ✅ Automatically recomputes FitnessDailyMetric from entries
- ✅ Entries re-appear in normal queries
- ✅ Returns recomputed metrics

---

### 4. View Deleted Entries (Audit)
**Endpoint**: `GET /api/fitness/day/deleted?date=YYYY-MM-DD`

**Purpose**: Inspect soft-deleted (archived) entries for a specific date.

**Response** (200 OK):
```json
{
  "success": true,
  "date": "2026-02-28",
  "deletedCount": 3,
  "deleted": [
    {
      "_id": "...",
      "dateKey": "2026-02-28",
      "entryType": "meal",
      "calories": 650,
      "deletedAt": "2026-02-28T15:30:00.000Z",
      "isDeleted": true
    },
    {
      "_id": "...",
      "dateKey": "2026-02-28",
      "entryType": "workout",
      "duration": 45,
      "deletedAt": "2026-02-28T15:30:00.000Z",
      "isDeleted": true
    }
  ]
}
```

**Behavior**:
- ✅ Returns soft-deleted entries for auditing
- ✅ Shows deletion timestamp
- ✅ Useful for compliance/recovery scenarios

---

### 5. Reset History (Audit Trail)
**Endpoint**: `GET /api/fitness/day/reset-history?days=30`

**Purpose**: Get audit trail of deleted days and restorations.

**Query Parameters**:
- `days` (optional, default=30): Lookback period in days (1-365)

**Response** (200 OK):
```json
{
  "success": true,
  "lookbackDays": 30,
  "totalResetDays": 2,
  "resetHistory": [
    {
      "dateKey": "2026-02-28",
      "deletedAt": "2026-02-28T15:30:00.000Z",
      "entryCount": 5,
      "entryTypes": {
        "meal": 2,
        "workout": 1,
        "sleep": 1,
        "hydration": 1
      }
    },
    {
      "dateKey": "2026-02-27",
      "deletedAt": "2026-02-27T10:15:00.000Z",
      "entryCount": 3,
      "entryTypes": {
        "meal": 1,
        "workout": 2
      }
    }
  ]
}
```

**Behavior**:
- ✅ Shows all soft-deleted days in lookback period
- ✅ Groups by dateKey with deletion timestamps
- ✅ Counts entries by type for each reset

---

### 6. Purge Old Soft-Deleted Entries
**Endpoint**: `DELETE /api/fitness/day/purge-deleted?olderThanDays=30`

**Purpose**: Permanently purge soft-deleted entries older than N days. One-way operation, cannot be recovered!

**Query Parameters**:
- `olderThanDays` (optional, default=30): Delete entries soft-deleted more than N days ago (1-365)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Permanently purged 15 soft-deleted entries",
  "purge": {
    "success": true,
    "purged": {
      "entryCount": 15,
      "olderThanDays": 30,
      "oldestEntryDate": "2026-01-29"
    }
  }
}
```

**Behavior**:
- ⚠️ PERMANENT: Entries older than N days are permanently deleted from database
- ✅ Cannot be recovered or restored
- ✅ Useful for GDPR compliance and storage cleanup
- ✅ Only purges soft-deleted entries (not active data)

---

## Timeline Edit/Delete Workflow

### Existing Functionality (Already Implemented)

#### Update Entry
**Endpoint**: `PUT /api/fitness/timeline/:entryId`

**Request Body**:
```json
{
  "timestamp": "2026-02-28T19:30:00Z",
  "calories": 750,
  "protein": 35,
  "description": "Updated lunch"
}
```

**Workflow**:
1. ✅ Validates entry ownership (userId match)
2. ✅ Updates allowed fields
3. ✅ If `timestamp` changes, updates `dateKey`
4. ✅ If dateKey changes:
   - Recomputes metrics for ORIGINAL date
   - Recomputes metrics for NEW date
5. ✅ Returns updated entry

**Key Feature**: Moving an entry between dates automatically re-aggregates both old and new dates' metrics.

---

#### Delete Entry
**Endpoint**: `DELETE /api/fitness/timeline/:entryId`

**Workflow**:
1. ✅ Validates entry ownership
2. ✅ Fetches entry to get dateKey
3. ✅ Deletes entry
4. ✅ Recomputes metrics for affected date
5. ✅ Returns deleted entry details

**Result**: Day's metrics automatically recalculated without that entry.

---

## Soft-Delete Behavior

### Automatic Exclusion from Queries
All standard queries automatically exclude soft-deleted entries thanks to a Mongoose middleware hook:

```javascript
// Mongoose pre-hook automatically adds filter
FitnessEntrySchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});
```

**Impact**:
- `GET /api/fitness/timeline?date=2026-02-28` - Returns only active entries
- `GET /api/fitness/analytics/trends` - Uses only active entries
- `FitnessDailyMetric` recomputation - Aggregates only active entries
- UI never sees archived entries unless explicitly querying deleted entries

### Opt-In Queries for Deleted Data
To bypass the soft-delete filter:
```javascript
// Explicitly query deleted entries
const deleted = await FitnessEntry.find(
  { userId, dateKey },
  { _recursed: true }  // Bypass middleware
).where('isDeleted', true);
```

---

## Complete Reset Workflow Examples

### Scenario 1: User Mistakes and Wants to Clear a Day
```
1. User logs 5 meals by mistake
2. POST /api/fitness/day/soft-reset { date: "2026-02-28" }
3. Day cleared, entries archived
4. User sees empty day with 0 calories/metrics
5. If needed, POST /api/fitness/day/restore { date: "2026-02-28" }
6. All entries visible again, metrics recomputed
```

### Scenario 2: Data Correction Without History
```
1. Delete mistaken entry: DELETE /timeline/:entryId
2. Metrics automatically recomputed for that date
3. No archive, permanent deletion
4. Entry cannot be recovered
```

### Scenario 3: Monthly Cleanup
```
1. GET /api/fitness/day/reset-history?days=90
2. Review which days were soft-deleted
3. DELETE /api/fitness/day/purge-deleted?olderThanDays=60
4. Entries soft-deleted >60 days ago permanently purged
5. Recent archived data still recoverable
```

---

## Database Schema Changes

### FitnessEntry Model Updates
```javascript
// NEW fields for soft-delete support
isDeleted: {
  type: Boolean,
  default: false,
  index: true
},
deletedAt: Date,

// NEW index for soft-delete queries
FitnessEntrySchema.index({ userId: 1, isDeleted: 1, deletedAt: -1 });

// NEW middleware: auto-exclude deleted entries
FitnessEntrySchema.pre(/^find/, function(next) {
  if (this.getOptions()._recursed) return next();
  this.where({ isDeleted: { $ne: true } });
  next();
});
```

---

## Access Control

All reset endpoints require:
- ✅ Authentication (JWT token)
- ✅ User isolation (only reset own entries)
- ✅ Date validation (YYYY-MM-DD format)
- ✅ Prevent range exploits (max 365 days lookback)

---

## API Endpoint Matrix

| Operation | Endpoint | Method | Body | Permanent | Recoverable |
|-----------|----------|--------|------|-----------|-------------|
| Hard Reset | `/day/reset` | POST | date | ✅ | ❌ |
| Soft Reset | `/day/soft-reset` | POST | date | ❌ | ✅ |
| View Deleted | `/day/deleted` | GET | query | N/A | N/A |
| Restore | `/day/restore` | POST | date | N/A | ✅ Re-activates |
| Reset History | `/day/reset-history` | GET | query | N/A | N/A |
| Purge Old | `/day/purge-deleted` | DELETE | query | ✅ >N days | ❌ |
| Update Entry | `/timeline/:id` | PUT | fields | ❌ | ✅ Moves date |
| Delete Entry | `/timeline/:id` | DELETE | - | ✅ | ❌ |

---

## Best Practices

### For UI Implementation
1. **Soft-delete by default** - Use `/day/soft-reset` for user deletions
2. **Provide restore option** - Show "Undo" button for recently cleared days
3. **Show history** - Display reset history for transparency
4. **Confirm destructive actions** - Hard-delete should require confirmation

### For Data Compliance
1. **Preserve soft-deleted data** for 30+ days (GDPR right to be forgotten)
2. **Use `/day/purge-deleted`** on schedule to clean >60 day old deletions
3. **Maintain `/day/reset-history`** for audit trails
4. **Never hard-delete immediately** - Always soft-delete first

### For Production
1. **Backup before bulk purges** - Purge is one-way, irreversible
2. **Rate-limit reset endpoints** - Prevent accidental mass deletion
3. **Log all resets** - Track who reset which days and when
4. **Monitor soft-delete ratio** - Alert if >50% entries are soft-deleted

---

**Last Updated**: 2026-02-28
**Version**: 1.0 (Complete Day Reset & Timeline Edit Workflow)
