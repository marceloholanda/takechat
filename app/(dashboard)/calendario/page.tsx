"use client";

import { useMemo, useState } from "react";
import { offerDates } from "@/lib/offer-calendar";

const colors = { holiday: "bg-red-100 text-red-900", season: "bg-blue-100 text-blue-900", commercial: "bg-orange-100 text-orange-900" };

export default function CalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const dates = useMemo(() => offerDates(year).filter(item => Number(item.date.slice(5, 7)) === month + 1), [year, month]);
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month +  1, 0).getDate();
  const cells = Math.ceil((firstDay + days) / 7) * 7;
  const selectedDates = dates.filter(item => item.date === selected);
  function move(delta: number) { const next = new Date(year, month + delta, 1); setYear(next.getFullYear()); setMonth(next.getMonth()); setSelected(null); }
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(year, month, 1));
  return <div className="mx-auto max-w-6xl space-y-6">
    <div><h1 className="text-2xl font-bold">Calendário de ofertas</h1><p className="mt-2 text-sm text-muted">Veja datas sazonais, feriados e eventos para planejar suas ofertas.</p></div>
    <div className="flex items-center justify-between gap-3 rounded border border-border bg-surface p-4"><button onClick={() => move(-1)} className="rounded border border-border px-3 py-2" aria-label="Mês anterior">←</button><h2 className="text-lg font-semibold capitalize">{monthName}</h2><button onClick={() => move(1)} className="rounded border border-border px-3 py-2" aria-label="Próximo mês">→</button></div>
    <div className="flex flex-wrap gap-4 text-xs"><span className="rounded bg-red-100 px-2 py-1 text-red-900">Feriado</span><span className="rounded bg-orange-100 px-2 py-1 text-orange-900">Data comercial</span><span className="rounded bg-blue-100 px-2 py-1 text-blue-900">Sazonal</span></div>
    <div className="overflow-x-auto rounded border border-border"><div className="min-w-[700px]"><div className="grid grid-cols-7 bg-surface">{["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map(day => <div key={day} className="border-b border-border p-3 text-sm font-semibold">{day}</div>)}</div><div className="grid grid-cols-7">{Array.from({ length: cells }, (_, i) => { const day = i - firstDay + 1; if (day < 1 || day > days) return <div key={i} className="min-h-28 border-b border-r border-border bg-surface" />; const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; const events = dates.filter(item => item.date === date); return <div key={i} className="min-h-28 space-y-1 border-b border-r border-border p-2"><span className="text-sm font-semibold">{day}</span>{events.map(item => <button key={item.name} onClick={() => setSelected(date)} className={`block w-full rounded px-2 py-1 text-left text-xs font-medium ${colors[item.category]}`}>{item.name}</button>)}</div>; })}</div></div></div>
    {selectedDates.length > 0 && <section className="space-y-3 rounded border border-border bg-surface p-5"><div className="flex justify-between"><h2 className="font-semibold">Ideias para {selected?.slice(8, 10)}/{selected?.slice(5, 7)}</h2><button onClick={() => setSelected(null)} aria-label="Fechar detalhes">✕</button></div>{selectedDates.map(item => <div key={item.name}><h3 className="font-medium">{item.name}</h3><p className="text-sm text-muted">Ideias de ofertas: {item.idea}.</p></div>)}</section>}
    <p className="text-xs text-muted">Toque em uma data marcada para ver ideias de ofertas. Volta às aulas é um período aproximado e pode variar por região. Datas regionais e eventos locais não estão incluídos.</p>
  </div>;
}
