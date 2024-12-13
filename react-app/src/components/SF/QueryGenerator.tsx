import React, { useState, useRef } from 'react';
import axios from 'axios';
import ErrorAlert from '../Common/Error/ErrorAlert';
import { ClipboardCopyIcon, CloudLightningIcon, TimerIcon } from 'lucide-react';

interface QueryGeneratorProps {
    accessToken: string;
    instanceUrl: string;
}

const QueryGenerator: React.FC<QueryGeneratorProps> = ({ accessToken, instanceUrl }) => {
    const [prompt, setPrompt] = useState('');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generationTime, setGenerationTime] = useState<number | null>(null);
    const startTimeRef = useRef<number>(0);

    const handleGenerateQuery = async () => {
        setLoading(true);
        setError(null);
        startTimeRef.current = Date.now();
        try {
            const response = await axios.post('http://localhost:3300/query', {
                prompt,
                accessToken,
                instanceUrl
            });
            setQuery(response.data.query);
            setGenerationTime(Date.now() - startTimeRef.current);
        } catch (err) {
            setError('Failed to generate query. Please try again.');
            console.error('Query generation error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 p-8 bg-white rounded-2xl border border-neutral-200 shadow-lg relative overflow-hidden">
            {/* AI Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-emerald-500/10 blur-2xl" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg">
                        <CloudLightningIcon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-800">
                        AI Query Generator
                    </h2>
                </div>
                {generationTime && !loading && (
                    <div className="flex items-center text-xs text-neutral-500">
                        <TimerIcon className="w-4 h-4 mr-1" />
                        <span>{(generationTime / 1000).toFixed(2)}s</span>
                    </div>
                )}
            </div>

            {/* Input Section */}
            <div className="relative mb-6">
                <textarea
                    className="w-full px-5 py-4 rounded-xl border border-neutral-300 
                             focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                             min-h-[120px] resize-none bg-neutral-50/50
                             placeholder-neutral-400 text-neutral-700"
                    value={prompt}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                    placeholder="Describe your query needs in natural language... (e.g., 'Get all accounts created last month with revenue greater than 1M')"
                />
                <div className="absolute right-3 bottom-3 text-xs text-neutral-400">
                    {prompt.length} characters
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerateQuery}
                disabled={!prompt || loading}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-xl
                          font-semibold text-sm transition-all duration-300 transform
                          ${!prompt || loading
                        ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                    }`}
            >
                {loading ? (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        AI is generating your query...
                    </div>
                ) : (
                    <div className="flex items-center">
                        <span className="mr-2">Generate SOQL Query</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                )}
            </button>

            {error && <ErrorAlert message={error} />}

            {/* Result Section */}
            {query && (
                <div className="mt-8 relative">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-emerald-600">
                            Generated SOQL Query
                        </label>
                        <button
                            onClick={() => navigator.clipboard.writeText(query)}
                            className="text-xs text-neutral-500 hover:text-emerald-600 flex items-center space-x-1 transition-colors"
                            title="Copy to clipboard"
                        >
                            <ClipboardCopyIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <textarea
                        readOnly
                        value={query}
                        className="w-full px-5 py-4 rounded-xl border border-emerald-200 
                                 bg-emerald-50/50 text-neutral-800 font-mono text-sm
                                 min-h-[160px] resize-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            )}
        </div>
    );
};

export default QueryGenerator; 