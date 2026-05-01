import React from 'react';
import CodeBlock from './CodeBlock';
import { defaultDenyPolicy, implementationGuides } from '../data/recommendationModel';

export default function ImplementationSteps({ winner }) {
  const guide = implementationGuides[winner.id];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Entregable tecnico
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Pasos de Implementacion
          </h2>
        </div>
        <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
          CNI recomendado: {winner.name}
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <CodeBlock title="Instalacion" code={guide.installCommand} />
        <CodeBlock title="Network Policy - Default Deny" code={defaultDenyPolicy} />
      </div>
    </section>
  );
}
