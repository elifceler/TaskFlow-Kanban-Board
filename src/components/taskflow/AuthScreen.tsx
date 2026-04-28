"use client";

import { useState } from "react";
import { Check, CirclePlus, KanbanSquare } from "lucide-react";
import type { User } from "@/types/taskflow";

type AuthMode = "signin" | "signup";

type AuthScreenProps = {
  onAuth: (mode: AuthMode, payload: Omit<User, "id">) => string | null;
};

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit() {
    const result = onAuth(mode, { name, email, password });
    setError(result ?? "");
  }

  function fillDemoAccount() {
    setMode("signin");
    setName("TaskFlow Ekibi");
    setEmail("demo@taskflow.local");
    setPassword("taskflow");
    setError("");
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-mark">
          <KanbanSquare size={34} strokeWidth={1.8} />
        </div>
        <div>
          <p className="eyebrow">TaskFlow</p>
          <h1>Kanban board yonetimi</h1>
        </div>
        <div className="auth-tabs" role="tablist" aria-label="Kimlik modu">
          <button
            className={mode === "signin" ? "is-active" : ""}
            onClick={() => setMode("signin")}
            type="button"
          >
            Giris
          </button>
          <button
            className={mode === "signup" ? "is-active" : ""}
            onClick={() => setMode("signup")}
            type="button"
          >
            Kayit
          </button>
        </div>
        {mode === "signup" ? (
          <label className="field">
            <span>Ad</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        ) : null}
        <label className="field">
          <span>E-posta</span>
          <input
            type="email"
            placeholder="ornek@taskflow.local"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Sifre</span>
          <input
            type="password"
            placeholder="Sifrenizi girin"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <div className="demo-account">
          <div>
            <strong>Demo hesap</strong>
            <span>demo@taskflow.local / taskflow</span>
          </div>
          <button onClick={fillDemoAccount} type="button">
            Doldur
          </button>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-action" onClick={submit} type="button">
          {mode === "signin" ? <Check size={18} /> : <CirclePlus size={18} />}
          {mode === "signin" ? "Giris yap" : "Hesap olustur"}
        </button>
      </section>
    </main>
  );
}
