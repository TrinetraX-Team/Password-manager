# Secure Password Manager 

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0--dev-orange)
![Security](https://img.shields.io/badge/Security-Zero--Knowledge-success)

> A modern, zero-knowledge password manager utilizing Argon2id, AES-256-GCM, and TOTP-based authentication. Developed as a final-year cybersecurity project by TrinetraX-Team.

## Abstract
With the rapid growth of online services, users are required to manage multiple credentials, which often leads to poor password practices such as reuse of weak passwords. These practices significantly increase the risk of cyber threats including brute-force attacks, credential theft, and unauthorized access. 

This project presents the design and implementation of a secure password manager that focuses on strong local security and user authentication using modern cryptographic techniques. The application follows a strict **zero-knowledge security approach**, ensuring that sensitive data and encryption keys are never stored or transmitted in plaintext form.

## Key Features
* **Advanced Key Derivation:** Utilizes the **Argon2id** hashing algorithm to securely derive cryptographic keys from the master password, providing high resistance against GPU-based and side-channel attacks.
* **Military-Grade Encryption:** All stored credentials are encrypted locally using **AES-256-GCM** to ensure confidentiality and data integrity.
* **Multi-Factor Authentication:** Incorporates Time-Based One-Time Password (**TOTP**) as a second factor, neutralizing threats even if the master password is compromised.
* **Biometric Integration:** Seamless vault unlocking using macOS Touch ID / Secure Enclave.
* **Browser Autofill:** Companion browser extension for secure and dynamic credential injection.
* **Modern UI:** Sleek, professional, and dark-mode optimized interface.

##  Proposed Tech Stack
* **Frontend:** React.js / Tailwind CSS (for a dynamic, professional UI)
* **Desktop Framework:** Electron.js (or Tauri)
* **Cryptography:** Native crypto modules (Argon2, AES-GCM)
* **Biometrics:** Node system preferences (Touch ID API)

## Security Architecture
1. User inputs the Master Password.
2. `Argon2id` hashes the password with a unique, randomly generated salt.
3. The derived key is used to encrypt/decrypt the local SQLite/JSON vault via `AES-256-GCM`.
4. A session token is stored securely in the OS Keychain, accessible only via Biometric (Touch ID) verification for quick subsequent logins.

## Getting Started (For Developers)

### Prerequisites
* Node.js (v18+)
* Git

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/TrinetraX-Team/Password-manager.git](https://github.com/TrinetraX-Team/Password-manager.git)
