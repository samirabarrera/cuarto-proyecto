import { query } from '../db/database.js';

// GET /api/category
// Devuelve categorías globales (user_id IS NULL) +
// categorías personalizadas del usuario autenticado.
export const getCategories = async (req, res) => {
  try {
    const user_id = req.user.id;

    const { rows } = await query(
      `SELECT id, user_id, name, icon, color, created_at
       FROM categories
       WHERE user_id IS NULL OR user_id = $1
       ORDER BY name ASC`,
      [user_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[getCategories]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/category — crear categoría personalizada del usuario
export const createCategory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name, icon = 'bi-tag', color = '#6366f1' } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'El nombre es requerido.' });
    }

    const { rows } = await query(
      `INSERT INTO categories (user_id, name, icon, color)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, name, icon, color]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[createCategory]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/category/:id — actualizar categoría propia del usuario
export const updateCategory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id }  = req.params;
    const { name, icon, color } = req.body;

    const { rows: existing } = await query(
      `SELECT * FROM categories WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Categoría no encontrada o no tienes permiso.' });
    }

    const prev = existing[0];
    const { rows } = await query(
      `UPDATE categories
       SET name  = $1,
           icon  = $2,
           color = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [name ?? prev.name, icon ?? prev.icon, color ?? prev.color, id, user_id]
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[updateCategory]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/category/:id — solo categorías propias del usuario
export const deleteCategory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id }  = req.params;

    const { rowCount } = await query(
      `DELETE FROM categories WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Categoría no encontrada o no tienes permiso.' });
    }

    res.json({ success: true, message: 'Categoría eliminada.' });
  } catch (err) {
    console.error('[deleteCategory]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
