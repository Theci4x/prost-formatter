"use client";

import { useActionState } from "react";
import { login, signup, type AuthState } from "@/app/login/actions";

const initialState: AuthState = { error: null };

export function LoginForm() {
  const [loginState, loginAction, loginPending] = useActionState(
    login,
    initialState,
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    initialState,
  );

  const error = loginState.error ?? signupState.error;

  return (
    <form className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-700"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <button
          formAction={loginAction}
          disabled={loginPending || signupPending}
          className="flex-1 rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {loginPending ? "Connexion..." : "Se connecter"}
        </button>
        <button
          formAction={signupAction}
          disabled={loginPending || signupPending}
          className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50"
        >
          {signupPending ? "Inscription..." : "Créer un compte"}
        </button>
      </div>
    </form>
  );
}
