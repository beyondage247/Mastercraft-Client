import { Input, Modal } from "antd";
import { type FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getCurrentPortalUser } from "../../auth/session";
import { PortalIcon } from "../../components/PortalIcon";
import { changePassword } from "../../services/portalApi";
import { showRequestToast } from "../../utils/portalToast";

const emptyMessage = "";

function ChangePassword() {
  const user = getCurrentPortalUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState(emptyMessage);
  const [successMessage, setSuccessMessage] = useState(emptyMessage);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const backPath = user.role === "admin" || user.role === "staff" ? "/admin/clients" : "/";

  function validateForm() {
    if (!currentPassword.trim()) {
      setFeedback("Current password is required.");
      return false;
    }

    if (newPassword.length < 6) {
      setFeedback("New password must be at least 6 characters.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setFeedback("Passwords do not match.");
      return false;
    }

    if (currentPassword === newPassword) {
      setFeedback("New password must be different from current password.");
      return false;
    }

    return true;
  }

  async function submitChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(emptyMessage);

    if (!validateForm()) {
      return;
    }

    const toast = showRequestToast("change-password", "Changing password...");

    try {
      setLoading(true);
      const response = await changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage(response.message || "Password changed successfully.");
      toast.success(response.message || "Password changed successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to change password.";

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
          <h1>Change Password</h1>
          <p>Update the password for your signed-in portal account.</p>
        </div>

        <form className="login-form" onSubmit={submitChangePassword}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current password</label>
            <Input.Password
              autoComplete="current-password"
              id="currentPassword"
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Current password"
              value={currentPassword}
            />
          </div>
          <div className="form-group">
            <label htmlFor="changeNewPassword">New password</label>
            <Input.Password
              autoComplete="new-password"
              id="changeNewPassword"
              minLength={6}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 6 characters"
              value={newPassword}
            />
          </div>
          <div className="form-group">
            <label htmlFor="changeConfirmPassword">Confirm new password</label>
            <Input.Password
              autoComplete="new-password"
              id="changeConfirmPassword"
              minLength={6}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat new password"
              value={confirmPassword}
            />
          </div>
          <button className="primary-action login-button" disabled={loading} type="submit">
            <PortalIcon name="check" />
            <span>{loading ? "Saving..." : "Change Password"}</span>
          </button>
        </form>

        {feedback ? (
          <p className="login-feedback" aria-live="polite">
            {feedback}
          </p>
        ) : null}

        <Link className="reset-back-link" to={backPath}>
          Back to portal
        </Link>
      </section>

      <Modal maskClosable={false}
        centered
        footer={null}
        onCancel={() => setSuccessMessage(emptyMessage)}
        open={Boolean(successMessage)}
        title="Password Changed"
      >
        <p className="reset-success-message">{successMessage}</p>
      </Modal>
    </main>
  );
}

export default ChangePassword;
