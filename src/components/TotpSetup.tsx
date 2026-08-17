import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface TotpSetupProps {
  email: string;
  totpSecret: string;
  onConfirmSetup: () => void;
}

export function TotpSetup({
  email,
  totpSecret,
  onConfirmSetup,
}: TotpSetupProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    // Generate TOTP URI for QR code
    // Format: otpauth://totp/Issuer:Account?secret=SECRET&issuer=Issuer
    const issuer = "Password Manager";
    const account = encodeURIComponent(email);
    const secret = encodeURIComponent(totpSecret);
    const uri = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&digits=6&period=30`;

    setQrCodeUrl(uri);
  }, [email, totpSecret]);

  return (
    <div className="auth-container">
      <div className="auth-box auth-box-wide">
        <div className="auth-header">
          <span className="auth-badge">Security setup</span>
          <h1 className="auth-title">Enable Two-Factor Authentication</h1>
          <p className="auth-subtitle">
            Protect your account by linking a trusted authenticator app to your login.
          </p>
        </div>

        <div className="totp-setup">
          <div className="totp-layout">
            <div className="totp-panel">
              <div className="totp-panel-header">
                <span className="totp-step-indicator">Step 1</span>
                <h2>Scan QR code</h2>
              </div>

              <p className="form-hint">
                Open your authenticator app and scan this QR code to begin setup.
              </p>

              <div className="qr-code-container">
                <QRCodeSVG
                  value={qrCodeUrl}
                  size={210}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>

            <div className="totp-panel">
              <div className="totp-panel-header">
                <span className="totp-step-indicator">Step 2</span>
                <h2>Manual setup</h2>
              </div>

              <p className="form-hint">
                If scanning is unavailable, enter this information manually in your authenticator app.
              </p>

              <div className="manual-setup">
                <div className="manual-field">
                  <span>Account</span>
                  <strong>{email}</strong>
                </div>
                <div className="manual-field">
                  <span>Secret</span>
                  <code className="secret-code">{totpSecret}</code>
                </div>
                <div className="manual-field">
                  <span>Type</span>
                  <strong>Time-based (TOTP)</strong>
                </div>
                <div className="manual-field">
                  <span>Digits</span>
                  <strong>6</strong>
                </div>
                <div className="manual-field">
                  <span>Time step</span>
                  <strong>30 seconds</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="totp-panel totp-panel-full">
            <div className="totp-panel-header">
              <span className="totp-step-indicator">Backup</span>
              <h2>Save your secret</h2>
            </div>

            <p className="form-hint">
              Keep this recovery secret in a secure location. You may need it if you ever lose access to your authenticator app.
            </p>

            <div className="secret-box">
              <code className="secret-code">{totpSecret}</code>
            </div>
          </div>

          <div className="totp-checkbox">
            <label>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.currentTarget.checked)}
              />
              <span>
                I have set up my authenticator app and saved the secret code securely.
              </span>
            </label>
          </div>

          <button
            onClick={onConfirmSetup}
            disabled={!confirmed}
            className="btn-primary btn-block"
          >
            Continue to Vault
          </button>
        </div>
      </div>
    </div>
  );
}
