import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import FormField, { inputCls } from "@/components/ui/FormField";
import { useAsync } from "@/hooks/useAsync";

export default function Login() {
  const { saveToken } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const { execute, loading, error } = useAsync(login);

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const res = await execute(form);
    saveToken(res.data);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">FinTrack</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <form
          onSubmit={submit}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4"
        >
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <FormField label="Email">
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={handle}
              className={inputCls}
            />
          </FormField>

          <FormField label="Password">
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={handle}
              className={inputCls}
            />
          </FormField>

          <Button type="submit" loading={loading} className="w-full mt-1">
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          No account?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}