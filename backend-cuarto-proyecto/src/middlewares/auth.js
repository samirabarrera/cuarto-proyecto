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

    const sub     = payload?.sub     ?? null;
    const email   = payload?.email   ?? null;
    // Auth0 custom claims (namespace opcional) o claims estándar
    const name    = payload?.name    ?? payload?.['https://financeflow.app/name']    ?? null;
    const picture = payload?.picture ?? payload?.['https://financeflow.app/picture'] ?? null;

    if (!sub) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido: falta el campo sub.',
      });
    }

    // COALESCE: solo se actualizan los campos que vienen con valor;
    // si el token no trae email/name/picture, se conserva lo que ya
    // estaba en la BD (no se sobreescribe con NULL).
    const { rows } = await query(
      `INSERT INTO users (id, email, name, picture)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
         SET email   = COALESCE(EXCLUDED.email,   users.email),
             name    = COALESCE(EXCLUDED.name,    users.name),
             picture = COALESCE(EXCLUDED.picture, users.picture)
       RETURNING id, email, name, picture, created_at`,
      [sub, email, name, picture]
    );

    req.user = rows[0]; // { id, email, name, picture, created_at }
    next();
  } catch (err) {
    console.error('[attachUser]', err);
    res.status(500).json({ success: false, error: 'Error al identificar al usuario.' });
  }
};

// Middleware combinado listo para usar en las rutas protegidas
export const requireAuth = [validateToken, attachUser];