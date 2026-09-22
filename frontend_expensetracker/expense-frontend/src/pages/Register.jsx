import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@/api/authApi";
import Button from "@/components/ui/Button";
import FormField, { inputCls } from "@/components/ui/FormField";
import { useAsync } from "@/hooks/useAsync";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phoneNumber: "" });
  const { execute, loading, error } = useAsync(register);

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    await execute(form);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">FinTrack</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account</p>
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

          {[
            { name: "name", label: "Full Name", type: "text", placeholder: "Rahul Sharma" },
            { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
            { name: "phoneNumber", label: "Phone Number", type: "tel", placeholder: "9876543210" },
          ].map(({ name, label, type, placeholder }) => (
            <FormField key={name} label={label}>
              <input
                name={name}
                type={type}
                required
                placeholder={placeholder}
                value={form[name]}
                onChange={handle}
                className={inputCls}
              />
            </FormField>
          ))}

          <Button type="submit" loading={loading} className="w-full mt-1">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}