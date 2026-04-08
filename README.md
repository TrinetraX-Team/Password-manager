# Secure Password Manager 

<div align="center">

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0--dev-orange?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Zero--Knowledge-success?style=for-the-badge)
![Rust](https://img.shields.io/badge/Core-Rust-black?style=for-the-badge&logo=rust)
![Tauri](https://img.shields.io/badge/Framework-Tauri-FFC131?style=for-the-badge&logo=tauri)

> **An enterprise-grade, zero-knowledge credential vault.** > Developed as a final-year cybersecurity project by **TrinetraX-Team**.

</div>

---

## Abstract
With the rapid growth of online services, users are forced to manage dozens of credentials, often leading to dangerous practices like password reuse. These habits significantly increase vulnerability to brute-force attacks, credential stuffing, and account takeovers. 

This project presents a hardened, cross-platform password manager focused on uncompromising local security. Built on a strict zero-knowledge architecture, it ensures that sensitive data and encryption keys are never stored in plaintext or transmitted to external servers. By leveraging memory-safe systems programming (Rust) and hardware-level enclaves, this vault protects against both remote network threats and local memory-scraping malware.

## Key Features

* **Zero-Knowledge Architecture:** The master password never leaves the host device.
* **Advanced Key Derivation:** Utilizes Argon2id (the Password Hashing Competition winner) to derive cryptographic keys, thwarting GPU and ASIC-based cracking attempts.
* **Military-Grade Encryption:** Local vault data is encrypted using AES-256-GCM, guaranteeing both confidentiality and tamper-evident data integrity.
* **Multi-Factor Authentication (TOTP):** Built-in Time-Based One-Time Password generator to neutralize threats even if a credential is compromised.
* **Hardware-Backed Biometrics:** Seamless and secure vault unlocking using OS-level Trusted Execution Environments (Secure Enclave / TPM / Touch ID).
* **Ultra-Lightweight & Fast:** Powered by Tauri and Rust, utilizing a fraction of the memory overhead compared to traditional Electron-based managers.

## Tech Stack

The architecture utilizes modern, secure, and memory-safe frameworks:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Desktop Framework** | **Tauri** | Provides a lightweight, secure application window without bundling a vulnerable Chromium browser. |
| **Backend Core** | **Rust** | Ensures strict memory safety and executes heavy cryptographic algorithms at bare-metal speeds. |
| **Frontend UI** | **React.js + Tailwind CSS** | Delivers a responsive, dark-mode optimized, professional user interface. |
| **Database** | **SQLite + SQLCipher** | Stores the encrypted vault locally, rendering it unreadable even if the host machine is physically compromised. |
| **Cryptography** | **Argon2 & AES-GCM (Crates)** | Handles all key derivation and symmetric encryption within the secure Rust core. |

## Security Architecture Flow

1. **Initialization:** The user inputs their Master Password into the React interface.
2. **Key Derivation:** The password is transmitted via a secure bridge to the Rust backend, where `Argon2id` hashes it alongside a high-entropy cryptographic salt.
3. **Decryption:** The resulting 256-bit key is used to unlock the local `SQLCipher` database via `AES-256-GCM`.
4. **Key Wrapping (Hardware):** Upon successful authentication, the AES key is handed off to the OS Secure Enclave (e.g., Windows Hello / Touch ID).
5. **Memory Wiping:** Rust's strict ownership model immediately drops the plaintext master password from RAM, preventing memory-scraping attacks.
6. **Subsequent Logins:** The user authenticates via biometric scan; the OS releases the AES key back to the Rust core, unlocking the vault instantly.

---

## Getting Started (For Developers)

Because this project utilizes Rust for its secure core, specific build tools are required beyond standard Node.js environments.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Rust & Cargo](https://rustup.rs/)
* OS-Specific Build Tools (See [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))
* Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/TrinetraX-Team/Password-manager.git](https://github.com/TrinetraX-Team/Password-manager.git)
   cd Password-manager
