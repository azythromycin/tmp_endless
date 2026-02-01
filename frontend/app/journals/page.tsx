"use client";

import { useState, useEffect } from "react";
import Table from "@/components/Table";
import { api } from "@/lib/api";

export default function JournalsPage() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const companies = await api.get('/companies/')
        if (companies.data && companies.data.length > 0) {
          setCompanyId(companies.data[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch company:', error)
      }
    }
    fetchCompany()
  }, []);

  useEffect(() => {
    if (companyId) {
      loadJournals();
    }
  }, [companyId]);

  const loadJournals = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/journals/company/${companyId}`);
      setJournals(response || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading journals...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8 space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Journal Entries</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Double-entry accounting records</p>
          </div>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-sm">
            {error}
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-brand-500 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Journal Entries Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Journal entries are automatically created when you record expenses. They'll appear here following double-entry accounting principles.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-4 py-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Journal listing endpoint coming soon
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {journals.map((journal) => (
              <div key={journal.id} className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{journal.journal_number}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{journal.entry_date}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{journal.memo}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${journal.total_debit?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {journal.is_balanced ? '✓ Balanced' : '⚠ Unbalanced'}
                    </div>
                  </div>
                </div>
                {journal.journal_lines && journal.journal_lines.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-neutral-700 pt-3 space-y-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Lines</div>
                    {journal.journal_lines.map((line: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm pl-4">
                        <div className="text-gray-700 dark:text-gray-300">
                          {line.accounts?.account_name || line.description}
                        </div>
                        <div className="flex gap-6">
                          <div className="w-24 text-right">
                            {line.debit > 0 ? `$${line.debit.toFixed(2)}` : '-'}
                          </div>
                          <div className="w-24 text-right">
                            {line.credit > 0 ? `$${line.credit.toFixed(2)}` : '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card bg-gradient-to-br from-blue-50 to-brand-50 dark:from-blue-900/20 dark:to-brand-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">About Journal Entries</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Journal entries follow double-entry accounting principles. Each expense automatically creates:
            </p>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                A debit entry for the expense category
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                A credit entry for the payment method
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
