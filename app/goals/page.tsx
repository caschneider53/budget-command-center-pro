'use client';
import { useState } from 'react';

const SAMPLE_GOALS = [
  { id: 1, name: 'Emergency Fund', target: 10000, current: 6500, icon: '🛡️', color: 'blue', deadline: '2025-12-31' },
  { id: 2, name: 'Vacation to Italy', target: 5000, current: 1200, icon: '✈️', color: 'purple', deadline: '2025-08-01' },
  { id: 3, name: 'New Car Down Payment', target: 8000, current: 3200, icon: '🚗', color: 'green', deadline: '2026-03-01' },
  { id: 4, name: 'Home Renovation', target: 20000, current: 4500, icon: '🏠', color: 'orange', deadline: '2026-06-01' },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState(SAMPLE_GOALS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', target: '', current: '', deadline: '' });

  const totalSaved = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const overallPct = Math.round((totalSaved / totalTarget) * 100);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const newGoal = {
      id: Date.now(),
      name: form.name,
      target: Number(form.target),
      current: Number(form.current),
      icon: '🎯',
      color: 'blue',
      deadline: form.deadline,
    };
    setGoals([...goals, newGoal]);
    setForm({ name: '', target: '', current: '', deadline: '' });
    setShowModal(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h1 className="text-xl font-bold">Savings Goals</h1>
              <p className="text-gray-400 text-sm">Track your financial milestones</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New Goal
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Saved</p>
            <p className="text-2xl font-bold mt-1 text-green-400">${totalSaved.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Target</p>
            <p className="text-2xl font-bold mt-1">${totalTarget.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Overall Progress</p>
            <p className="text-2xl font-bold mt-1 text-indigo-400">{overallPct}%</p>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const remaining = goal.target - goal.current;
            return (
              <div key={goal.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{goal.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{goal.name}</h3>
                      <p className="text-gray-400 text-sm">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-indigo-400">{pct}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Saved: <span className="text-white font-medium">${goal.current.toLocaleString()}</span></span>
                  <span className="text-gray-400">Remaining: <span className="text-white font-medium">${remaining.toLocaleString()}</span></span>
                </div>
                <div className="mt-3 text-right">
                  <span className="text-gray-500 text-xs">Target: ${goal.target.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Add New Goal</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Goal Name</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Amount ($)</label>
                <input
                  type="number"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={form.target}
                  onChange={e => setForm({ ...form, target: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount Already Saved ($)</label>
                <input
                  type="number"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={form.current}
                  onChange={e => setForm({ ...form, current: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Date</label>
                <input
                  type="date"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium">Add Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
