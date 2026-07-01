# Duke Farms Land Asset Valuation

Standalone internal web tool for evaluating land-asset monetization opportunities at Duke Farms.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Airtable

The app uses seeded public-source assumptions by default. To sync a live Airtable table, set:

```bash
AIRTABLE_LAND_ASSET_TOKEN=...
AIRTABLE_LAND_ASSET_BASE_ID=appXmt4wwjK4o26rW
AIRTABLE_LAND_ASSET_TABLE_NAME=...
```

If the table name is omitted, the API tries to select a likely opportunity/asset table from the base schema.
