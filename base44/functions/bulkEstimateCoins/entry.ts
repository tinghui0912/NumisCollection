import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const coins = await base44.entities.Coin.list();
  const results = { updated: 0, failed: 0, details: [] };

  for (const coin of coins) {
    const prompt = `Tu es un expert numismate. Estime la valeur marchande actuelle en euros de cette pièce de monnaie.
Caractéristiques :
- Nom: ${coin.name || 'N/A'}
- Pays: ${coin.country || 'N/A'}
- Année: ${coin.year || 'N/A'}
- Dénomination: ${coin.denomination || 'N/A'}
- État: ${coin.condition || 'N/A'}
- Rareté: ${coin.rarity || 'N/A'}
- Métal: ${coin.metal || 'N/A'}
- Catégorie: ${coin.category || 'N/A'}

Consulte les données de marché récentes (Gadoury, CGB, Numista, enchères). Donne une estimation réaliste.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          estimated_value: { type: 'number' },
        },
      },
    });

    if (result?.estimated_value && result.estimated_value > 0) {
      await base44.entities.Coin.update(coin.id, { estimated_value: result.estimated_value });
      results.updated++;
      results.details.push({ id: coin.id, name: coin.name, value: result.estimated_value });
    } else {
      results.failed++;
    }
  }

  return Response.json(results);
});