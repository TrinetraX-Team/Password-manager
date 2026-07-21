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
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          Secure your passwords with zero-knowledge encryption
        </p>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
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
            <label htmlFor="password">Master Password</label>
            <input
              id="password"
              type="password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.currentTarget.value)}
              placeholder="Minimum 12 characters"
              required
              disabled={loading}
              className="form-input"
            />
            <p className="form-hint">
              This password derives your encryption key. Use something strong and
              memorable.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Master Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              placeholder="Re-enter your password"
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-block"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="btn-link"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
