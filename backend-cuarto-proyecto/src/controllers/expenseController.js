import { query } from '../db/database.js';

// GET /api/expenses?month=YYYY-MM&category_id=uuid&currency=GTQ
export const getExpenses = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { month, category_id, currency } = req.query;

    const conditions = ['e.user_id = $1'];
    const params     = [user_id];
    let i = 2;

    if (month) {
      conditions.push(`to_char(e.date, 'YYYY-MM') = $${i++}`);
      params.push(month);
    }
    if (category_id) {
      conditions.push(`e.category_id = $${i++}`);
      params.push(category_id);
    }
    if (currency) {
      conditions.push(`e.currency = $${i++}`);
      params.push(currency.toUpperCase());
    }

    const sql = `
      SELECT
        e.id,
        e.user_id,
        e.category_id,
        e.amount,
        e.currency,
        e.description,
        e.date,
        e.created_at,
        COALESCE(c.name,  'Sin categoría') AS category_name,
        COALESCE(c.icon,  'bi-question')   AS category_icon,
        COALESCE(c.color, '#94a3b8')       AS category_color
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY e.date DESC, e.created_at DESC
    `;

    const { rows } = await query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[getExpenses]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/expenses/:id
export const getExpenseById = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id }  = req.params;

    const { rows } = await query(
      `SELECT
         e.*,
         COALESCE(c.name,  'Sin categoría') AS category_name,
         COALESCE(c.icon,  'bi-question')   AS category_icon,
         COALESCE(c.color, '#94a3b8')       AS category_color
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1 AND e.user_id = $2`,
      [id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Gasto no encontrado.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[getExpenseById]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/expenses
export const createExpense = async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      amount,
      category_id,
      description,
      date,
      currency = 'GTQ',
    } = req.body;

    if (!amount || !date) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: amount, date.',
      });
    }

    const { rows } = await query(
      `INSERT INTO expenses (user_id, category_id, amount, currency, description, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, category_id || null, parseFloat(amount), currency.toUpperCase(), description || null, date]
    );

    const expense = rows[0];

    // Enriquecer con datos de categoría
    const { rows: catRows } = await query(
      `SELECT name, icon, color FROM categories WHERE id = $1`,
      [expense.category_id]
    );
    const cat = catRows[0];

    res.status(201).json({
      success: true,
      data: {
        ...expense,
        category_name:  cat?.name  ?? 'Sin categoría',
        category_icon:  cat?.icon  ?? 'bi-question',
        category_color: cat?.color ?? '#94a3b8',
      },
    });
  } catch (err) {
    console.error('[createExpense]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id }  = req.params;
    const { amount, category_id, description, date, currency } = req.body;

    const { rows: existing } = await query(
      `SELECT * FROM expenses WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Gasto no encontrado.' });
    }

    const prev = existing[0];
    const { rows } = await query(
      `UPDATE expenses
       SET
         amount      = $1,
         category_id = $2,
         description = $3,
         date        = $4,
         currency    = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        amount      !== undefined ? parseFloat(amount) : prev.amount,
        category_id !== undefined ? category_id        : prev.category_id,
        description !== undefined ? description        : prev.description,
        date        !== undefined ? date               : prev.date,
        currency    !== undefined ? currency.toUpperCase() : prev.currency,
        id,
        user_id,
      ]
    );

    const expense = rows[0];
    const { rows: catRows } = await query(
      `SELECT name, icon, color FROM categories WHERE id = $1`,
      [expense.category_id]
    );
    const cat = catRows[0];

    res.json({
      success: true,
      data: {
        ...expense,
        category_name:  cat?.name  ?? 'Sin categoría',
        category_icon:  cat?.icon  ?? 'bi-question',
        category_color: cat?.color ?? '#94a3b8',
      },
    });
  } catch (err) {
    console.error('[updateExpense]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id }  = req.params;

    const { rowCount } = await query(
      `DELETE FROM expenses WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Gasto no encontrado.' });
    }

    res.json({ success: true, message: 'Gasto eliminado.' });
  } catch (err) {
    console.error('[deleteExpense]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
