import React from 'react';
import { criteriaLabels } from '../data/recommendationModel';
import ScoreChart from './ScoreChart';

export default function ResultsEngine({ profile, results }) {
  const winner = results[0];

  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-soft ring-8 ${winner.ring}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Recomendacion MCDA
        </p>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
              {winner.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{winner.summary}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Puntaje
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
              {winner.score.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">Formula aplicada</p>
          <p className="mt-2 font-mono text-sm leading-6 text-slate-600">
            Puntaje = Sumatoria(Valor_Metrica x Peso_Perfil)
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Motor matematico
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Ranking de CNIs
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {profile.name}
          </span>
        </div>

        <div className="mt-6">
          <ScoreChart results={results} />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-sm font-semibold text-slate-950">Pesos usados</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {Object.entries(profile.weights).map(([metric, value]) => (
              <div key={metric} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-600">{criteriaLabels[metric] ?? metric}</span>
                <span className="text-sm font-semibold text-slate-950">{Math.round(value * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
