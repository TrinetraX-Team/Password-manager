#![allow(dead_code)]

use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use argon2::{Algorithm, Argon2, Params, Version};
use base64::{engine::general_purpose, Engine as _};
use rand::rngs::OsRng as RandOsRng;
use rand::RngCore;
use zeroize::Zeroizing;

const KEY_LEN: usize = 32;
const SALT_LEN: usize = 16;
const NONCE_LEN: usize = 12;

/// Derives a 256-bit key from a plaintext master password using Argon2id.
///
/// The returned string is formatted as `<salt_base64>:<key_base64>`, where the
/// salt is randomly generated and the key is derived using Argon2id.
pub fn derive_master_key(master_password: String) -> Result<String, String> {
    let salt = generate_salt()?;
    let argon2 = Argon2::new(
        Algorithm::Argon2id,
        Version::V0x13,
        Params::new(65536, 3, 1, None).map_err(|err| err.to_string())?,
    );

    let mut key = Zeroizing::new([0u8; KEY_LEN]);
    let password_bytes = Zeroizing::new(master_password.into_bytes());

    argon2
        .hash_password_into(password_bytes.as_ref(), &salt, key.as_mut())
        .map_err(|err| err.to_string())?;

    let salt_b64 = general_purpose::STANDARD.encode(&salt);
    let key_b64 = general_purpose::STANDARD.encode(key.as_ref());

    Ok(format!("{}:{}", salt_b64, key_b64))
}

/// Encrypts plaintext vault data using AES-256-GCM with the provided base64 key.
///
/// The returned value is base64-encoded and contains the nonce followed by ciphertext.
pub fn encrypt_vault_data(vault_plaintext: String, key_b64: String) -> Result<String, String> {
    let key_bytes = general_purpose::STANDARD
        .decode(key_b64)
        .map_err(|err| err.to_string())?;

    if key_bytes.len() != KEY_LEN {
        return Err("Invalid key length; expected 32 bytes".into());
    }

    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);

    let mut nonce_bytes = [0u8; NONCE_LEN];
    RandOsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let plaintext = Zeroizing::new(vault_plaintext.into_bytes());
    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_ref())
        .map_err(|err| err.to_string())?;

    let mut output = Vec::with_capacity(NONCE_LEN + ciphertext.len());
    output.extend_from_slice(&nonce_bytes);
    output.extend_from_slice(&ciphertext);

    Ok(general_purpose::STANDARD.encode(output))
}

fn generate_salt() -> Result<[u8; SALT_LEN], String> {
    let mut salt = [0u8; SALT_LEN];
    RandOsRng.fill_bytes(&mut salt);
    Ok(salt)
}
