import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [coins, banknotes] = await Promise.all([
    base44.entities.Coin.list(),
    base44.entities.Banknote.list(),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 15;
  const colW = (pageW - margin * 2) / 4;

  const gold = [180, 120, 40];
  const dark = [30, 25, 20];
  const gray = [100, 95, 90];
  const lightGray = [240, 238, 235];

  const totalItems = coins.length + banknotes.length;
  const totalValue = [...coins, ...banknotes].reduce((s, i) => s + (i.estimated_value || 0), 0);
  const totalInvested = [...coins, ...banknotes].reduce((s, i) => s + (i.purchase_price || 0), 0);
  const totalGain = totalValue - totalInvested;

  // Format money without Unicode issues
  const fmt = (n) => {
    if (n === null || n === undefined) return '-';
    return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' EUR';
  };

  // Transliterate accented characters to ASCII for jsPDF Helvetica compatibility
  const safe = (str) => {
    if (!str && str !== 0) return '-';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
      .replace(/\u00e6/g, 'ae').replace(/\u00c6/g, 'AE')
      .replace(/\u00f8/g, 'o').replace(/\u00d8/g, 'O')
      .replace(/\u00fe/g, 'th').replace(/\u00df/g, 'ss')
      .replace(/[^\x00-\x7F]/g, '?'); // fallback for remaining non-ASCII
  };

  // ── Header ──────────────────────────────────────────────
  doc.setFillColor(...gold);
  doc.rect(0, 0, pageW, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('NumisCollection', margin, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Rapport complet de collection numismatique', margin, 24);

  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(9);
  const dateStrSafe = new Date().toLocaleDateString('en-GB');
  doc.text(`Genere le ${dateStrSafe}`, pageW - margin, 24, { align: 'right' });
  doc.text(`Proprietaire : ${safe(user.full_name || user.email)}`, pageW - margin, 30, { align: 'right' });

  let y = 50;

  // ── Summary cards ────────────────────────────────────────
  const cards = [
    { label: 'Pièces', value: String(coins.length) },
    { label: 'Billets', value: String(banknotes.length) },
    { label: 'Valeur estimee', value: fmt(totalValue) },
    { label: 'Plus-value', value: `${totalGain >= 0 ? '+' : ''}${fmt(totalGain)}` },
  ];

  cards.forEach((card, i) => {
    const x = margin + i * colW;
    doc.setFillColor(...lightGray);
    doc.roundedRect(x, y, colW - 3, 22, 2, 2, 'F');
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, x + (colW - 3) / 2, y + 8, { align: 'center' });
    doc.setTextColor(...gold);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + (colW - 3) / 2, y + 17, { align: 'center' });
  });

  y += 32;

  // ── Table helper ─────────────────────────────────────────
  const drawTableHeader = (columns, colWidths, startY) => {
    doc.setFillColor(...gold);
    doc.rect(margin, startY, pageW - margin * 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    let x = margin + 2;
    columns.forEach((col, i) => {
      doc.text(col, x, startY + 5.5);
      x += colWidths[i];
    });
    return startY + 8;
  };

  const drawTableRow = (cells, colWidths, startY, rowIndex) => {
    if (rowIndex % 2 === 0) {
      doc.setFillColor(250, 248, 245);
      doc.rect(margin, startY, pageW - margin * 2, 7, 'F');
    }
    doc.setTextColor(...dark);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    let x = margin + 2;
    cells.forEach((cell, i) => {
      const text = String(cell ?? '-');
      doc.text(text, x, startY + 5, { maxWidth: colWidths[i] - 2 });
      x += colWidths[i];
    });
    return startY + 7;
  };

  const checkNewPage = (currentY, needed = 15) => {
    if (currentY + needed > 280) {
      doc.addPage();
      return 15;
    }
    return currentY;
  };

  // ── Coins section ─────────────────────────────────────────
  doc.setTextColor(...gold);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Pieces de monnaie', margin, y);
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, pageW - margin, y + 2);
  y += 8;

  if (coins.length === 0) {
    doc.setTextColor(...gray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Aucune piece dans la collection.', margin, y);
    y += 10;
  } else {
    const coinCols = ['Nom', 'Pays', 'Annee', 'Etat', 'Metal', 'Categorie', 'Prix achat', 'Valeur est.'];
    const coinWidths = [42, 22, 16, 12, 16, 22, 22, 22];
    y = drawTableHeader(coinCols, coinWidths, y);
    coins.forEach((coin, i) => {
      y = checkNewPage(y);
      y = drawTableRow([
        safe(coin.name),
        safe(coin.country),
        coin.year ?? '-',
        safe(coin.condition),
        safe(coin.metal),
        safe(coin.category),
        coin.purchase_price ? fmt(coin.purchase_price) : '-',
        coin.estimated_value ? fmt(coin.estimated_value) : '-',
      ], coinWidths, y, i);
    });
    y += 5;
  }

  // ── Banknotes section ─────────────────────────────────────
  y = checkNewPage(y, 20);
  doc.setTextColor(...gold);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Billets de banque', margin, y);
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, pageW - margin, y + 2);
  y += 8;

  if (banknotes.length === 0) {
    doc.setTextColor(...gray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Aucun billet dans la collection.', margin, y);
    y += 10;
  } else {
    const noteCols = ['Nom', 'Pays', 'Annee', 'Denomination', 'Etat', 'Categorie', 'Prix achat', 'Valeur est.'];
    const noteWidths = [38, 22, 16, 26, 14, 24, 22, 22];
    y = drawTableHeader(noteCols, noteWidths, y);
    banknotes.forEach((note, i) => {
      y = checkNewPage(y);
      y = drawTableRow([
        safe(note.name),
        safe(note.country),
        note.year ?? '-',
        safe(note.denomination),
        safe(note.condition),
        safe(note.category),
        note.purchase_price ? fmt(note.purchase_price) : '-',
        note.estimated_value ? fmt(note.estimated_value) : '-',
      ], noteWidths, y, i);
    });
    y += 5;
  }

  // ── Footer on last page ───────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(...lightGray);
    doc.rect(0, 287, pageW, 10, 'F');
    doc.setTextColor(...gray);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('NumisCollection - Rapport prive', margin, 293);
    doc.text(`Page ${p} / ${pageCount}`, pageW - margin, 293, { align: 'right' });
  }

  const pdfBytes = doc.output('arraybuffer');
  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=numiscollection-rapport.pdf',
    },
  });
});