import { useMutation } from "@apollo/client/react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { savePortalSession, type PortalUser } from "../../auth/session";
import { PortalIcon } from "../../components/PortalIcon";
import { LOGIN } from "../../graphql/portal";

type LoginResponse = {
  login: {
    token: string;
    user: PortalUser;
  };
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [login, { loading }] = useMutation<LoginResponse, { email: string; password: string }>(LOGIN);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    try {
      const response = await login({
        variables: {
          email: email.trim(),
          password,
        },
      });
      const payload = response.data?.login;

      if (!payload) {
        setFeedback("Unable to start your session.");
        return;
      }

      savePortalSession(payload.token, payload.user);
      navigate(payload.user.role === "admin" ? "/admin/clients" : "/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (message.toLowerCase().includes("failed to fetch")) {
        setFeedback("Cannot reach the portal API. Open the app through Netlify Dev on port 8888.");
        return;
      }

      setFeedback("Invalid email or password.");
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
