import 'dotenv/config';
import { auth } from 'express-oauth2-jwt-bearer';
import { query } from '../db/database.js';


export const validateToken = auth({
  audience:        process.env.AUTH0_AUDIENCE,
  issuerBaseURL:   `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: 'RS256',
});

export const attachUser = async (req, res, next) => {
  try {
    const payload = req.auth?.payload;

    const sub   = payload?.sub   ?? null;
    const email = payload?.email ?? null;

    if (!sub) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido: falta el campo sub.',
      });
    }

    const { rows } = await query(
      `INSERT INTO users (id, email)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE
         SET email = EXCLUDED.email
       RETURNING id, email, created_at`,
      [sub, email]
    );

    req.user = rows[0]; // { id: 'auth0|abc123', email, created_at }
    next();
  } catch (err) {
    console.error('[attachUser]', err);
    res.status(500).json({ success: false, error: 'Error al identificar al usuario.' });
  }
};

// Middleware combinado listo para usar en las rutas protegidas
export const requireAuth = [validateToken, attachUser];