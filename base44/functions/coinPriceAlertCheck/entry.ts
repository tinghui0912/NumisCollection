import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const body = await req.json();
  const { event, data } = body;

  // Only react to coin updates where estimated_value changed
  if (!data || data.estimated_value == null) {
    return Response.json({ skipped: true });
  }

  const coinOwnerId = data.created_by;
  const estimatedValue = data.estimated_value;

  // Fetch all active alerts for this coin's owner
  const alerts = await base44.asServiceRole.entities.PriceAlert.filter({
    created_by: coinOwnerId,
    active: true,
  });

  for (const alert of alerts) {
    if (estimatedValue >= alert.threshold) {
      // Send email notification
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: alert.email,
        subject: `🔔 Alerte prix — ${data.name} dépasse ${alert.threshold.toLocaleString('fr-FR')} €`,
        body: `Bonjour,

Votre alerte de prix a été déclenchée !

Pièce : ${data.name}
Pays : ${data.country || 'N/A'}
Année : ${data.year || 'N/A'}
État : ${data.condition || 'N/A'}

Valeur estimée actuelle : ${estimatedValue.toLocaleString('fr-FR')} €
Seuil configuré : ${alert.threshold.toLocaleString('fr-FR')} €

Connectez-vous à votre collection NumisCollection pour plus de détails.

Bonne collection !`,
      });

      // Update last_triggered date
      await base44.asServiceRole.entities.PriceAlert.update(alert.id, {
        last_triggered: new Date().toISOString(),
      });
    }
  }

  return Response.json({ processed: true, alertsChecked: alerts.length });
});