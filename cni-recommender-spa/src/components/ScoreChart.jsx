import React from 'react';

export default function ScoreChart({ results }) {
  const maxScore = Math.max(...results.map((item) => item.score), 5);

  return (
    <div className="space-y-4">
      {results.map((item, index) => {
        const width = `${Math.max(8, (item.score / maxScore) * 100)}%`;

        return (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`h-3 w-3 shrink-0 rounded-full ${item.accent}`} />
                <span className="truncate text-sm font-semibold text-slate-800">
                  {index + 1}. {item.name}
                </span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-slate-950">
                {item.score.toFixed(2)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${item.accent} transition-all duration-500`}
                style={{ width }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
