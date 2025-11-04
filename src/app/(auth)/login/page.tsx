import { login } from "./actions";

export default function LoginPage() {
  return (
    <div style={{ maxWidth: 420, margin: "8vh auto", padding: 16 }}>
      <div style={{ borderRadius: 12, padding: 24 }}>
        <h1 style={{ marginBottom: 6, fontSize: 24, fontWeight: 600 }}>
          Welcome back
        </h1>
        <p style={{ marginBottom: 20 }}>
          Log in to your account. New here?{" "}
          <a href="/signup">Create an account</a>.
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
              autoComplete="current-password"
              minLength={6}
              placeholder="••••••••"
              required
              style={{ padding: "10px 12px" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="submit"
              formAction={login}
              style={{ padding: "10px 14px", borderRadius: 8 }}
            >
              Log in
            </button>
            <a href="/signup" style={{ alignSelf: "center" }}>
              Sign up
            </a>
          </div>

          <p id="form-help" style={{ marginTop: 8, fontSize: 14 }}>
            Having trouble logging in? Try resetting your password or contact
            support.
          </p>
        </form>
      </div>
    </div>
  );
}
