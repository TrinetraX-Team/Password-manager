use chrono::Utc;
use email_address::EmailAddress;
use rand::Rng;
use serde::{Deserialize, Serialize};
use totp_lite::{totp_custom, Sha1};

/// TOTP configuration.
const TOTP_TIME_STEP: u64 = 30; // 30-second time step
const TOTP_DIGITS: usize = 6;   // 6-digit codes

/// Registration request.
#[allow(dead_code)]
#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub master_password: String,
}

/// Login request.
#[allow(dead_code)]
#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub master_password: String,
    pub totp_code: String,
}

/// Auth response with session token.
#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user_id: String,
    pub email: String,
    pub totp_secret: String,
}

/// Generate a Base32-encoded TOTP secret.
pub fn generate_totp_secret() -> String {
    let mut rng = rand::thread_rng();
    let secret: Vec<u8> = (0..20).map(|_| rng.gen()).collect();
    base32_encode(&secret)
}

/// Encode bytes to Base32.
fn base32_encode(input: &[u8]) -> String {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let mut result = String::new();

    let mut buffer = 0u32;
    let mut bits = 0;

    for &byte in input {
        buffer = (buffer << 8) | (byte as u32);
        bits += 8;

        while bits >= 5 {
            bits -= 5;
            let index = ((buffer >> bits) & 0x1F) as usize;
            result.push(ALPHABET[index] as char);
        }
    }

    if bits > 0 {
        let index = ((buffer << (5 - bits)) & 0x1F) as usize;
        result.push(ALPHABET[index] as char);
    }

    result
}

/// Verify a TOTP code against the secret.
pub fn verify_totp(secret: &str, code: &str) -> bool {
    if code.len() != TOTP_DIGITS {
        return false;
    }

    let secret_bytes = base32_decode(secret);
    if secret_bytes.is_empty() {
        return false;
    }

    let now = Utc::now().timestamp() as u64;
    let time_counter = now / TOTP_TIME_STEP;

    // Check current time step and neighbors (±1) for time skew tolerance
    for counter_offset in [0i64, -1, 1].iter() {
        let counter = ((time_counter as i64) + counter_offset) as u64;
        let computed_code = totp_custom::<Sha1>(
            TOTP_TIME_STEP,
            TOTP_DIGITS as u32,
            &secret_bytes,
            counter,
        );

        if computed_code == code {
            return true;
        }
    }

    false
}

/// Decode Base32 to bytes.
fn base32_decode(input: &str) -> Vec<u8> {
    const ALPHABET: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let mut result = Vec::new();
    let mut buffer = 0u32;
    let mut bits = 0;

    for ch in input.chars() {
        if let Some(value) = ALPHABET.find(ch) {
            buffer = (buffer << 5) | (value as u32);
            bits += 5;

            if bits >= 8 {
                bits -= 8;
                result.push(((buffer >> bits) & 0xFF) as u8);
            }
        }
    }

    result
}

/// Validate email format.
pub fn validate_email(email: &str) -> bool {
    EmailAddress::parse_with_options(
        email,
        email_address::Options {
            allow_domain_literal: false,
            allow_display_text: false,
            minimum_sub_domains: 2,
        },
    )
    .is_ok()
}

/// Derive master key hash using Argon2id (for verification, not encryption).
pub fn hash_master_password(password: &str) -> Result<String, String> {
    use argon2::{Algorithm, Argon2, Params, Version};
    use base64::{engine::general_purpose, Engine as _};
    use rand::SeedableRng;

    // Generate a unique salt
    let mut rng = rand::rngs::StdRng::from_entropy();
    let salt: Vec<u8> = (0..16).map(|_| rng.gen()).collect();

    let argon2 = Argon2::new(
        Algorithm::Argon2id,
        Version::V0x13,
        Params::new(65536, 3, 1, None).map_err(|err| err.to_string())?,
    );

    let mut output = [0u8; 32];
    argon2
        .hash_password_into(password.as_bytes(), &salt, &mut output)
        .map_err(|err| err.to_string())?;

    // Format: salt_base64:hash_base64
    let salt_b64 = general_purpose::STANDARD.encode(&salt);
    let hash_b64 = general_purpose::STANDARD.encode(&output);

    Ok(format!("{}:{}", salt_b64, hash_b64))
}

/// Verify a master password against a hash.
pub fn verify_master_password(password: &str, hash: &str) -> Result<bool, String> {
    use argon2::{Algorithm, Argon2, Params, Version};
    use base64::{engine::general_purpose, Engine as _};

    let parts: Vec<&str> = hash.split(':').collect();
    if parts.len() != 2 {
        return Err("Invalid hash format".into());
    }

    let salt = general_purpose::STANDARD
        .decode(parts[0])
        .map_err(|_| "Invalid hash format".to_string())?;
    let expected_hash = general_purpose::STANDARD
        .decode(parts[1])
        .map_err(|_| "Invalid hash format".to_string())?;

    let argon2 = Argon2::new(
        Algorithm::Argon2id,
        Version::V0x13,
        Params::new(65536, 3, 1, None).map_err(|err| err.to_string())?,
    );

    let mut output = vec![0u8; expected_hash.len()];
    argon2
        .hash_password_into(password.as_bytes(), &salt, &mut output)
        .map_err(|err| err.to_string())?;

    Ok(output == expected_hash)
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use totp_lite::{totp_custom, Sha1};

    #[test]
    fn validate_email_accepts_common_addresses() {
        assert!(validate_email("user@gmail.com"));
        assert!(validate_email("user@example.com"));
    }

    #[test]
    fn verify_totp_accepts_generated_secret() {
        let secret = generate_totp_secret();
        let now = Utc::now().timestamp() as u64;
        let counter = now / 30;
        let secret_bytes = base32_decode(&secret);
        let code = totp_custom::<Sha1>(30, 6, &secret_bytes, counter);

        assert!(verify_totp(&secret, &code), "expected generated secret to verify its own TOTP code");
    }

    #[test]
    fn verify_totp_accepts_standard_rfc_secret() {
        let secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
        let now = Utc::now().timestamp() as u64;
        let counter = now / 30;
        let secret_bytes = base32_decode(secret);
        let code = totp_custom::<Sha1>(30, 6, &secret_bytes, counter);

        assert!(verify_totp(secret, &code), "expected TOTP verification to succeed for standard RFC secret");
    }

    #[test]
    fn verify_totp_accepts_codes_from_nearby_time_windows() {
        let secret = generate_totp_secret();
        let now = Utc::now().timestamp() as u64;
        let secret_bytes = base32_decode(&secret);
        let code = totp_custom::<Sha1>(30, 6, &secret_bytes, now + (2 * 30));

        assert!(verify_totp(&secret, &code), "expected TOTP verification to tolerate a small time skew");
    }
}
