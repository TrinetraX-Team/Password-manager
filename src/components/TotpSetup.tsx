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
      <div className="auth-box">
        <h1 className="auth-title">Enable Two-Factor Authentication</h1>
        <p className="auth-subtitle">Account: {email}</p>

        <div className="totp-setup">
          <div className="totp-section">
            <h2>Scan QR Code</h2>
            <p className="form-hint">
              Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code:
            </p>
            <div className="qr-code-container">
              <QRCodeSVG
                value={qrCodeUrl}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
          </div>

          <div className="totp-section">
            <h2>Manual Setup</h2>
            <p className="form-hint">
              If you can't scan the QR code, enter this information manually in your authenticator app:
            </p>
            <div className="manual-setup">
              <div className="manual-field">
                <strong>Account:</strong> {email}
              </div>
              <div className="manual-field">
                <strong>Secret:</strong> <code className="secret-code">{totpSecret}</code>
              </div>
              <div className="manual-field">
                <strong>Type:</strong> Time-based (TOTP)
              </div>
              <div className="manual-field">
                <strong>Digits:</strong> 6
              </div>
              <div className="manual-field">
                <strong>Time Step:</strong> 30 seconds
              </div>
            </div>
          </div>

          <div className="totp-section">
            <h2>Save Your Secret</h2>
            <p className="form-hint">
              Save this secret code in a secure location. You'll need it if you ever need to recover access to your account.
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
              I have set up my authenticator app and saved the secret code securely
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
