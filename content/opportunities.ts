export type Scenario = "low" | "base" | "high";
export type QualitativeLevel = "Very strong" | "Strong" | "Moderate" | "Limited" | "Sensitive";
export type RiskLevel = "Low" | "Managed" | "Material" | "High";

export type AssetCategory =
  | "Solar and energy"
  | "Ecological restoration"
  | "Conservation finance"
  | "Agriculture and food"
  | "Visitor and events"
  | "Timber and biomass"
  | "Habitat and species"
  | "Research and learning"
  | "Carbon and climate"
  | "Water and resilience";

export interface Opportunity {
  id: string;
  name: string;
  category: AssetCategory;
  type: string;
  location: string;
  summary: string;
  revenueModel: string;
  annualRevenue: Record<Scenario, number>;
  operatingCost: Record<Scenario, number>;
  implementationCost: Record<Scenario, number>;
  missionFit: QualitativeLevel;
  ecologicalValue: QualitativeLevel;
  publicBenefit: QualitativeLevel;
  revenueConfidence: QualitativeLevel;
  risk: RiskLevel;
  readiness: "Ready for diligence" | "Needs partner design" | "Needs constraint review" | "Hold";
  monthsToRevenue: number;
  constraints: string[];
  diligence: string[];
  nextStep: string;
}

export const site = {
  title: "Land Asset Valuation Framework",
  eyebrow: "Duke Farms | Internal decision tool",
  description:
    "A mission-first evaluator for land-asset monetization opportunities across revenue, restrictions, ecological value, risk, and board readiness.",
  airtableBaseId: "appXmt4wwjK4o26rW",
};

export const principles = [
  "Mission fit comes before monetization.",
  "Revenue should support stewardship, not drive land-use compromise.",
  "Restrictions are screened before financial modeling.",
  "Board language stays qualitative where judgment is inherently qualitative.",
];

export const criteria = [
  "Mission alignment",
  "Ecological outcome",
  "Public and community value",
  "Financial durability",
  "Restriction compatibility",
  "Operational feasibility",
];

export const sourceNotes = [
  "Duke Farms sustainability and living-lab materials",
  "Duke Farms Green Acres stewardship application",
  "Duke Farms convenings and community garden public materials",
  "Duke Farms clean-energy and solar/battery public context",
  "NREL solar land-use reference for early footprint diligence",
];

export const opportunities: Opportunity[] = [
  {
    id: "solar",
    name: "Mission-aligned solar lease or offtake",
    category: "Solar and energy",
    type: "Solar lease or energy offtake",
    location: "Previously disturbed, built, parking, or operational areas",
    summary: "Evaluate additional solar only where siting avoids high-value habitat conversion.",
    revenueModel: "Lease, avoided-cost agreement, REC strategy, or partner-funded infrastructure.",
    annualRevenue: { low: 25000, base: 65000, high: 130000 },
    operatingCost: { low: 4000, base: 9000, high: 18000 },
    implementationCost: { low: 40000, base: 120000, high: 300000 },
    missionFit: "Strong",
    ecologicalValue: "Moderate",
    publicBenefit: "Strong",
    revenueConfidence: "Strong",
    risk: "Managed",
    readiness: "Needs constraint review",
    monthsToRevenue: 18,
    constraints: ["Avoid intact habitat conversion.", "Confirm interconnection, easements, and REC implications."],
    diligence: ["Which disturbed areas have usable interconnection?", "Is lease income preferable to avoided-cost value?"],
    nextStep: "Run a site-screening map for disturbed land, roof, canopy, and parking opportunities.",
  },
  {
    id: "restoration",
    name: "Forest restoration credit stack",
    category: "Ecological restoration",
    type: "Ecological restoration credit",
    location: "Forest, floodplain, and habitat restoration zones",
    summary: "Pair restoration work with biodiversity, water, or climate-credit revenue without narrowing conservation goals.",
    revenueModel: "Grant match, ecological-credit sale, mitigation partnership, or sponsored restoration package.",
    annualRevenue: { low: 12000, base: 35000, high: 90000 },
    operatingCost: { low: 10000, base: 22000, high: 42000 },
    implementationCost: { low: 80000, base: 180000, high: 420000 },
    missionFit: "Very strong",
    ecologicalValue: "Very strong",
    publicBenefit: "Strong",
    revenueConfidence: "Moderate",
    risk: "Managed",
    readiness: "Ready for diligence",
    monthsToRevenue: 12,
    constraints: ["Credit terms cannot weaken restoration design.", "Green Acres and easement obligations need early review."],
    diligence: ["Which credit types are compatible with the restoration plan?", "Who owns monitoring obligations?"],
    nextStep: "Pair the restoration budget with a credit-market eligibility screen.",
  },
  {
    id: "easement",
    name: "Conservation easement and stewardship funding",
    category: "Conservation finance",
    type: "Conservation easement or stewardship funding",
    location: "Restricted parcels and high-priority habitat corridors",
    summary: "Use easement-compatible funding to underwrite stewardship and avoid incompatible development pressure.",
    revenueModel: "Stewardship grant, easement value capture, restricted gift, or conservation funding.",
    annualRevenue: { low: 0, base: 15000, high: 50000 },
    operatingCost: { low: 5000, base: 12000, high: 24000 },
    implementationCost: { low: 25000, base: 70000, high: 180000 },
    missionFit: "Very strong",
    ecologicalValue: "Very strong",
    publicBenefit: "Strong",
    revenueConfidence: "Moderate",
    risk: "Low",
    readiness: "Ready for diligence",
    monthsToRevenue: 9,
    constraints: ["Funding terms may restrict future use.", "Legal review of deed, easement, and public-funding terms is required."],
    diligence: ["Which parcels can accept additional stewardship terms?", "Can funding cover ongoing maintenance?"],
    nextStep: "Build a parcel-by-parcel restriction matrix.",
  },
  {
    id: "agriculture",
    name: "Regenerative agriculture partnership",
    category: "Agriculture and food",
    type: "Agriculture lease or production partnership",
    location: "Existing agricultural, grazing, garden, and food-system areas",
    summary: "Structure agriculture revenue around soil health, healthy food, public learning, and community benefit.",
    revenueModel: "Ground lease, produce revenue share, grazing contract, or sponsored food-system program.",
    annualRevenue: { low: 8000, base: 28000, high: 75000 },
    operatingCost: { low: 6000, base: 16000, high: 35000 },
    implementationCost: { low: 20000, base: 65000, high: 160000 },
    missionFit: "Very strong",
    ecologicalValue: "Strong",
    publicBenefit: "Very strong",
    revenueConfidence: "Moderate",
    risk: "Managed",
    readiness: "Needs partner design",
    monthsToRevenue: 9,
    constraints: ["Must remain compatible with habitat, soil, visitor, and food-system goals."],
    diligence: ["Which partners can meet regenerative practice and reporting requirements?", "Can grazing and compost be bundled?"],
    nextStep: "Draft a partner profile and operating covenant.",
  },
  {
    id: "events",
    name: "Mission convening and visitor-use revenue",
    category: "Visitor and events",
    type: "Event and visitor-use revenue",
    location: "Existing visitor, education, and convening spaces",
    summary: "Expand paid convenings only where audience and use reinforce conservation, climate, food, health, or civic mission.",
    revenueModel: "Venue fee, program fee, sponsorship, catering margin, or institutional retreat package.",
    annualRevenue: { low: 30000, base: 95000, high: 220000 },
    operatingCost: { low: 18000, base: 52000, high: 115000 },
    implementationCost: { low: 15000, base: 55000, high: 130000 },
    missionFit: "Strong",
    ecologicalValue: "Limited",
    publicBenefit: "Very strong",
    revenueConfidence: "Strong",
    risk: "Managed",
    readiness: "Ready for diligence",
    monthsToRevenue: 6,
    constraints: ["Capacity, parking, quiet zones, and ecological disturbance must be managed."],
    diligence: ["Which event types are mission-aligned enough for board support?", "What capacity limits protect the site?"],
    nextStep: "Create a mission-aligned rate card and capacity policy.",
  },
  {
    id: "timber",
    name: "Selective timber, invasive removal, and biomass use",
    category: "Timber and biomass",
    type: "Timber or biomass management",
    location: "Forest restoration and invasive-management areas",
    summary: "Treat wood value as a byproduct of ecological management, not a stand-alone harvest program.",
    revenueModel: "Selective timber sale, biomass use, milling partnership, or avoided disposal cost.",
    annualRevenue: { low: 0, base: 12000, high: 45000 },
    operatingCost: { low: 8000, base: 20000, high: 50000 },
    implementationCost: { low: 10000, base: 40000, high: 120000 },
    missionFit: "Moderate",
    ecologicalValue: "Strong",
    publicBenefit: "Moderate",
    revenueConfidence: "Limited",
    risk: "Material",
    readiness: "Needs constraint review",
    monthsToRevenue: 18,
    constraints: ["Harvest optics and habitat impact are sensitive.", "Requires ecological prescription and contractor controls."],
    diligence: ["Is removal ecologically necessary independent of revenue?", "Can materials be reused on-site?"],
    nextStep: "Limit analysis to restoration-driven removals.",
  },
  {
    id: "habitat",
    name: "Habitat and species credit partnership",
    category: "Habitat and species",
    type: "Habitat or species credit",
    location: "High-value habitat, grassland, wetland, and restoration corridors",
    summary: "Assess whether habitat improvements can support species or mitigation credit revenue while keeping biodiversity primary.",
    revenueModel: "Habitat credit, mitigation partnership, sponsor-funded monitoring, or species recovery agreement.",
    annualRevenue: { low: 10000, base: 45000, high: 140000 },
    operatingCost: { low: 12000, base: 28000, high: 70000 },
    implementationCost: { low: 50000, base: 140000, high: 360000 },
    missionFit: "Very strong",
    ecologicalValue: "Very strong",
    publicBenefit: "Strong",
    revenueConfidence: "Limited",
    risk: "Material",
    readiness: "Needs partner design",
    monthsToRevenue: 24,
    constraints: ["Credit rules can be narrow and may limit adaptive management."],
    diligence: ["Which target species or habitats are already priority outcomes?", "Can the agreement preserve adaptive management?"],
    nextStep: "Ask habitat-credit counsel to screen eligible habitat types and obligations.",
  },
  {
    id: "research",
    name: "Research lease and field-station partnerships",
    category: "Research and learning",
    type: "Research lease or field station partnership",
    location: "Restoration plots, monitoring areas, buildings, and outdoor classrooms",
    summary: "Invite universities, labs, and mission partners to fund applied research that improves stewardship and learning.",
    revenueModel: "Research access fee, sponsored monitoring, field-station lease, grant subaward, or data partnership.",
    annualRevenue: { low: 15000, base: 60000, high: 180000 },
    operatingCost: { low: 10000, base: 30000, high: 80000 },
    implementationCost: { low: 25000, base: 85000, high: 220000 },
    missionFit: "Very strong",
    ecologicalValue: "Strong",
    publicBenefit: "Very strong",
    revenueConfidence: "Moderate",
    risk: "Managed",
    readiness: "Needs partner design",
    monthsToRevenue: 12,
    constraints: ["Data governance, publication rights, safety, and staff time need clear terms."],
    diligence: ["Which research questions strengthen Duke Farms' land strategy?", "What fee structure recovers staff cost?"],
    nextStep: "Publish a partner prospectus around restoration, biodiversity, carbon, water, and food-system research.",
  },
  {
    id: "carbon",
    name: "Carbon project with biodiversity guardrails",
    category: "Carbon and climate",
    type: "Carbon project",
    location: "Forest, soil, grassland, wetland, and restoration areas",
    summary: "Consider carbon revenue only where the project also improves biodiversity, soil, water, and resilience.",
    revenueModel: "Carbon credit, inset partnership, sponsor-backed sequestration, or internal carbon-value accounting.",
    annualRevenue: { low: 5000, base: 28000, high: 110000 },
    operatingCost: { low: 12000, base: 30000, high: 90000 },
    implementationCost: { low: 45000, base: 130000, high: 380000 },
    missionFit: "Strong",
    ecologicalValue: "Strong",
    publicBenefit: "Moderate",
    revenueConfidence: "Limited",
    risk: "High",
    readiness: "Needs constraint review",
    monthsToRevenue: 30,
    constraints: ["Additionality, permanence, leakage, monitoring, and reputational claims are high-risk."],
    diligence: ["Would Duke Farms sell credits, retain claims, or use carbon as internal value?", "What reputational standard is required?"],
    nextStep: "Complete a carbon-claims and methodology screen before market engagement.",
  },
  {
    id: "water",
    name: "Water-quality and resilience credit package",
    category: "Water and resilience",
    type: "Water-quality or resilience credit",
    location: "Wetlands, stormwater, floodplain, lake, and watershed restoration areas",
    summary: "Evaluate whether watershed restoration can attract stormwater, nutrient, resilience, or sponsor funding.",
    revenueModel: "Water-quality credit, resilience grant, stormwater partnership, or watershed sponsor agreement.",
    annualRevenue: { low: 10000, base: 40000, high: 120000 },
    operatingCost: { low: 10000, base: 25000, high: 65000 },
    implementationCost: { low: 60000, base: 175000, high: 450000 },
    missionFit: "Very strong",
    ecologicalValue: "Very strong",
    publicBenefit: "Strong",
    revenueConfidence: "Limited",
    risk: "Material",
    readiness: "Needs partner design",
    monthsToRevenue: 24,
    constraints: ["Eligibility depends on watershed location, baseline, and verification requirements."],
    diligence: ["Which projects create measurable downstream benefits?", "Are local buyers or agencies active in a compatible market?"],
    nextStep: "Screen wetland, floodplain, and stormwater projects against local credit and grant programs.",
  },
];
