import React from 'react';
import { criteriaLabels, guidedQuestions } from '../data/recommendationModel';

function PrioritySlider({ question, value, onChange }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor={question.id} className="text-sm font-semibold text-slate-950">
            {question.label}
          </label>
          <p className="mt-1 text-sm leading-5 text-slate-500">{question.help}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
          {value}/5
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
      <div className="mt-2 flex justify-between text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
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
            Perfil guiado
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Cuentame tu contexto y restricciones
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-500">
          Esta entrada no reemplaza el MCDA: genera los pesos del perfil a partir de
          restricciones tecnicas generales.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label htmlFor="domain" className="text-sm font-semibold text-slate-950">
              En que trabaja o que tipo de aplicacion quiere desplegar?
            </label>
            <input
              id="domain"
              type="text"
              value={answers.domain}
              onChange={(event) => onChangeAnswer('domain', event.target.value)}
              placeholder="Ej: e-commerce, analitica, educacion, APIs internas, video, IoT..."
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

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

        <aside className="rounded-xl border border-slate-200 bg-slate-950 p-5 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Perfil resultante
          </p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight">
            {generatedProfile.name}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {generatedProfile.description}
          </p>

          <div className="mt-5 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <span className="text-sm text-slate-300">Confianza</span>
            <span className="text-sm font-semibold">{generatedProfile.confidence}</span>
          </div>

          <div className="mt-5 space-y-3">
            {Object.entries(generatedProfile.weights).map(([metric, weight]) => (
              <div key={metric}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-300">{criteriaLabels[metric] ?? metric}</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {Math.round(weight * 100)}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${Math.round(weight * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
