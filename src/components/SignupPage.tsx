import { FormEvent, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface SignupPageProps {
  onSignupSuccess: (userId: string, email: string, totpSecret: string) => void;
  onSwitchToLogin: () => void;
}

export function SignupPage({
  onSignupSuccess,
  onSwitchToLogin,
}: SignupPageProps) {
  const [email, setEmail] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "fair" | "strong" | "">("");

  function calculatePasswordStrength(password: string) {
    if (!password) {
      setPasswordStrength("");
      return;
    }
    if (password.length < 12) {
      setPasswordStrength("weak");
    } else if (password.length < 16 || !/[^a-zA-Z0-9]/.test(password)) {
      setPasswordStrength("fair");
    } else {
      setPasswordStrength("strong");
    }
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setMasterPassword(value);
    calculatePasswordStrength(value);
  }

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (masterPassword.length < 12) {
      setError("Master password must be at least 12 characters");
      return;
    }

    if (masterPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Check if Tauri is available
      if (!(window as any).__TAURI_INTERNALS__) {
        throw new Error(
          "Tauri API not available. Make sure you're running the app with 'tauri dev' or building with 'tauri build'"
        );
      }

      const response = await invoke<{
        user_id: string;
        email: string;
        totp_secret: string;
      }>("register_user", {
        email,
        masterPassword,
      });

      onSignupSuccess(response.user_id, response.email, response.totp_secret);
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : "Failed to create account";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="auth-icon">🔑</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Secure your passwords with zero-knowledge encryption
          </p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <span className="form-label-icon">✉️</span>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="form-label-icon">🔐</span>
              Master Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={masterPassword}
                onChange={handlePasswordChange}
                placeholder="Minimum 12 characters"
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
            {masterPassword && (
              <div className="password-strength">
                <div className="strength-bar-container">
                  <div
                    className={`strength-bar strength-${passwordStrength}`}
                  />
                </div>
                <span className={`strength-text strength-${passwordStrength}`}>
                  {passwordStrength === "weak" && "Weak - Add more characters"}
                  {passwordStrength === "fair" && "Fair - Add special characters"}
                  {passwordStrength === "strong" && "✓ Strong password"}
                </span>
              </div>
            )}
            <p className="form-hint">
              💡 This password derives your encryption key. Use something strong and
              memorable.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <span className="form-label-icon">✔️</span>
              Confirm Master Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                placeholder="Re-enter your password"
                required
                disabled={loading}
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                aria-label="Toggle password visibility"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-block"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="footer-text">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="btn-link"
            >
              Log in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
