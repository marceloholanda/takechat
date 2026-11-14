"use client";

import { useState, useTransition } from "react";
import { setLocale } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/provider";

export function LandingLanguageSwitcher() {
  const { locale } = useI18n();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <div className="or-language-switcher">
      <select
        aria-label="Language / Idioma"
        value={locale === "en" ? "en" : "pt-BR"}
        disabled={pending}
        aria-busy={pending}
        onChange={(event) => {
          const nextLocale = event.target.value;
          setFailed(false);
          startTransition(async () => {
            try {
              await setLocale(nextLocale);
            } catch {
              setFailed(true);
            }
          });
        }}
        className="or-language-select"
      >
        <option value="pt-BR" lang="pt-BR">
          PT
        </option>
        <option value="en" lang="en">
          EN
        </option>
      </select>
      {failed && (
        <span role="alert" className="or-language-error">
          {locale === "en" ? "Language change failed." : "Falha ao mudar o idioma."}
        </span>
      )}
    </div>
  );
}
