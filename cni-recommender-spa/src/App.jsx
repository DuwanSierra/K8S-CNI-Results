import React, { useEffect, useMemo, useState } from 'react';
import ResultsEngine from './components/ResultsEngine';
import ImplementationSteps from './components/ImplementationSteps';
import GuidedProfileBuilder from './components/GuidedProfileBuilder';
import {
  buildGuidedProfile,
  calculateScores,
  guidedQuestionDefaults,
} from './data/recommendationModel';

export default function App() {
  const [guidedAnswers, setGuidedAnswers] = useState(guidedQuestionDefaults);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [dataStatus, setDataStatus] = useState('Cargando...');
  const [results, setResults] = useState([]);

  const guidedProfile = useMemo(
    () => buildGuidedProfile(guidedAnswers),
    [guidedAnswers],
  );

  useEffect(() => {
    if (!guidedProfile) return;
    setResults(calculateScores(guidedProfile, benchmarkData));
  }, [benchmarkData, guidedProfile]);

  useEffect(() => {
    let isMounted = true;
    fetch(`${import.meta.env.BASE_URL}cni-data.json`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (!isMounted) return;
        setBenchmarkData(payload);
        setDataStatus('Datos reales de laboratorio');
      })
      .catch(() => {
        if (!isMounted) return;
        setBenchmarkData(null);
        setDataStatus('Datos de referencia');
      });
    return () => { isMounted = false; };
  }, []);

  const handleChangeGuidedAnswer = (key, value) => {
    setGuidedAnswers((current) => ({ ...current, [key]: value }));
  };

  const winner = results[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Encabezado */}
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Herramienta de seleccion de red para Kubernetes
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                ¿Que plugin de red necesita tu cluster?
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
                Responde unas preguntas sobre tu proyecto y el sistema te dira
                cual de los 4 plugins de red mas usados en Kubernetes se adapta
                mejor a tus necesidades.
              </p>
            </div>
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:min-w-64">
              <div className="flex items-center justify-between">
                <span>Plugins evaluados</span>
                <span className="font-semibold text-slate-950">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Metodo de seleccion</span>
                <span className="font-semibold text-slate-950">MCDA</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fuente de datos</span>
                <span className="font-semibold text-slate-950">{dataStatus}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Cuestionario guiado */}
        <GuidedProfileBuilder
          answers={guidedAnswers}
          generatedProfile={guidedProfile}
          onChangeAnswer={handleChangeGuidedAnswer}
        />

        {/* Resultados */}
        {winner && (
          <>
            <ResultsEngine profile={guidedProfile} results={results} />
            <ImplementationSteps winner={winner} />
          </>
        )}
      </div>
    </main>
  );
}
