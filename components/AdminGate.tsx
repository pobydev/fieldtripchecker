"use client";

import { FormEvent, useEffect, useState } from "react";

const ADMIN_PASSWORD = "202621";
const STORAGE_KEY = "fieldtrip-admin-ok";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setAllowed(sessionStorage.getItem(STORAGE_KEY) === "true");
    setReady(true);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setAllowed(true);
      setError("");
      return;
    }
    setError("암호가 올바르지 않습니다.");
  }

  if (!ready) return null;
  if (allowed) return <>{children}</>;

  return (
    <main className="page-shell flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4 p-6">
        <div>
          <p className="text-[14px] font-bold text-quizlet-violet">관리자 확인</p>
          <h1 className="mt-2 text-[24px] font-bold text-stormcloud-ink">암호를 입력해 주세요.</h1>
        </div>
        <label className="block space-y-2">
          <span className="label-text">관리자 암호</span>
          <input
            className="input-field"
            type="password"
            inputMode="numeric"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            autoFocus
          />
        </label>
        {error ? <p className="text-sm font-semibold text-danger">{error}</p> : null}
        <button type="submit" className="primary-button w-full">
          들어가기
        </button>
      </form>
    </main>
  );
}
