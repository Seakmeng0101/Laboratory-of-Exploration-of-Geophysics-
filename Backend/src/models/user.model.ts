import pool from '../config/db';

export async function findUserByEmail(email: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, email, password, role, is_active FROM users WHERE email = ?`,
    [email],
  );
  return rows[0] ?? null;
}

export async function createUser(name: string, email: string, hashedPassword: string, role: string) {
  await pool.execute(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    [name, email, hashedPassword, role],
  );
  const [rows] = await pool.execute<any[]>(
    `SELECT id, email, role FROM users WHERE email = ?`,
    [email],
  );
  return rows[0];
}

export async function getAllUsers() {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, email, role, is_active, created_at FROM users`,
  );
  return rows;
}

export async function findUserById(id: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, email, role, is_active FROM users WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function deleteUser(id: string) {
  await pool.execute(`DELETE FROM users WHERE id = ?`, [id]);
}

export async function saveRefreshToken(userId: string, token: string, expiresAt: string) {
  await pool.execute(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
    [userId, token, expiresAt],
  );
}

export async function findRefreshToken(token: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT rt.user_id, rt.expires_at, u.email, u.role, u.is_active
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token = ?`,
    [token],
  );
  return rows[0] ?? null;
}

export async function deleteRefreshToken(token: string) {
  await pool.execute(`DELETE FROM refresh_tokens WHERE token = ?`, [token]);
}

export async function saveResetToken(email: string, token: string, expires: string) {
  await pool.execute(
    `UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?`,
    [token, expires, email],
  );
}

export async function findUserByResetToken(token: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > NOW()`,
    [token],
  );
  return rows[0] ?? null;
}

export async function clearResetToken(id: string, hashedPassword: string) {
  await pool.execute(
    `UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?`,
    [hashedPassword, id],
  );
}

export async function saveOtp(userId: string, otp: string, expires: string) {
  await pool.execute(
    `UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?`,
    [otp, expires, userId],
  );
}

export async function findUserByOtp(otp: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, email, role FROM users WHERE otp_code = ? AND otp_expires > NOW()`,
    [otp],
  );
  return rows[0] ?? null;
}

export async function clearOtp(userId: string) {
  await pool.execute(
    `UPDATE users SET otp_code = NULL, otp_expires = NULL WHERE id = ?`,
    [userId],
  );
}