import { Input, Modal } from "antd";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentPortalUser } from "../../auth/session";
import { PortalIcon } from "../../components/PortalIcon";
import {
  confirmPasswordReset,
  requestPasswordResetOtp,
} from "../../services/portalApi";
import { showRequestToast } from "../../utils/portalToast";

type OtpStep = "email" | "otp" | "password";

const emptyMessage = "";

function ResetPassword() {
  const user = getCurrentPortalUser();
  const [otpStep, setOtpStep] = useState<OtpStep>("email");
  const [email, setEmail] = useState(user?.email ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState(emptyMessage);
  const [successMessage, setSuccessMessage] = useState(emptyMessage);
  const [loading, setLoading] = useState(false);

  function validateNewPassword() {
    if (newPassword.length < 6) {
      setFeedback("Password must be at least 6 characters.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setFeedback("Passwords do not match.");
      return false;
    }

    return true;
  }

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(emptyMessage);

    if (!email.trim()) {
      setFeedback("Email is required.");
      return;
    }

    const toast = showRequestToast("request-password-otp", "Sending OTP...");

    try {
      setLoading(true);
      await requestPasswordResetOtp(email.trim());
      setOtpStep("otp");
      toast.success("OTP sent successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to request OTP.";

      setFeedback(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(emptyMessage);

    if (!email.trim() || !otp.trim()) {
      setFeedback("Email and OTP are required.");
      return;
    }

    setOtpStep("password");
  }

  async function submitOtpPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(emptyMessage);

    if (!email.trim() || !otp.trim() || !validateNewPassword()) {
      return;
    }

    const toast = showRequestToast("confirm-password-reset", "Saving new password...");

    try {
      setLoading(true);
      const response = await confirmPasswordReset(
        email.trim(),
        otp.trim(),
        newPassword,
      );
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpStep("email");
      setSuccessMessage(response.message || "Password reset successful.");
      toast.success(response.message || "Password reset successful.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reset password.";

      setFeedback(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel reset-panel">
        <div className="login-brand">
          <span className="brand-logo__name">MASTERCRAFT</span>
          <span className="brand-logo__mark" aria-hidden="true">
            M
          </span>
          <span className="brand-logo__product">PRODUCTS</span>
        </div>
        <div>
          <h1>Reset Password</h1>
          <p>Update access for your portal account.</p>
        </div>

        {otpStep === "email" ? (
          <form className="login-form" onSubmit={requestOtp}>
            <div className="form-group">
              <label htmlFor="otpResetEmail">Email</label>
              <input
                autoComplete="email"
                id="otpResetEmail"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                type="email"
                value={email}
              />
            </div>
            <button
              className="primary-action login-button"
              disabled={loading}
              type="submit"
            >
              <PortalIcon name="right" />
              <span>{loading ? "Sending..." : "Send OTP"}</span>
            </button>
          </form>
        ) : null}

        {otpStep === "otp" ? (
          <form className="login-form" onSubmit={verifyOtp}>
            <div className="form-group">
              <label htmlFor="otpCode">OTP</label>
              <input
                autoComplete="one-time-code"
                id="otpCode"
                inputMode="numeric"
                onChange={(event) => setOtp(event.target.value)}
                placeholder="6-digit code"
                type="text"
                value={otp}
              />
            </div>
            <button
              className="primary-action login-button"
              disabled={loading}
              type="submit"
            >
              <PortalIcon name="check" />
              <span>Continue</span>
            </button>
          </form>
        ) : null}

        {otpStep === "password" ? (
          <form className="login-form" onSubmit={submitOtpPasswordReset}>
            <PasswordFields
              confirmPassword={confirmPassword}
              newPassword={newPassword}
              setConfirmPassword={setConfirmPassword}
              setNewPassword={setNewPassword}
            />
            <button
              className="primary-action login-button"
              disabled={loading}
              type="submit"
            >
              <PortalIcon name="check" />
              <span>{loading ? "Saving..." : "Save Password"}</span>
            </button>
          </form>
        ) : null}

        {feedback ? (
          <p className="login-feedback" aria-live="polite">
            {feedback}
          </p>
        ) : null}

        <Link
          className="reset-back-link"
          to={
            user ? (user.role === "admin" ? "/admin/clients" : "/") : "/login"
          }
        >
          Back to portal
        </Link>
      </section>

      <Modal
        centered
        footer={null}
        onCancel={() => setSuccessMessage(emptyMessage)}
        open={Boolean(successMessage)}
        title="Password Updated"
      >
        <p className="reset-success-message">{successMessage}</p>
      </Modal>
    </main>
  );
}

type PasswordFieldsProps = {
  confirmPassword: string;
  newPassword: string;
  setConfirmPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
};

function PasswordFields({
  confirmPassword,
  newPassword,
  setConfirmPassword,
  setNewPassword,
}: PasswordFieldsProps) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="newPassword">New password</label>
        <Input.Password
          autoComplete="new-password"
          id="newPassword"
          minLength={6}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="At least 6 characters"
          value={newPassword}
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm password</label>
        <Input.Password
          autoComplete="new-password"
          id="confirmPassword"
          minLength={6}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat new password"
          value={confirmPassword}
        />
      </div>
    </>
  );
}

export default ResetPassword;
