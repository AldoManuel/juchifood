-- Insertar usuarios de ejemplo
INSERT INTO users (email, password, name, description, location) VALUES
('maria@example.com', 'password123', 'Puesto de María', 'Comida casera tradicional, especialidad en tamales y pozole', 'DACyTI'),
('carlos@example.com', 'password123', 'Antojitos Carlos', 'Tacos, quesadillas y tortas preparadas al momento', 'DACyTI'),
('ana@example.com', 'password123', 'Cocina de Ana', 'Desayunos completos y comida corrida todos los días', 'DAIA'),
('luis@example.com', 'password123', 'Mariscos Luis', 'Mariscos frescos, ceviches y cócteles de camarón', 'DACB'),
('sofia@example.com', 'password123', 'Postres Sofia', 'Postres caseros, pasteles y gelatinas artesanales', 'Externo')
ON CONFLICT (email) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (user_id, name, price, description, image_url) VALUES
-- Productos de María (DACyTI)
((SELECT id FROM users WHERE email = 'maria@example.com'), 'Tamales de Dulce', 25.00, 'Tamales dulces con pasas y piña, masa rosa tradicional', '/placeholder.svg?height=200&width=300'),
((SELECT id FROM users WHERE email = 'maria@example.com'), 'Pozole Rojo', 45.00, 'Pozole tradicional con carne de cerdo, acompañado de lechuga, rábano y orégano', '/placeholder.svg?height=200&width=300'),
((SELECT id FROM users WHERE email = 'maria@example.com'), 'Atole de Chocolate', 15.00, 'Atole casero de chocolate caliente, perfecto para el desayuno', '/placeholder.svg?height=200&width=300'),

-- Productos de Carlos (DACyTI)
((SELECT id FROM users WHERE email = 'carlos@example.com'), 'Tacos de Pastor', 12.00, 'Tacos al pastor con piña, cebolla y cilantro en tortilla de maíz', '/placeholder.svg?height=200&width=300'),
((SELECT id FROM users WHERE email = 'carlos@example.com'), 'Quesadillas de Flor de Calabaza', 18.00, 'Quesadillas con flor de calabaza fresca y queso oaxaca', '/placeholder.svg?height=200&width=300'),
((SELECT id FROM users WHERE email = 'carlos@example.com'), 'Torta Ahogada', 35.00, 'Torta tradicional tapatía bañada en salsa de tomate picante', '/placeholder.svg?height=200&width=300'),

-- Productos de Ana (DAIA)
((SELECT id FROM users WHERE email = 'ana@example.com'), 'Desayuno Completo', 55.00, 'Huevos al gusto, frijoles, chilaquiles, fruta y café', '/placeholder.svg?height=200&width=300'),
((SELECT id FROM users WHERE email = 'ana@example.com'), 'Chilaquiles Verdes', 30.00, 'Chilaquiles en salsa verde con crema, queso y cebolla', '/placeholder.svg?height=200&width=300'),
((SELECT id FROM users WHERE email = 'ana@example.com'), 'Café de Olla', 12.00, 'Café tradicional con canela y piloncillo', '/placeholder.svg?height=200&width=300'),

-- Productos de Luis (DACB)
((SELECT id FROM users WHERE email = 'luis@example.com'), 'Ceviche de Camarón', 65.00, 'Ceviche fresco de camarón con limón, cebolla morada y cilantro', '/placeholder.svg?height=200&width=300'),
((SELECT id FROM users WHERE email = 'luis@example.com'), 'Cóctel de Mariscos', 75.00, 'Cóctel mixto con camarón, pulpo y ostiones', '/placeholder.svg?height=200&width=300'),
((SELECT id FROM users WHERE email = 'luis@example.com'), 'Tostada de Ceviche', 25.00, 'Tostada crujiente con ceviche de pescado fresco', '/placeholder.svg?height=200&width=300'),

-- Productos de Sofia (Externo)
((SELECT id FROM users WHERE email = 'sofia@example.com'), 'Pastel de Tres Leches', 40.00, 'Pastel esponjoso bañado en tres leches con canela', '/placeholder.svg?height=200&width=300'),
((SELECT id FROM users WHERE email = 'sofia@example.com'), 'Gelatina de Mosaico', 20.00, 'Gelatina artesanal con colores y sabores variados', '/placeholder.svg?height=200&width=300'),
((SELECT id FROM users WHERE email = 'sofia@example.com'), 'Flan Napolitano', 25.00, 'Flan casero con caramelo y vainilla', '/placeholder.svg?height=200&width=300')
ON CONFLICT DO NOTHING;
