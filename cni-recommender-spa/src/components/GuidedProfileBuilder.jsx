import React from 'react';
import { criteriaLabels, guidedQuestions } from '../data/recommendationModel';

function PrioritySlider({ question, value, onChange }) {
  const levelLabels = ['', 'Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto'];
  const levelColors = [
    '',
    'bg-slate-200 text-slate-600',
    'bg-blue-100 text-blue-700',
    'bg-amber-100 text-amber-700',
    'bg-orange-100 text-orange-700',
    'bg-red-100 text-red-700',
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <label htmlFor={question.id} className="text-sm font-semibold text-slate-950">
            {question.label}
          </label>
          <p className="mt-1 text-xs leading-5 text-slate-500">{question.help}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${levelColors[value]}`}>
          {levelLabels[value]}
        </span>
      </div>
      <input
        id={question.id}
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(event) => onChange(question.id, Number(event.target.value))}
        className="mt-4 h-2 w-full cursor-pointer accent-slate-950"
      />
      <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
        <span>{question.low}</span>
        <span>{question.high}</span>
      </div>
    </div>
  );
}

export default function GuidedProfileBuilder({ answers, generatedProfile, onChangeAnswer }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Paso 1 — Cuentanos tu contexto
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            ¿Como va a usar Kubernetes?
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-500">
          No necesitas saber de redes. Responde segun lo que necesita tu
          aplicacion y el sistema calculara la mejor opcion.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          {/* Campo de descripcion del proyecto */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label htmlFor="domain" className="text-sm font-semibold text-slate-950">
              ¿Para que es tu proyecto?{' '}
              <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="domain"
              type="text"
              value={answers.domain}
              onChange={(event) => onChangeAnswer('domain', event.target.value)}
              placeholder="Ej: tienda en linea, hospital, juego, base de datos, IoT..."
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {/* Sliders */}
          <div className="grid gap-4 md:grid-cols-2">
            {guidedQuestions.map((question) => (
              <PrioritySlider
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={onChangeAnswer}
              />
            ))}
          </div>
        </div>

        {/* Panel de perfil resultante */}
        <aside className="rounded-xl border border-slate-200 bg-slate-950 p-5 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Tu perfil calculado
          </p>
          <h3 className="mt-3 text-xl font-semibold leading-tight">
            {generatedProfile.name}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {generatedProfile.description}
          </p>

          <div className="mt-5 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <span className="text-sm text-slate-300">Confianza del perfil</span>
            <span className={`text-sm font-semibold ${generatedProfile.confidence === 'Alta' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {generatedProfile.confidence}
            </span>
          </div>

          {/* Barras de pesos */}
          <div className="mt-5 space-y-3">
            {Object.entries(generatedProfile.weights).map(([metric, weight]) => (
              <div key={metric}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-300">{criteriaLabels[metric] ?? metric}</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {Math.round(weight * 100)}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white/80 transition-all duration-500"
                    style={{ width: `${Math.round(weight * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Aviso si la seguridad es alta */}
          {answers.securityNeed >= 4 && (
            <div className="mt-5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-3">
              <p className="text-xs font-semibold text-amber-300">
                ⚠ Seguridad obligatoria activa
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-200/80">
                Los plugins que no soportan control de acceso entre servicios
                seran penalizados en el ranking.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
