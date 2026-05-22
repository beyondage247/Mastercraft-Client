import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { savePortalSession } from "../../auth/session";
import { PortalIcon } from "../../components/PortalIcon";
import { loginPortalUser } from "../../services/portalApi";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setLoading(true);

    try {
      const payload = await loginPortalUser(email.trim(), password);

      if (!payload) {
        setFeedback("Unable to start your session.");
        return;
      }

      savePortalSession(payload.token, payload.user);
      navigate(payload.user.role === "admin" || payload.user.role === "staff" ? "/admin/clients" : "/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (message.toLowerCase().includes("failed to fetch")) {
        setFeedback("Cannot reach the portal API. Please check that the local dev server proxy is running.");
        return;
      }

      setFeedback("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-brand">
          <span className="brand-logo__name">MASTERCRAFT</span>
          <span className="brand-logo__mark" aria-hidden="true">
            M
          </span>
          <span className="brand-logo__product">PRODUCTS</span>
        </div>
        <div>
          <h1>Portal Login</h1>
          <p>Access your Mastercraft Products workspace.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              autoComplete="email"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              type="email"
              value={email}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              autoComplete="current-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              type="password"
              value={password}
            />
          </div>
          <button className="primary-action login-button" disabled={loading} type="submit">
            <PortalIcon name="right" />
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>
          <Link className="reset-back-link" to="/reset-password">
            Reset password
          </Link>
          {feedback ? (
            <p className="login-feedback" aria-live="polite">
              {feedback}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}

export default Login;
