import { query } from '../db/database.js';

// GET /api/goals
export const getGoals = async (req, res) => {
  try {
    const user_id = req.user?.id ?? null;

    const { rows } = await query(
      `SELECT * FROM goals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[getGoals]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/goals
export const createGoal = async (req, res) => {
  try {
    const user_id = req.user?.id ?? null;
    const { name, target_amount, current_amount = 0, deadline, color = '#6366f1' } = req.body;

    if (!name || !target_amount) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: name, target_amount',
      });
    }

    const { rows } = await query(
      `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, color)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user_id,
        name,
        parseFloat(target_amount),
        parseFloat(current_amount),
        deadline || null,
        color,
      ]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[createGoal]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/goals/:id
export const updateGoal = async (req, res) => {
  try {
    const user_id = req.user?.id ?? null;
    const { id } = req.params;
    const { name, target_amount, current_amount, deadline, color } = req.body;

    // Verificar que la meta existe y pertenece al usuario
    const { rows: existing } = await query(
      `SELECT * FROM goals WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Meta no encontrada.' });
    }

    const prev = existing[0];
    const { rows } = await query(
      `UPDATE goals
       SET
         name           = $1,
         target_amount  = $2,
         current_amount = $3,
         deadline       = $4,
         color          = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        name           ?? prev.name,
        target_amount  !== undefined ? parseFloat(target_amount)  : prev.target_amount,
        current_amount !== undefined ? parseFloat(current_amount) : prev.current_amount,
        deadline       !== undefined ? deadline : prev.deadline,
        color          ?? prev.color,
        id,
        user_id,
      ]
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[updateGoal]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/goals/:id
export const deleteGoal = async (req, res) => {
  try {
    const user_id = req.user?.id ?? null;
    const { id } = req.params;

    const { rowCount } = await query(
      `DELETE FROM goals WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Meta no encontrada.' });
    }

    res.json({ success: true, message: 'Meta eliminada.' });
  } catch (err) {
    console.error('[deleteGoal]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
