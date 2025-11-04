import { signup } from "./actions.server";

export default function SignupPage() {
  return (
    <div style={{ maxWidth: 420, margin: "8vh auto", padding: 16 }}>
      <div style={{ borderRadius: 12, padding: 24 }}>
        <h1 style={{ marginBottom: 6, fontSize: 24, fontWeight: 600 }}>
          Create your account
        </h1>
        <p style={{ marginBottom: 20 }}>
          Already have an account? <a href="/login">Log in</a>.
        </p>

        <form aria-describedby="form-help" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              style={{ padding: "10px 12px" }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              placeholder="••••••••"
              required
              style={{ padding: "10px 12px" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="submit"
              formAction={signup}
              style={{ padding: "10px 14px", borderRadius: 8 }}
            >
              Sign up
            </button>
            <a href="/login" style={{ alignSelf: "center" }}>
              Back to login
            </a>
          </div>

          <p id="form-help" style={{ marginTop: 8, fontSize: 14 }}>
            After signing up, you may receive a confirmation email depending on
            your project settings. Please check your inbox.
          </p>
        </form>
      </div>
    </div>
  );
}
