import { query } from '../db/database.js';

// GET /api/summary?month=YYYY-MM&currency=GTQ
// Total de gastos del mes y total histórico
export const getSummary = async (req, res) => {
  try {
    const user_id = req.user.id;
    const month    = req.query.month    || new Date().toISOString().slice(0, 7);
    const currency = (req.query.currency || 'GTQ').toUpperCase();

    const { rows } = await query(
      `SELECT
        -- Total del mes solicitado
        SUM(CASE WHEN to_char(date, 'YYYY-MM') = $2 THEN amount ELSE 0 END) AS monthly_total,
        COUNT(CASE WHEN to_char(date, 'YYYY-MM') = $2 THEN 1 END)          AS monthly_count,
        -- Total histórico
        SUM(amount)   AS total,
        COUNT(*)::INT AS total_count
       FROM expenses
       WHERE user_id = $1 AND currency = $3`,
      [user_id, month, currency]
    );

    const r = rows[0];
    res.json({
      success: true,
      data: {
        month,
        currency,
        monthly_total: parseFloat(r.monthly_total) || 0,
        monthly_count: parseInt(r.monthly_count)   || 0,
        total:         parseFloat(r.total)          || 0,
        total_count:   parseInt(r.total_count)      || 0,
      },
    });
  } catch (err) {
    console.error('[getSummary]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/summary/by-category?month=YYYY-MM&currency=GTQ
// Gastos agrupados por categoría en un mes
export const getSummaryByCategory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const month    = req.query.month    || new Date().toISOString().slice(0, 7);
    const currency = (req.query.currency || 'GTQ').toUpperCase();

    const { rows } = await query(
      `SELECT
        COALESCE(c.name,  'Sin categoría') AS name,
        COALESCE(c.color, '#94a3b8')       AS color,
        COALESCE(c.icon,  'bi-question')   AS icon,
        SUM(e.amount)                      AS total,
        COUNT(*)::INT                      AS count
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
         AND to_char(e.date, 'YYYY-MM') = $2
         AND e.currency = $3
       GROUP BY c.name, c.color, c.icon
       HAVING SUM(e.amount) > 0
       ORDER BY total DESC`,
      [user_id, month, currency]
    );

    const data = rows.map(r => ({ ...r, total: parseFloat(r.total) }));
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getSummaryByCategory]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/summary/monthly-trend?currency=GTQ
// Gastos totales de los últimos 6 meses
export const getMonthlyTrend = async (req, res) => {
  try {
    const user_id = req.user.id;
    const currency = (req.query.currency || 'GTQ').toUpperCase();

    const { rows } = await query(
      `SELECT
        to_char(date, 'YYYY-MM') AS month,
        SUM(amount)::FLOAT       AS total,
        COUNT(*)::INT            AS count
       FROM expenses
       WHERE user_id = $1
         AND currency = $2
         AND date >= date_trunc('month', NOW()) - INTERVAL '5 months'
       GROUP BY to_char(date, 'YYYY-MM')
       ORDER BY month ASC`,
      [user_id, currency]
    );

    // Garantizar que aparezcan los 6 meses aunque no haya gastos
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().slice(0, 7));
    }

    const rowMap = Object.fromEntries(rows.map(r => [r.month, r]));
    const trend  = months.map(m => ({
      month:    m,
      total:    rowMap[m]?.total ?? 0,
      count:    rowMap[m]?.count ?? 0,
      currency,
    }));

    res.json({ success: true, data: trend });
  } catch (err) {
    console.error('[getMonthlyTrend]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
