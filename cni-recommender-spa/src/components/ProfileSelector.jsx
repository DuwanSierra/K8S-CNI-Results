import React from 'react';
import { criteriaLabels } from '../data/recommendationModel';

function WeightPill({ label, value }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
      {label}: {Math.round(value * 100)}%
    </span>
  );
}

export default function ProfileSelector({ profiles, selectedProfileId, onSelectProfile }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Entrada del modelo
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Selecciona el perfil de arquitectura
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-500">
          Cada tarjeta carga pesos MCDA internos. El motor recalcula el ranking CNI con
          sumatoria ponderada.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {profiles.map((profile) => {
          const isSelected = selectedProfileId === profile.id;

          return (
            <button
              key={profile.id}
              type="button"
              onClick={() => onSelectProfile(profile.id)}
              className={`group flex h-full flex-col rounded-xl border p-5 text-left transition ${
                isSelected
                  ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                  : 'border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/70'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {profile.tag}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold leading-6">{profile.name}</h3>
                </div>
                <span
                  className={`mt-1 grid h-6 w-6 place-items-center rounded-full border text-xs ${
                    isSelected ? 'border-white bg-white text-slate-950' : 'border-slate-300'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected ? '✓' : ''}
                </span>
              </div>

              <p className={`mt-3 text-sm leading-6 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {profile.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {Object.entries(profile.weights).map(([metric, value]) => (
                  <WeightPill
                    key={metric}
                    label={criteriaLabels[metric] ?? metric}
                    value={value}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
