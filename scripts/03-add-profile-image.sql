-- Agregar columna profile_image a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Crear índice para mejor rendimiento (opcional)
CREATE INDEX IF NOT EXISTS idx_users_profile_image ON users(profile_image) WHERE profile_image IS NOT NULL;
