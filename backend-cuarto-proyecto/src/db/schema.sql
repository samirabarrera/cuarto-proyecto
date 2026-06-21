-- =======================================================
--  FinanceFlow — PostgreSQL Schema
--  Auth: Auth0 (sin contraseñas locales, sin auth0_id)
--  Persistencia: 100% PostgreSQL con pg (node-postgres)
--  Convención: snake_case, UUIDs como PK primaria
-- =======================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =======================================================
-- TABLA: users
-- Perfil del usuario autenticado con Auth0.
-- El UUID generado por PostgreSQL es el identificador único.
-- Auth0 gestiona la sesión; aquí solo se guarda el perfil.
-- =======================================================
CREATE TABLE IF NOT EXISTS users (
    id          TEXT         PRIMARY KEY,          -- Auth0 sub (ej: "auth0|abc123")
    email       VARCHAR(255) UNIQUE,                    -- nullable: Auth0 access tokens no siempre incluyen email
    name        VARCHAR(255),
    picture     TEXT,                              -- URL avatar provisto por Auth0
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índice para lookup rápido por email (usado al sincronizar sesión Auth0)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- =======================================================
-- TABLA: categories
-- Catálogo de categorías. user_id = NULL indica categoría
-- global/predefinida (seed). user_id != NULL = personalizada.
-- =======================================================
CREATE TABLE IF NOT EXISTS categories (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT         REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(100) NOT NULL DEFAULT 'bi-tag',
    color       VARCHAR(20)  NOT NULL DEFAULT '#6366f1',
    type        VARCHAR(10)  NOT NULL DEFAULT 'both'
                    CHECK (type IN ('income', 'expense', 'both')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Un usuario no puede tener dos categorías con el mismo nombre
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_user_name
    ON categories(user_id, name)
    WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type    ON categories(type);


-- =======================================================
-- TABLA: transactions
-- Registro de ingresos y gastos de cada usuario.
-- =======================================================
CREATE TABLE IF NOT EXISTS transactions (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID           REFERENCES categories(id) ON DELETE SET NULL,
    description     VARCHAR(255)   NOT NULL,
    amount          NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    type            VARCHAR(10)    NOT NULL CHECK (type IN ('income', 'expense')),
    date            DATE           NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Índices para los filtros más comunes del GET /api/transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id  ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date     ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type     ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
-- Índice compuesto para filtros por usuario + mes
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
    ON transactions(user_id, date DESC);

-- =======================================================
-- FUNCIÓN + TRIGGERS: auto-actualizar updated_at
-- =======================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();





-- =======================================================
-- SEED: Categorías globales predefinidas (user_id = NULL)
-- =======================================================
INSERT INTO categories (user_id, name, icon, color, type) VALUES
    -- GASTOS
    (NULL, 'Alimentación',    'bi-basket',           '#f97316', 'expense'),
    (NULL, 'Transporte',      'bi-car-front',         '#3b82f6', 'expense'),
    (NULL, 'Entretenimiento', 'bi-controller',        '#a855f7', 'expense'),
    (NULL, 'Salud',           'bi-heart-pulse',       '#ef4444', 'expense'),
    (NULL, 'Educación',       'bi-book',              '#06b6d4', 'expense'),
    (NULL, 'Ropa',            'bi-bag',               '#ec4899', 'expense'),
    (NULL, 'Hogar',           'bi-house',             '#84cc16', 'expense'),
    (NULL, 'Suscripciones',   'bi-collection-play',   '#8b5cf6', 'expense'),
    (NULL, 'Restaurantes',    'bi-cup-hot',           '#f59e0b', 'expense'),
    (NULL, 'Viajes',          'bi-airplane',          '#14b8a6', 'expense'),
    (NULL, 'Mascotas',        'bi-house-heart',       '#fb923c', 'expense'),
    (NULL, 'Otros gastos',    'bi-three-dots',        '#94a3b8', 'expense'),
    -- INGRESOS
    (NULL, 'Salario',         'bi-briefcase',         '#22c55e', 'income'),
    (NULL, 'Freelance',       'bi-laptop',            '#10b981', 'income'),
    (NULL, 'Inversiones',     'bi-graph-up-arrow',    '#6366f1', 'income'),
    (NULL, 'Ventas',          'bi-shop',              '#f59e0b', 'income'),
    (NULL, 'Regalos',         'bi-gift',              '#e879f9', 'income'),
    (NULL, 'Otros ingresos',  'bi-plus-circle',       '#94a3b8', 'income')
ON CONFLICT DO NOTHING;



