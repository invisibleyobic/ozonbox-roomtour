"use client";

import { useState } from "react";
import type { PromoCheckResult } from "@/lib/promoCodes/evaluate";

export type PromoState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "applied"; code: string; discountPercent: number }
  | { kind: "rejected"; reason: string }
  | { kind: "offline" };

// Поле промокода (08-структура-кода.md): зовёт POST /api/promo-code. Любой
// исход покупку не блокирует (решение 3А): при отказе показываем причину и
// оставляем кнопку оформления рабочей.
export function PromoCodeField({
  value,
  onChange,
  state,
  onState,
}: {
  value: string;
  onChange: (value: string) => void;
  state: PromoState;
  onState: (state: PromoState) => void;
}) {
  const [touched, setTouched] = useState(false);
  const checking = state.kind === "checking";

  const apply = async () => {
    const code = value.trim().toUpperCase();
    setTouched(true);
    if (!code) return;
    onChange(code);
    onState({ kind: "checking" });
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 8000);
      const response = await fetch("/api/promo-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        signal: controller.signal,
      });
      window.clearTimeout(timer);
      if (!response.ok) throw new Error(String(response.status));
      const result = (await response.json()) as PromoCheckResult;
      onState(
        result.valid
          ? { kind: "applied", code, discountPercent: result.discountPercent }
          : { kind: "rejected", reason: result.reason ?? "" }
      );
    } catch {
      onState({ kind: "offline" });
    }
  };

  return (
    <form
      className="promo"
      onSubmit={(event) => {
        event.preventDefault();
        void apply();
      }}
    >
      <label className="promo__label" htmlFor="promo-input">
        Промокод
      </label>
      <div className="promo__row">
        <input
          id="promo-input"
          className={`field field--mono${state.kind === "rejected" ? " is-invalid" : ""}`}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            if (state.kind !== "idle") onState({ kind: "idle" });
          }}
          placeholder="Например, из ролика"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={40}
          disabled={checking}
          aria-describedby="promo-message"
        />
        <button type="submit" className="btn btn--secondary btn--md" disabled={checking || !value.trim()}>
          {checking ? "Проверяем" : "Применить"}
        </button>
      </div>
      <div id="promo-message" className="promo__message" aria-live="polite">
        {state.kind === "idle" && value && !touched && (
          <p className="note note--info">Код подставлен из ссылки. Нажмите «Применить».</p>
        )}
        {state.kind === "applied" && (
          <p className="note note--ok">
            Код <b>{state.code}</b> применён: выгода {state.discountPercent}%
          </p>
        )}
        {state.kind === "rejected" && <p className="note note--err">{state.reason}</p>}
        {state.kind === "offline" && (
          <p className="note note--err">
            Не получилось проверить код: нет связи с сервером.{" "}
            <button type="button" className="link-btn" onClick={() => void apply()}>
              Повторить
            </button>
          </p>
        )}
      </div>
    </form>
  );
}
