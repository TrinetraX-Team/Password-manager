<!--
  Professional README for Password-manager
  - Concise overview
  - Quickstart + commands
  - Project layout and security notes
-->

# Password Manager

<p align="center">
  <img src="src-tauri/icons/icon.png" alt="app icon" width="96" height="96" />
</p>

> A modern, zero-knowledge password manager prototype built with Tauri (React + Rust). It demonstrates local-first encryption using Argon2id for key derivation, AES-256-GCM for authenticated encryption, and TOTP for two-factor authentication.

<!-- tech badges -->
<p align="center">
  <img src="https://img.shields.io/badge/Tauri-2.0-0D1117?logo=tauri&logoColor=white" alt="Tauri" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Rust-1.0-000000?logo=rust&logoColor=white" alt="Rust" />
  <img src="https://img.shields.io/badge/Tailwind-3.0-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
</p>

## Table of contents
- [About](#about)
- [Features](#features)
- [Quickstart](#quickstart)
- [Development](#development)
- [Architecture & Security](#architecture--security)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)


## About

This repository contains a desktop password manager intended as a secure, local-first vault. Sensitive operations (key derivation, encryption, TOTP verification) run in the Rust backend; the React frontend handles UI and IPC.

The project is a prototype and is not intended for production use without a formal security review.


## Features

- Argon2id key derivation for strong master-password hashing
- AES-256-GCM authenticated encryption for vault entries
- Time-based one-time passwords (TOTP) for 2FA
- Zero-knowledge architecture: secrets are derived and stored securely in the backend
- Local-first: no cloud sync by default
- Secure architecture used for this to prevent data league and system irregularities


## Quickstart

Prerequisites:

- Node.js v18+ and npm
- Rust toolchain (rustup + cargo)

Clone and install:

```bash
git clone <repo-url>
cd Password-manager
npm install
cd src-tauri && cargo build && cd ..
```

Run in development (starts Vite + Tauri dev):

```bash
npm run tauri dev
```

Build production binaries:

```bash
npm run tauri build
```


## Development

- Frontend: `src/` (React + TypeScript + Tailwind)
- Backend: `src-tauri/` (Rust + Tauri)

Useful commands:

```bash
# frontend dev server only
npm run dev

# backend tests
cd src-tauri && cargo test

# full production build
npm run tauri build
```


## Architecture & Security

- All cryptographic operations occur in the Rust backend; the frontend never stores plaintext secrets.
- Master password -> Argon2id -> 256-bit key
- Vault records encrypted with AES-256-GCM (nonce + ciphertext stored)
- TOTP secrets are Base32-encoded and validated using a time-window tolerance to account for clock skew.

Notes and caveats:

- This is a research / prototype codebase. Do not store production secrets until audited.
- The app writes a local SQLite database (`vault.db`) in the workspace root during development. In a production build you should pick a secure, platform-appropriate storage location and restrict file permissions.


## Project structure

```
Password-manager/
├─ src/                 # React frontend
├─ src-tauri/           # Rust backend and Tauri config
├─ package.json
├─ tailwind.config.js
└─ README.md
```


## Contributing

Contributions are welcome. Suggested workflow:

1. Fork this repository
2. Create a feature branch
3. Open a PR with tests and clear description

Please open issues for feature requests or security questions.


## License

MIT — see the `LICENSE` file for details.

---

If you'd like, I can also:

- add badges (build / license / tests)
- expand the developer docs with an API section and example IPC calls
- include a short security FAQ and recommended hardening steps

Tell me which of these you'd like next.
