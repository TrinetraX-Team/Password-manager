use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension, Result as SqliteResult};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// User account record.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub master_key_hash: String, // Argon2id hash of master password (for verification)
    pub totp_secret: String,     // Base32-encoded TOTP secret
    pub created_at: String,
}

/// Initialize the SQLite database with user and vault tables.
pub fn init_db(db_path: &str) -> SqliteResult<Connection> {
    let conn = Connection::open(db_path)?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            master_key_hash TEXT NOT NULL,
            totp_secret TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS vaults (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            encrypted_data TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON vaults(user_id);
    ",
    )?;

    Ok(conn)
}

/// Register a new user with email, master key hash, and TOTP secret.
pub fn register_user(
    conn: &Connection,
    email: String,
    master_key_hash: String,
    totp_secret: String,
) -> Result<User, String> {
    let user_id = Uuid::new_v4().to_string();
    let created_at = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO users (id, email, master_key_hash, totp_secret, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![&user_id, &email, &master_key_hash, &totp_secret, &created_at],
    )
    .map_err(|err| format!("Failed to register user: {}", err))?;

    Ok(User {
        id: user_id,
        email,
        master_key_hash,
        totp_secret,
        created_at,
    })
}

/// Retrieve user by email.
pub fn get_user_by_email(conn: &Connection, email: &str) -> Result<Option<User>, String> {
    let mut stmt = conn
        .prepare("SELECT id, email, master_key_hash, totp_secret, created_at FROM users WHERE email = ?1")
        .map_err(|err| err.to_string())?;

    let user = stmt
        .query_row(params![email], |row| {
            Ok(User {
                id: row.get(0)?,
                email: row.get(1)?,
                master_key_hash: row.get(2)?,
                totp_secret: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .optional()
        .map_err(|err| err.to_string())?;

    Ok(user)
}

/// Retrieve user by ID.
#[allow(dead_code)]
pub fn get_user_by_id(conn: &Connection, user_id: &str) -> Result<Option<User>, String> {
    let mut stmt = conn
        .prepare("SELECT id, email, master_key_hash, totp_secret, created_at FROM users WHERE id = ?1")
        .map_err(|err| err.to_string())?;

    let user = stmt
        .query_row(params![user_id], |row| {
            Ok(User {
                id: row.get(0)?,
                email: row.get(1)?,
                master_key_hash: row.get(2)?,
                totp_secret: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .optional()
        .map_err(|err| err.to_string())?;

    Ok(user)
}

/// Save encrypted vault data for a user.
#[allow(dead_code)]
pub fn save_vault(
    conn: &Connection,
    user_id: String,
    encrypted_data: String,
) -> Result<String, String> {
    let vault_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO vaults (id, user_id, encrypted_data, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![&vault_id, &user_id, &encrypted_data, &now, &now],
    )
    .map_err(|err| format!("Failed to save vault: {}", err))?;

    Ok(vault_id)
}

/// Retrieve vault for a user.
#[allow(dead_code)]
pub fn get_vault(conn: &Connection, user_id: &str) -> Result<Option<String>, String> {
    let mut stmt = conn
        .prepare("SELECT encrypted_data FROM vaults WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 1")
        .map_err(|err| err.to_string())?;

    let vault_data = stmt
        .query_row(params![user_id], |row| row.get(0))
        .optional()
        .map_err(|err| err.to_string())?;

    Ok(vault_data)
}

/// Update vault for a user.
#[allow(dead_code)]
pub fn update_vault(
    conn: &Connection,
    user_id: &str,
    encrypted_data: String,
) -> Result<(), String> {
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE vaults SET encrypted_data = ?1, updated_at = ?2
         WHERE user_id = ?3 AND id = (SELECT id FROM vaults WHERE user_id = ?3 ORDER BY created_at DESC LIMIT 1)",
        params![&encrypted_data, &now, user_id],
    )
    .map_err(|err| format!("Failed to update vault: {}", err))?;

    Ok(())
}
