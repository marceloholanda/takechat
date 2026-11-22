"use client";

import { useMemo, useState } from "react";
import { offerDates } from "@/lib/offer-calendar";

export default function CalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const dates = useMemo(() => offerDates(year).filter(item => Number(item.date.slice(5,7)) === month + 1), [year, month]);
  function move(delta: number) { const next = new Date(year, month + delta, 1); setYear(next.getFullYear()); setMonth(next.getMonth()); }
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(year, month, 1));
  return <div className="mx-auto max-w-5xl space-y-6">
    <div><h1 className="text-2xl font-bold">Calendário de ofertas</h1><p className="mt-2 text-sm text-muted">Planeje ofertas para seus perfis usando datas sazonais, feriados e eventos comerciais.</p></div>
    <div className="flex items-center justify-between gap-3 rounded border border-border bg-surface p-4"><button onClick={() => move(-1)} className="rounded border border-border px-3 py-2" aria-label="Mês anterior">←</button><h2 className="text-lg font-semibold capitalize">{monthName}</h2><button onClick={() => move(1)} className="rounded border border-border px-3 py-2" aria-label="Próximo mês">→</button></div>
    <p className="text-sm text-muted">Escolha a data que combina com o nicho de cada perfil e use as sugestões para selecionar suas ofertas.</p>
    {dates.length ? <div className="grid gap-3 sm:grid-cols-2">{dates.map(item=><article key={item.date+item.name} className="rounded border border-border bg-surface p-5"><div className="flex items-center justify-between gap-3"><time dateTime={item.date} className="text-sm font-semibold text-accent">{item.date.slice(8,10)}/{item.date.slice(5,7)}</time><span className="text-xs text-muted">{item.category === "holiday" ? "Feriado" : item.category === "season" ? "Sazonal" : "Data comercial"}</span></div><h3 className="mt-3 font-semibold">{item.name}</h3><p className="mt-2 text-sm text-muted">Ideias de ofertas: {item.idea}.</p></article>)}</div> : <div className="rounded border border-border bg-surface p-6 text-sm text-muted">Nenhuma data cadastrada para este mês.</div>}
    <p className="text-xs text-muted">Volta às aulas é um período aproximado e pode variar por região. Datas regionais e eventos locais não estão incluídos.</p>
  </div>;
}
