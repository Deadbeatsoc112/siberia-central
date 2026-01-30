-- Usuario: admin, Password: admin (texto plano para testing)
INSERT INTO users (username, password_hash)
VALUES ('admin1', 'admin')
ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash;
