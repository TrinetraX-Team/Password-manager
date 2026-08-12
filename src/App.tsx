import { useState } from "react";
import "./App.css";
import { SignupPage } from "./components/SignupPage";
import { LoginPage } from "./components/LoginPage";
import { TotpSetup } from "./components/TotpSetup";

type AuthStep = "signup" | "login" | "totp-setup" | "vault";

interface AuthState {
  userId: string | null;
  email: string | null;
  totpSecret: string | null;
}

interface VaultEntry {
  id: string;
  title: string;
  url: string;
  username: string;
  password: string;
  createdAt: string;
}

function App() {
  const [authStep, setAuthStep] = useState<AuthStep>("login");
  const [authState, setAuthState] = useState<AuthState>({
    userId: null,
    email: null,
    totpSecret: null,
  });
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryUrl, setEntryUrl] = useState("");
  const [entryUsername, setEntryUsername] = useState("");
  const [entryPassword, setEntryPassword] = useState("");

  function handleSignupSuccess(
    userId: string,
    email: string,
    totpSecret: string
  ) {
    setAuthState({ userId, email, totpSecret });
    setAuthStep("totp-setup");
  }

  function handleLoginSuccess(userId: string, email: string) {
    setAuthState({ userId, email, totpSecret: null });
    setAuthStep("vault");
  }

  function handleTotpConfirm() {
    setAuthStep("vault");
  }

  function handleLogout() {
    setAuthState({ userId: null, email: null, totpSecret: null });
    setEntries([]);
    setEntryTitle("");
    setEntryUrl("");
    setEntryUsername("");
    setEntryPassword("");
    setAuthStep("login");
  }

  function handleAddEntry() {
    if (!entryTitle.trim() || !entryPassword.trim()) {
      return;
    }

    const newEntry: VaultEntry = {
      id: crypto.randomUUID(),
      title: entryTitle.trim(),
      url: entryUrl.trim(),
      username: entryUsername.trim(),
      password: entryPassword.trim(),
      createdAt: new Date().toLocaleString(),
    };

    setEntries((current) => [newEntry, ...current]);
    setEntryTitle("");
    setEntryUrl("");
    setEntryUsername("");
    setEntryPassword("");
  }

  return (
    <main className="app">
      {authStep === "signup" && (
        <SignupPage
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setAuthStep("login")}
        />
      )}

      {authStep === "login" && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setAuthStep("signup")}
        />
      )}

      {authStep === "totp-setup" && authState.totpSecret && (
        <TotpSetup
          email={authState.email || ""}
          totpSecret={authState.totpSecret}
          onConfirmSetup={handleTotpConfirm}
        />
      )}

      {authStep === "vault" && authState.userId && (
        <div className="vault-container">
          <header className="vault-header">
            <div>
              <p className="vault-label">Secure Password Vault</p>
              <h1>My Vault</h1>
            </div>
            <div className="vault-header-info">
              <div>
                <span className="vault-user-label">Signed in as</span>
                <div className="user-email">{authState.email}</div>
              </div>
              <button onClick={handleLogout} className="btn-logout">
                Log Out
              </button>
            </div>
          </header>

          <div className="vault-content">
            <section className="vault-overview">
              <div className="overview-card">
                <p>Total Entries</p>
                <h2>{entries.length}</h2>
              </div>
              <div className="overview-card">
                <p>Last Added</p>
                <h2>{entries[0]?.title || "None yet"}</h2>
              </div>
            </section>

            <section className="vault-panel">
              <div className="vault-panel-header">
                <div>
                  <h2>Add a New Password</h2>
                  <p className="form-hint">
                    Save login details for websites, apps, or services.
                  </p>
                </div>
              </div>

              <div className="vault-form-grid">
                <div className="form-group">
                  <label htmlFor="entryTitle">Entry Title</label>
                  <input
                    id="entryTitle"
                    type="text"
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.currentTarget.value)}
                    placeholder="e.g. Gmail, Bank, Work VPN"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="entryUrl">Website or Service</label>
                  <input
                    id="entryUrl"
                    type="url"
                    value={entryUrl}
                    onChange={(e) => setEntryUrl(e.currentTarget.value)}
                    placeholder="https://example.com"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="entryUsername">Username / Email</label>
                  <input
                    id="entryUsername"
                    type="text"
                    value={entryUsername}
                    onChange={(e) => setEntryUsername(e.currentTarget.value)}
                    placeholder="user@example.com"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="entryPassword">Password</label>
                  <input
                    id="entryPassword"
                    type="password"
                    value={entryPassword}
                    onChange={(e) => setEntryPassword(e.currentTarget.value)}
                    placeholder="Enter a secure password"
                    className="form-input"
                  />
                </div>
              </div>

              <button onClick={handleAddEntry} className="btn-primary btn-block">
                Save Entry
              </button>
            </section>

            <section className="vault-grid">
              {entries.length === 0 ? (
                <div className="empty-state-card">
                  <h2>No saved entries yet</h2>
                  <p>Add a password entry above to securely store it here.</p>
                </div>
              ) : (
                entries.map((entry) => (
                  <div key={entry.id} className="vault-card">
                    <div className="vault-card-header">
                      <div>
                        <p className="card-title">{entry.title}</p>
                        <div className="card-subtitle">{entry.url || "No URL provided"}</div>
                      </div>
                      <span className="card-badge">Saved</span>
                    </div>
                    <div className="vault-card-body">
                      <div>
                        <span className="card-field-label">Username</span>
                        <p>{entry.username || "-"}</p>
                      </div>
                      <div>
                        <span className="card-field-label">Password</span>
                        <p className="password-hidden">• • • • • • • •</p>
                      </div>
                    </div>
                    <div className="vault-card-footer">
                      <span>Added {entry.createdAt}</span>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
