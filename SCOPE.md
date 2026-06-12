# SCOPE.md — Anomaly Log & Database Schema

## 1. Anomaly Log
Every data problem found in the source CSV and how it was handled during ingestion.

| Row | Column | Problem | Handling Action |
|-----|--------|---------|-----------------|
| 4   | Price  | Negative value (-15.00) | Absolute value taken (15.00) |
| 12  | Date   | Future date (2027-01-01) | Flagged as "Suspicious" and logged |
| 25  | Email  | Missing @ symbol | Row skipped; added to Error Log |
| 42  | Total  | Null value | Calculated from (Unit Price * Quantity) |
| 56  | ID     | Duplicate ID | Updated existing record (Upsert) |

## 2. Database Schema
The following schema was used to store the cleaned data in MongoDB.

### Collection: `transactions`
```json
{
  "_id": "ObjectId",
  "external_id": "String (Unique)",
  "amount": "Decimal128",
  "status": "String ('Completed', 'Pending', 'Suspicious')",
  "customer_email": "String (Validated)",
  "timestamp": "ISODate",
  "metadata": {
    "source_file": "String",
    "ingested_at": "ISODate"
  }
}
```

## 3. Data Integrity Strategy
- **Validation**: Joi schema used for runtime validation.
- **Cleaning**: Trimming whitespace and case normalization.
- **Logging**: All skipped rows are stored in `logs/skipped_records.json`.
