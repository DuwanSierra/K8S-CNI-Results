import React from 'react';
import { criteriaLabels } from '../data/recommendationModel';
import ScoreChart from './ScoreChart';

export default function ResultsEngine({ profile, results }) {
  const winner = results[0];
  const penalizedCnis = results.filter((r) => r.securityPenalized);

  return (
    <section className="flex flex-col gap-5">

      {/* Alerta de penalización — solo aparece cuando hay CNIs descalificados por seguridad */}
      {penalizedCnis.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {penalizedCnis.map((c) => c.name).join(' y ')}{' '}
                {penalizedCnis.length === 1 ? 'fue penalizado' : 'fueron penalizados'} por no soportar control de acceso
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Marcaste la seguridad como importante. {penalizedCnis.map((c) => c.name).join(' y ')}{' '}
                {penalizedCnis.length === 1 ? 'no permite' : 'no permiten'} definir reglas de quién puede hablar con quién dentro
                del cluster, por lo que {penalizedCnis.length === 1 ? 'su puntaje fue reducido' : 'sus puntajes fueron reducidos'} automaticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">

        {/* Recomendación ganadora */}
        <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-soft ring-8 ${winner.ring}`}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Recomendacion
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

          {/* Capacidades clave del ganador */}
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">Que hace bien</p>
            <ul className="mt-3 space-y-1.5">
              {winner.supportsNetworkPolicy && (
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500">✓</span> Soporta control de acceso entre servicios
                </li>
              )}
              {!winner.supportsNetworkPolicy && (
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-slate-400">–</span> No soporta control de acceso entre servicios
                </li>
              )}
              {winner.scores.resourceEfficiency >= 4 && (
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500">✓</span> Muy eficiente en uso de recursos
                </li>
              )}
              {winner.scores.latency >= 4 && (
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500">✓</span> Baja latencia (respuesta rapida)
                </li>
              )}
              {winner.scores.throughput >= 4 && (
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500">✓</span> Alto throughput (mueve muchos datos)
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Ranking completo */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Comparacion completa
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Ranking de plugins
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
            <p className="text-sm font-semibold text-slate-950">Importancia de cada factor en este perfil</p>
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
      </div>
    </section>
  );
}
