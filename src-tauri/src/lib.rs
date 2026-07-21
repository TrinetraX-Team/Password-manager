mod crypto;
mod auth;
mod db;

use std::sync::Mutex;
use rusqlite::Connection;

// Global database connection wrapped in mutex for thread safety
lazy_static::lazy_static! {
    static ref DB: Mutex<Option<Connection>> = Mutex::new(None);
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn derive_master_key(master_password: String) -> Result<String, String> {
    crypto::derive_master_key(master_password)
}

#[tauri::command]
fn encrypt_vault_data(vault_plaintext: String, key_b64: String) -> Result<String, String> {
    crypto::encrypt_vault_data(vault_plaintext, key_b64)
}

/// Register a new user with email and master password.
#[allow(non_snake_case)]
#[tauri::command(rename_all = "camelCase")]
fn register_user(email: String, masterPassword: String) -> Result<auth::AuthResponse, String> {
    // Validate email
    if !auth::validate_email(&email) {
        return Err("Invalid email address".into());
    }

    if masterPassword.len() < 12 {
        return Err("Master password must be at least 12 characters".into());
    }

    // Hash the master password
    let password_hash = auth::hash_master_password(&masterPassword)?;

    // Generate TOTP secret
    let totp_secret = auth::generate_totp_secret();

    // Get database connection
    let db_lock = DB.lock().unwrap();
    let conn = db_lock.as_ref().ok_or("Database not initialized")?;

    // Check if user already exists
    if db::get_user_by_email(conn, &email)?.is_some() {
        return Err("User with this email already exists".into());
    }

    // Register user
    let user = db::register_user(conn, email.clone(), password_hash, totp_secret.clone())?;

    Ok(auth::AuthResponse {
        user_id: user.id,
        email: user.email,
        totp_secret,
    })
}

/// Login user with email, master password, and TOTP verification.
#[allow(non_snake_case)]
#[tauri::command(rename_all = "camelCase")]
fn login_user(email: String, masterPassword: String, totpCode: String) -> Result<auth::AuthResponse, String> {
    // Get database connection
    let db_lock = DB.lock().unwrap();
    let conn = db_lock.as_ref().ok_or("Database not initialized")?;

    // Retrieve user
    let user = db::get_user_by_email(conn, &email)?
        .ok_or("User not found")?;

    // Verify master password
    let password_valid = auth::verify_master_password(&masterPassword, &user.master_key_hash)?;
    if !password_valid {
        return Err("Invalid master password".into());
    }

    // Verify TOTP
    if !auth::verify_totp(&user.totp_secret, &totpCode) {
        return Err("Invalid TOTP code".into());
    }

    Ok(auth::AuthResponse {
        user_id: user.id,
        email: user.email,
        totp_secret: user.totp_secret,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            // Initialize database in the workspace root so it is easy to find
            // without putting the DB file inside the watched src-tauri folder.
            let current_dir = std::env::current_dir()
                .map_err(|e| format!("Failed to get current directory: {}", e))?;
            let mut db_path = current_dir
                .parent()
                .map(|p| p.to_path_buf())
                .unwrap_or_else(|| current_dir.clone());
            db_path.push("vault.db");

            if let Some(parent) = db_path.parent() {
                std::fs::create_dir_all(parent)
                    .map_err(|e| format!("Failed to create database directory: {}", e))?;
            }

            match db::init_db(db_path.to_string_lossy().as_ref()) {
                Ok(conn) => {
                    *DB.lock().unwrap() = Some(conn);
                    println!("Database initialized at: {}", db_path.display());
                }
                Err(e) => {
                    eprintln!("Failed to initialize database: {}", e);
                    return Err(e.to_string().into());
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            derive_master_key,
            encrypt_vault_data,
            register_user,
            login_user,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
