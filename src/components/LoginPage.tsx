import { FormEvent, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface LoginPageProps {
  onLoginSuccess: (userId: string, email: string) => void;
  onSwitchToSignup: () => void;
}

export function LoginPage({ onLoginSuccess, onSwitchToSignup }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"password" | "totp">("password");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (step === "totp") {
      const totpInput = document.getElementById("totp");
      if (totpInput) {
        totpInput.focus();
      }
    }
  }, [step]);

  useEffect(() => {
    if (step === "totp" && totpCode.length === 6 && !loading) {
      void handleTotpSubmit();
    }
  }, [totpCode, step, loading]);

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    if (!masterPassword) {
      setError("Please enter your master password");
      return;
    }

    setStep("totp");
    setTotpCode("");
  }

  async function handleTotpSubmit() {
    setError("");

    if (totpCode.length !== 6 || !/^\d{6}$/.test(totpCode)) {
      setError("TOTP code must be 6 digits");
      return;
    }

    setLoading(true);

    try {
      if (!(window as any).__TAURI_INTERNALS__) {
        throw new Error(
          "Tauri API not available. Make sure you're running the app with 'tauri dev' or building with 'tauri build'"
        );
      }

      const response = await invoke<{
        user_id: string;
        email: string;
      }>("login_user", {
        email,
        masterPassword,
        totpCode,
      });

      onLoginSuccess(response.user_id, response.email);
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : "Login failed";

      setError(message);
      setTotpCode("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <span className="auth-step">Secure sign in</span>
          <div className="auth-icon">🔐</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Access your secure password vault
          </p>
        </div>

        {step === "password" ? (
          <form onSubmit={handlePasswordSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <span className="form-label-icon">✉️</span>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span className="form-label-icon">🔑</span>
                Master Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={masterPassword}
                  autoComplete="current-password"
                  onChange={(e) => setMasterPassword(e.currentTarget.value)}
                  placeholder="Enter your master password"
                  required
                  disabled={loading}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-block"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleTotpSubmit();
            }}
            className="auth-form"
          >
            <div className="form-group">
              <label htmlFor="totp">
                <span className="form-label-icon">📱</span>
                TOTP Code
              </label>
              <p className="form-hint">
                Enter the 6-digit code from your authenticator app
              </p>
              <input
                id="totp"
                type="text"
                inputMode="numeric"
                value={totpCode}
                onChange={(e) => {
                  const val = e.currentTarget.value.replace(/\D/g, "");
                  setTotpCode(val.slice(0, 6));
                }}
                placeholder="000000"
                maxLength={6}
                required
                disabled={loading}
                className="form-input totp-input"
                autoComplete="one-time-code"
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="btn-primary btn-block"
            >
              {loading ? "Verifying..." : "Log In"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("password");
                setError("");
                setTotpCode("");
              }}
              className="btn-secondary btn-block"
              disabled={loading}
            >
              Back
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p className="footer-text">
            Don't have an account? {" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="btn-link"
            >
              Sign up now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
