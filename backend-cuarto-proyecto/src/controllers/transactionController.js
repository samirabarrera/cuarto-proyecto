import { query } from '../db/database.js';

// GET /api/transactions
export const getTransactions = async (req, res) => {
  try {
    const user_id = req.user?.id ?? null;
    const { month, type, category_id } = req.query;

    // Construir filtros dinámicamente
    const conditions = ['t.user_id = $1'];
    const params = [user_id];
    let i = 2;

    if (month) {
      conditions.push(`to_char(t.date, 'YYYY-MM') = $${i++}`);
      params.push(month);
    }
    if (type) {
      conditions.push(`t.type = $${i++}`);
      params.push(type);
    }
    if (category_id) {
      conditions.push(`t.category_id = $${i++}`);
      params.push(category_id);
    }

    const sql = `
      SELECT
        t.id,
        t.user_id,
        t.category_id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.notes,
        t.created_at,
        t.updated_at,
        COALESCE(c.name,  'Sin categoría') AS category_name,
        COALESCE(c.icon,  'bi-question')   AS category_icon,
        COALESCE(c.color, '#94a3b8')       AS category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.date DESC, t.created_at DESC
    `;

    const { rows } = await query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[getTransactions]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/transactions
export const createTransaction = async (req, res) => {
  try {
    const user_id = req.user?.id ?? null;
    const { description, amount, type, category_id, date, notes } = req.body;

    if (!description || !amount || !type || !category_id || !date) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: description, amount, type, category_id, date',
      });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, error: 'type debe ser "income" o "expense".' });
    }

    const { rows } = await query(
      `INSERT INTO transactions (user_id, category_id, description, amount, type, date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, category_id, description, parseFloat(amount), type, date, notes || null]
    );

    const tx = rows[0];
    const { rows: catRows } = await query(
      `SELECT name, icon, color FROM categories WHERE id = $1`,
      [tx.category_id]
    );
    const cat = catRows[0];

    res.status(201).json({
      success: true,
      data: {
        ...tx,
        category_name:  cat?.name  ?? 'Sin categoría',
        category_icon:  cat?.icon  ?? 'bi-question',
        category_color: cat?.color ?? '#94a3b8',
      },
    });
  } catch (err) {
    console.error('[createTransaction]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/transactions/:id
export const updateTransaction = async (req, res) => {
  try {
    const user_id = req.user?.id ?? null;
    const { id } = req.params;
    const { description, amount, type, category_id, date, notes } = req.body;

    // Verificar que la transacción existe y pertenece al usuario
    const { rows: existing } = await query(
      `SELECT * FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Transacción no encontrada.' });
    }

    const prev = existing[0];
    const { rows } = await query(
      `UPDATE transactions
       SET
         description = $1,
         amount      = $2,
         type        = $3,
         category_id = $4,
         date        = $5,
         notes       = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [
        description  ?? prev.description,
        amount       !== undefined ? parseFloat(amount) : prev.amount,
        type         ?? prev.type,
        category_id  ?? prev.category_id,
        date         ?? prev.date,
        notes        !== undefined ? notes : prev.notes,
        id,
        user_id,
      ]
    );

    const tx = rows[0];
    const { rows: catRows } = await query(
      `SELECT name, icon, color FROM categories WHERE id = $1`,
      [tx.category_id]
    );
    const cat = catRows[0];

    res.json({
      success: true,
      data: {
        ...tx,
        category_name:  cat?.name  ?? 'Sin categoría',
        category_icon:  cat?.icon  ?? 'bi-question',
        category_color: cat?.color ?? '#94a3b8',
      },
    });
  } catch (err) {
    console.error('[updateTransaction]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const user_id = req.user?.id ?? null;
    const { id } = req.params;

    const { rowCount } = await query(
      `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Transacción no encontrada.' });
    }

    res.json({ success: true, message: 'Transacción eliminada.' });
  } catch (err) {
    console.error('[deleteTransaction]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
