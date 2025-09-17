import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchSession, fetchSessions } from '../api/sessions';
import type { WorkoutSession } from '../api/types';
import { formatDate, formatDateTime, formatRest, formatRpe, formatWeight } from '../lib/format';

const formatDateValue = (value?: Date | null) => {
  if (!value) {
    return '';
  }
  const pad = (input: number) => `${input}`.padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
};

export function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ from?: Date | null; to?: Date | null }>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSessions({
          from: filters.from ?? undefined,
          to: filters.to ?? undefined
        });
        setSessions(data);
        if (data.length > 0) {
          const first = await fetchSession(data[0].id);
          setSelectedSession(first);
        } else {
          setSelectedSession(null);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filters.from, filters.to]);

  const handleSelect = async (sessionId: string) => {
    try {
      const detail = await fetchSession(sessionId);
      setSelectedSession(detail);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load session');
    }
  };

  const filterSummary = useMemo(() => {
    if (!filters.from && !filters.to) {
      return 'Showing all sessions';
    }
    const fromText = filters.from ? formatDate(filters.from) : 'any time';
    const toText = filters.to ? formatDate(filters.to) : 'now';
    return `Showing sessions from ${fromText} to ${toText}`;
  }, [filters.from, filters.to]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/40">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">History</h1>
            {sessions.length > 0 && <span className="text-sm text-slate-400">{sessions.length} sessions</span>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-200">From</label>
              <input
                type="date"
                value={formatDateValue(filters.from ?? null)}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    from: event.target.value ? new Date(`${event.target.value}T00:00:00`) : null
                  }))
                }
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">To</label>
              <input
                type="date"
                value={formatDateValue(filters.to ?? null)}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    to: event.target.value ? new Date(`${event.target.value}T23:59:59`) : null
                  }))
                }
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
          <p className="text-sm text-slate-400">{filterSummary}</p>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">Loading sessions…</div>
          ) : sessions.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
              No sessions found for the selected range.
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => handleSelect(session.id)}
                className={`w-full rounded-lg border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-slate-700 hover:bg-slate-800 ${
                  selectedSession?.id === session.id ? 'ring-2 ring-slate-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-slate-100">{session.workout?.name ?? 'Workout'}</h2>
                    <p className="text-sm text-slate-400">{formatDateTime(session.date)}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>{session.exerciseSets.length} sets</p>
                    {session.notes && <p className="italic">Notes logged</p>}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/40">
        {!selectedSession ? (
          <div className="text-sm text-slate-400">Select a session to view details.</div>
        ) : (
          <div className="space-y-4">
            <header className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-100">{selectedSession.workout?.name ?? 'Workout Session'}</h2>
              <p className="text-sm text-slate-400">{formatDateTime(selectedSession.date)}</p>
              {selectedSession.notes && <p className="text-sm text-slate-300">{selectedSession.notes}</p>}
            </header>

            <div className="overflow-hidden rounded-md border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-800/60">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300">Exercise</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300">Reps</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300">Weight</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300">RPE</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedSession.exerciseSets.map((set) => (
                    <tr key={set.id}>
                      <td className="px-3 py-2 text-slate-200">{set.exerciseName}</td>
                      <td className="px-3 py-2 text-slate-200">{set.reps}</td>
                      <td className="px-3 py-2 text-slate-200">{formatWeight(set.weight)}</td>
                      <td className="px-3 py-2 text-slate-200">{formatRpe(set.rpe)}</td>
                      <td className="px-3 py-2 text-slate-300">{set.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              <h3 className="font-semibold text-slate-100">Default Plan</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-400">
                {(selectedSession.workout?.defaultExercises ?? []).map((exercise, index) => (
                  <li key={`${exercise.name}-${index}`}>
                    {exercise.name} — {exercise.targetReps} reps @ {formatWeight(exercise.targetWeight)} — Rest {formatRest(exercise.restSeconds)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
