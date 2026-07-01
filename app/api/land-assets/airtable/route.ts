import { NextResponse } from "next/server";
import type { AssetCategory, Opportunity, QualitativeLevel, RiskLevel } from "@/content/opportunities";
import { site } from "@/content/opportunities";

export const dynamic = "force-dynamic";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";
const AIRTABLE_META_API_URL = "https://api.airtable.com/v0/meta";

interface AirtableRecord {
  createdTime: string;
  fields: Record<string, unknown>;
  id: string;
}

interface AirtableTable {
  id: string;
  name: string;
}

const categoryMatchers: Array<[RegExp, AssetCategory]> = [
  [/solar|energy|battery|renewable|offtake/i, "Solar and energy"],
  [/restoration|ecological|mitigation/i, "Ecological restoration"],
  [/easement|conservation|stewardship|grant/i, "Conservation finance"],
  [/agriculture|farm|food|graz/i, "Agriculture and food"],
  [/event|visitor|venue|conven/i, "Visitor and events"],
  [/timber|biomass|wood/i, "Timber and biomass"],
  [/habitat|species|biodiversity/i, "Habitat and species"],
  [/research|field station|learning|university/i, "Research and learning"],
  [/carbon|climate|offset|sequestration/i, "Carbon and climate"],
  [/water|stormwater|wetland|resilience|nutrient/i, "Water and resilience"],
];

function config() {
  return {
    baseId: process.env.AIRTABLE_LAND_ASSET_BASE_ID || site.airtableBaseId,
    tableName: process.env.AIRTABLE_LAND_ASSET_TABLE_NAME,
    token: process.env.AIRTABLE_LAND_ASSET_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
  };
}

async function airtableRequest<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Airtable request failed: ${response.status} ${response.statusText} ${detail}`);
  }

  return (await response.json()) as T;
}

function asText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean).join(", ");
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return "";
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replaceAll("$", "").replaceAll(",", "").replaceAll("%", "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function field(fields: Record<string, unknown>, patterns: RegExp[]) {
  return Object.entries(fields).find(([key]) => patterns.some((pattern) => pattern.test(key)))?.[1];
}

function text(fields: Record<string, unknown>, patterns: RegExp[], fallback = "") {
  return asText(field(fields, patterns)) || fallback;
}

function number(fields: Record<string, unknown>, patterns: RegExp[], fallback: number) {
  return asNumber(field(fields, patterns)) ?? fallback;
}

function list(value: string) {
  return value.split(/\n|;|\|/).map((item) => item.trim()).filter(Boolean);
}

function scenario(base: number, low: number | null, high: number | null) {
  return {
    base,
    high: high ?? base * 1.35,
    low: low ?? Math.max(0, base * 0.65),
  };
}

function quality(value: string, fallback: QualitativeLevel): QualitativeLevel {
  if (/very\s*strong|excellent|highest/i.test(value)) return "Very strong";
  if (/strong|high|good/i.test(value)) return "Strong";
  if (/moderate|medium/i.test(value)) return "Moderate";
  if (/limited|low|weak/i.test(value)) return "Limited";
  if (/sensitive|misalign|conflict/i.test(value)) return "Sensitive";
  return fallback;
}

function risk(value: string, fallback: RiskLevel): RiskLevel {
  if (/low/i.test(value)) return "Low";
  if (/managed|moderate/i.test(value)) return "Managed";
  if (/material|medium/i.test(value)) return "Material";
  if (/high|severe/i.test(value)) return "High";
  return fallback;
}

function category(fields: Record<string, unknown>): AssetCategory {
  const value = text(fields, [/category|asset group|type|opportunity/i]);
  return categoryMatchers.find(([pattern]) => pattern.test(value))?.[1] ?? "Conservation finance";
}

function mapRecord(record: AirtableRecord, tableName: string): Opportunity {
  const fields = record.fields;
  const categoryValue = category(fields);
  const annualBase = number(fields, [/annual.*revenue/i, /estimated.*revenue/i, /^revenue$/i], 0);
  const operatingBase = number(fields, [/operating.*cost/i, /annual.*cost/i, /opex/i], 0);
  const implementationBase = number(fields, [/implementation.*cost/i, /startup.*cost/i, /capital.*cost/i, /capex/i], 0);
  const riskText = text(fields, [/risk/i]);
  const constraints = list(text(fields, [/restriction|constraint|guardrail|deed|easement|zoning/i]));
  const diligence = list(text(fields, [/diligence|question|open item|next question/i]));

  return {
    annualRevenue: scenario(annualBase, asNumber(field(fields, [/revenue.*low/i])), asNumber(field(fields, [/revenue.*high/i]))),
    category: categoryValue,
    constraints: constraints.length ? constraints : ["Confirm deed, easement, public-access, and ecological constraints."],
    diligence: diligence.length ? diligence : ["Confirm assumptions against parcel-level restrictions."],
    ecologicalValue: quality(text(fields, [/ecolog|biodiversity|habitat/i]), "Strong"),
    id: record.id,
    implementationCost: scenario(
      implementationBase,
      asNumber(field(fields, [/implementation.*low/i, /capex.*low/i])),
      asNumber(field(fields, [/implementation.*high/i, /capex.*high/i])),
    ),
    location: text(fields, [/location|parcel|area|site/i], "Location not specified"),
    missionFit: quality(text(fields, [/mission/i]), "Strong"),
    monthsToRevenue: number(fields, [/time.*revenue|months|timeline/i], 12),
    name: text(fields, [/^name$/i, /opportunity/i, /asset/i, /project/i], `Airtable opportunity ${record.id}`),
    nextStep: text(fields, [/next step|recommend|action/i], "Review the Airtable record and assign a diligence owner."),
    operatingCost: scenario(operatingBase, asNumber(field(fields, [/operating.*low/i, /opex.*low/i])), asNumber(field(fields, [/operating.*high/i, /opex.*high/i]))),
    publicBenefit: quality(text(fields, [/public|community|visitor|learning/i]), "Moderate"),
    readiness: /hold/i.test(riskText)
      ? "Hold"
      : /constraint/i.test(riskText)
        ? "Needs constraint review"
        : /partner/i.test(riskText)
          ? "Needs partner design"
          : "Ready for diligence",
    revenueConfidence: quality(text(fields, [/confidence|certainty|revenue quality/i]), annualBase > 0 ? "Moderate" : "Limited"),
    revenueModel: text(fields, [/revenue model|business model|monetization|income/i], `Synced from Airtable table "${tableName}".`),
    risk: risk(riskText, "Managed"),
    summary: text(fields, [/summary|description|rationale|notes/i], "No summary found in mapped Airtable fields."),
    type: text(fields, [/asset type/i, /^type$/i, /opportunity type/i], categoryValue),
  };
}

export async function GET() {
  const { baseId, tableName, token } = config();

  if (!token) {
    return NextResponse.json({
      baseId,
      connected: false,
      message: "Airtable token is not configured.",
      opportunities: [],
    });
  }

  try {
    let selectedTable = tableName;
    let tableNames: string[] = [];

    if (!selectedTable) {
      const schema = await airtableRequest<{ tables?: AirtableTable[] }>(`${AIRTABLE_META_API_URL}/bases/${baseId}/tables`, token);
      const tables = schema.tables ?? [];
      tableNames = tables.map((item) => item.name);
      selectedTable = tables.find((item) => /opportun|asset|valuation|land|monet/i.test(item.name))?.name ?? tables[0]?.name;
    }

    if (!selectedTable) {
      return NextResponse.json({ baseId, connected: false, message: "No Airtable table selected.", opportunities: [], tables: tableNames });
    }

    const records: AirtableRecord[] = [];
    let offset: string | undefined;

    do {
      const query = new URLSearchParams({ pageSize: "100" });
      if (offset) query.set("offset", offset);
      const payload = await airtableRequest<{ records?: AirtableRecord[]; offset?: string }>(
        `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(selectedTable)}?${query.toString()}`,
        token,
      );
      records.push(...(payload.records ?? []));
      offset = payload.offset;
    } while (offset);

    return NextResponse.json({
      baseId,
      connected: true,
      message: `Synced ${records.length} records from ${selectedTable}.`,
      opportunities: records.map((record) => mapRecord(record, selectedTable)),
      tableName: selectedTable,
      tables: tableNames,
    });
  } catch (error) {
    return NextResponse.json(
      { baseId, connected: false, message: error instanceof Error ? error.message : "Unknown Airtable error.", opportunities: [] },
      { status: 502 },
    );
  }
}
