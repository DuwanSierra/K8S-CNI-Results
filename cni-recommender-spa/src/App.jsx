import React, { useEffect, useMemo, useState } from 'react';
import ProfileSelector from './components/ProfileSelector';
import ResultsEngine from './components/ResultsEngine';
import ImplementationSteps from './components/ImplementationSteps';
import GuidedProfileBuilder from './components/GuidedProfileBuilder';
import {
  architectureProfiles,
  buildGuidedProfile,
  calculateScores,
  guidedQuestionDefaults,
} from './data/recommendationModel';

export default function App() {
  const [inputMode, setInputMode] = useState('validated');
  const [selectedProfileId, setSelectedProfileId] = useState(architectureProfiles[0].id);
  const [guidedAnswers, setGuidedAnswers] = useState(guidedQuestionDefaults);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [dataStatus, setDataStatus] = useState('Cargando datos');
  const [results, setResults] = useState([]);

  const guidedProfile = useMemo(
    () => buildGuidedProfile(guidedAnswers),
    [guidedAnswers],
  );

  const selectedProfile = useMemo(
    () => {
      if (inputMode === 'guided') return guidedProfile;
      return architectureProfiles.find((profile) => profile.id === selectedProfileId);
    },
    [guidedProfile, inputMode, selectedProfileId],
  );

  useEffect(() => {
    if (!selectedProfile) return;
    setResults(calculateScores(selectedProfile, benchmarkData));
  }, [benchmarkData, selectedProfile]);

  useEffect(() => {
    let isMounted = true;

    fetch(`${import.meta.env.BASE_URL}cni-data.json`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        if (!isMounted) return;
        setBenchmarkData(payload);
        setDataStatus('Datos reales del procesador');
      })
      .catch(() => {
        if (!isMounted) return;
        setBenchmarkData(null);
        setDataStatus('Datos mock de respaldo');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectProfile = (profileId) => {
    setInputMode('validated');
    setSelectedProfileId(profileId);
  };

  const handleChangeGuidedAnswer = (key, value) => {
    setInputMode('guided');
    setGuidedAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const winner = results[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Kubernetes CNI Decision Engine
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Motor de Recomendacion de CNI para Kubernetes
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
                Prototipo funcional SPA en React que aplica MCDA para recomendar
                Flannel, Calico, Cilium o Antrea segun perfiles validados o
                restricciones tecnicas del usuario.
              </p>
            </div>
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:min-w-72">
              <div className="flex items-center justify-between">
                <span>Modelo</span>
                <span className="font-semibold text-slate-950">MCDA ponderado</span>
              </div>
              <div className="flex items-center justify-between">
                <span>CNIs evaluados</span>
                <span className="font-semibold text-slate-950">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Graficos</span>
                <span className="font-semibold text-slate-950">Tailwind CSS</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fuente</span>
                <span className="font-semibold text-slate-950">{dataStatus}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setInputMode('validated')}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                inputMode === 'validated'
                  ? 'bg-slate-950 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Perfiles arquitectonicos validados
            </button>
            <button
              type="button"
              onClick={() => setInputMode('guided')}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                inputMode === 'guided'
                  ? 'bg-slate-950 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              No estoy seguro: crear perfil guiado
            </button>
          </div>
        </section>

        {inputMode === 'validated' ? (
          <ProfileSelector
            profiles={architectureProfiles}
            selectedProfileId={selectedProfileId}
            onSelectProfile={handleSelectProfile}
          />
        ) : (
          <GuidedProfileBuilder
            answers={guidedAnswers}
            generatedProfile={guidedProfile}
            onChangeAnswer={handleChangeGuidedAnswer}
          />
        )}

        {winner ? (
          <>
            <ResultsEngine profile={selectedProfile} results={results} />
            <ImplementationSteps winner={winner} />
          </>
        ) : null}
      </div>
    </main>
  );
}
