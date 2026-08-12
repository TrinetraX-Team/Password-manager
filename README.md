# Secure Password Manager 

<div align="center">

 A modern, zero-knowledge password manager utilizing Argon2id, AES-256-GCM, and TOTP-based authentication. Developed as a final-year cybersecurity project.
## Abstract
Password managers generally focuses on three main pillars: cryptographic security models, vulnerability/penetration analysis against malicious servers, and human-centric usability challenges.With the rapid growth of online services, users are forced to manage dozens of credentials, often leading to dangerous practices like password reuse. These habits significantly increase vulnerability to brute-force attacks, credential stuffing, and account takeovers. 

This project presents the design and implementation of a secure password manager that focuses on strong local security utilizing modern cryptographic techniques. The application follows a strict **zero-knowledge security approach**, ensuring that sensitive data and encryption keys are never stored or transmitted in plaintext form.

## Key Features
* **Advanced Key Derivation:** Utilizes **Argon2id** hashing algorithm to securely derive cryptographic keys from the master password, providing high resistance against GPU-based and side-channel attacks.
* **Military-Grade Encryption:** All stored credentials are encrypted locally using **AES-256-GCM** to ensure confidentiality and data integrity.
* **Zero-Knowledge Architecture:** Frontend passes sensitive data only to Rust backend via secure IPC; no plaintext secrets touch the frontend.
* **Strict Memory Safety:** Rust's ownership model ensures sensitive variables are dropped from memory immediately after use. Zeroize crate wipes sensitive buffers.
* **Offline-First:** All cryptography happens locally; no data transmission to external servers.

## Tech Stack
* **Desktop Framework:** Tauri v2
* **Frontend:** React 19 + TypeScript + Tailwind CSS
* **Backend:** Rust
* **Cryptography:** Argon2id + AES-256-GCM
* **Build Tools:** Vite, npm, Cargo

## Prerequisites
* **Node.js** v18+ ([install](https://nodejs.org/))
* **Rust** ([install](https://www.rust-lang.org/learn/get-started#installing-rust))
* **macOS/Linux/Windows** (Tauri supports all platforms)

## Installation & Setup

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd Password-manager
npm install
cd src-tauri && cargo build && cd ..
```

### 2. Run Development Server
```bash
npm run tauri dev
```

This starts both the React frontend and Rust backend in hot-reload mode.

### 3. Build for Production
```bash
npm run tauri build
```

Creates platform-native binaries in `src-tauri/target/release/`.

## Dependencies

### Frontend (package.json)
\`\`\`json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-opener": "^2"
  },
  "devDependencies": {
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.6.0",
    "typescript": "~5.8.3",
    "vite": "^7.0.4",
    "@tauri-apps/cli": "^2",
    "tailwindcss": "^3.4.4",
    "postcss": "latest",
    "autoprefixer": "latest"
  }
}
\`\`\`

**Key Libraries:**
- **React 19**: Modern declarative UI framework with hooks
- **TypeScript**: Type-safe JavaScript for the frontend
- **Tauri API**: IPC bridge to call Rust commands securely
- **Tailwind CSS**: Utility-first CSS framework for styling

### Backend (src-tauri/Cargo.toml)
\`\`\`toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
argon2 = "0.4"        # Argon2id key derivation
aes-gcm = "0.10"      # AES-256-GCM encryption
rand = "0.8"          # Cryptographically secure RNG
base64 = "0.21"       # Base64 encoding/decoding
zeroize = "1.6"       # Secure memory wiping
\`\`\`

**Key Crates:**
- **tauri**: Desktop app framework and IPC runtime
- **argon2**: GPU-resistant password hashing (Argon2id)
- **aes-gcm**: AEAD encryption primitive (AES-256-GCM)
- **rand**: OS-level random number generation for cryptographic nonces/salts
- **base64**: Encode binary crypto outputs for JSON transport
- **zeroize**: Securely erase sensitive buffers from memory

## Security Architecture

### Threat Model
- **In-Scope:** Master password compromise, local vault theft, memory dumps
- **Out-of-Scope:** Side-channel attacks on CPU, network eavesdropping (no network calls)

### Encryption Flow
1. **Master Password Input** → React frontend (plaintext in memory briefly)
2. **Tauri IPC → Rust Backend** → Argon2id derives 256-bit key from master password
3. **Key + Vault Data** → AES-256-GCM encrypts plaintext vault
4. **Zeroize** → Rust clears master password and temporary buffers from memory
5. **Return Ciphertext** → Frontend displays encrypted output only

### No Plaintext Logging
- `console.log()` is never used with passwords, keys, or hashes
- Rust `println!` macros are restricted in production builds
- All sensitive data is wrapped in `Zeroizing<Vec<u8>>`

## Project Structure
```
Password-manager/
├── src/                          # React TypeScript frontend
│   ├── App.tsx                   # Main component (crypto test UI)
│   ├── App.css                   # Tailwind + custom styles
│   ├── main.tsx                  # Entry point
│   └── vite-env.d.ts            # Vite env types
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── lib.rs               # Tauri app runtime & command handlers
│   │   ├── main.rs              # Platform-specific entry point
│   │   └── crypto.rs            # Secure crypto module (Argon2id, AES-GCM)
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri app config
├── package.json                 # Node/npm metadata
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS + Tailwind pipeline
└── README.md                   # This file
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) 
  - [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## API Reference

### Rust Backend Commands (IPC)

#### `derive_master_key`
Derives a 256-bit key from the master password using Argon2id.

**Input:** 
```rust
master_password: String
```

**Output:** 
```rust
Result<String, String>  // "salt_base64:key_base64"
```

#### `encrypt_vault_data`
Encrypts plaintext vault using AES-256-GCM with the derived key.

**Input:**
```rust
vault_plaintext: String,
key_b64: String  // Base64-encoded key from derive_master_key
```

**Output:**
```rust
Result<String, String>  // Base64(nonce || ciphertext)
```

## Next Steps (Phase 2+)

- [ ] SQLCipher integration for encrypted vault storage
- [ ] Secure unlock screen with biometric (Touch ID on macOS)
- [ ] Credential CRUD operations with encryption
- [ ] Browser extension companion
- [ ] TOTP token generation for 2FA
- [ ] Secure key rotation and backup

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Disclaimer

This is a developmental prototype. Do not use for storing production passwords until a full security audit is completed.
