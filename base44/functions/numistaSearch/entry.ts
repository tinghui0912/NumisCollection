import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const NUMISTA_API_KEY = Deno.env.get("NUMISTA_API_KEY");
const NUMISTA_BASE_URL = "https://api.numista.com/v3";

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { action, query, type_id, lang = "fr" } = body;

  const headers = {
    "Numista-API-Key": NUMISTA_API_KEY,
    "Content-Type": "application/json",
  };

  if (action === "search") {
    const params = new URLSearchParams({ lang, count: "10" });
    if (query) params.set("q", query);
    if (body.year) params.set("year", String(body.year));
    if (body.issuer) params.set("issuer", body.issuer);
    if (body.category === "coin") params.set("object_type", "1");
    else if (body.category === "banknote") params.set("object_type", "3");

    const res = await fetch(`${NUMISTA_BASE_URL}/types?${params.toString()}`, { headers });
    const data = await res.json();
    return Response.json(data);
  }

  if (action === "getType") {
    const res = await fetch(`${NUMISTA_BASE_URL}/types/${type_id}?lang=${lang}`, { headers });
    const data = await res.json();
    return Response.json(data);
  }

  if (action === "getPrices") {
    // Get issues first, then prices for first issue
    const issuesRes = await fetch(`${NUMISTA_BASE_URL}/types/${type_id}/issues?lang=${lang}`, { headers });
    const issuesData = await issuesRes.json();
    
    if (issuesData.issues && issuesData.issues.length > 0) {
      const issueId = issuesData.issues[0].id;
      const pricesRes = await fetch(`${NUMISTA_BASE_URL}/types/${type_id}/issues/${issueId}/prices?lang=${lang}`, { headers });
      const pricesData = await pricesRes.json();
      return Response.json({ issues: issuesData.issues, prices: pricesData });
    }
    return Response.json({ issues: [], prices: null });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
});