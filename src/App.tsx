/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { 
  FileText, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  Settings2, 
  Eraser, 
  Layout, 
  BookOpen, 
  FileCode2,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from './lib/utils';
import { 
  processAcademicText, 
  AcademicStyle, 
  AcademicMode, 
  RewriteOptions,
  ProcessedResult
} from './services/geminiService';

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<RewriteOptions>({
    style: 'Formal',
    mode: 'Grammar + Clarity Mode',
    format: 'Plain English'
  });

  const handleRewrite = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const res = await processAcademicText(input, options);
      setResult(res);
      setOutput(res.text);
    } catch (error) {
      console.error(error);
      setOutput('An error occurred during processing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">ScholarNode</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold leading-none">Academic Writing Copilot</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={clearAll}
            className="text-gray-500 hover:text-black transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Eraser className="w-4 h-4" />
            Clear
          </button>
          <div className="h-4 w-[1px] bg-border" />
          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </header>

      {/* Control Bar */}
      <div className="bg-white border-b border-border px-6 py-3 flex flex-wrap items-center gap-6 sticky top-16 z-40 backdrop-blur-sm bg-opacity-80">
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Style</label>
          <div className="relative group">
            <select 
              value={options.style}
              onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value as AcademicStyle }))}
              className="appearance-none bg-bg border border-border px-3 py-1.5 pr-8 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition-all cursor-pointer"
            >
              {['IEEE', 'ACM', 'Springer', 'Elsevier', 'Thesis', 'Formal', 'Simplified'].map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mode</label>
          <div className="relative group">
            <select 
              value={options.mode}
              onChange={(e) => setOptions(prev => ({ ...prev, mode: e.target.value as AcademicMode }))}
              className="appearance-none bg-bg border border-border px-3 py-1.5 pr-8 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition-all cursor-pointer"
            >
              {[
                'Strong Humanization', 
                'Technical Preservation Priority', 
                'Simplified Academic English', 
                'Reviewer Mode', 
                'LaTeX Cleanup Mode', 
                'Grammar + Clarity Mode'
              ].map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Format</label>
          <div className="bg-bg border border-border rounded-md p-0.5 flex gap-0.5">
            <button 
              onClick={() => setOptions(prev => ({ ...prev, format: 'Plain English' }))}
              className={cn(
                "px-3 py-1 rounded text-xs font-semibold transition-all",
                options.format === 'Plain English' ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Plain English
            </button>
            <button 
              onClick={() => setOptions(prev => ({ ...prev, format: 'LaTeX' }))}
              className={cn(
                "px-3 py-1 rounded text-xs font-semibold transition-all",
                options.format === 'LaTeX' ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"
              )}
            >
              LaTeX
            </button>
          </div>
        </div>
      </div>

      {/* Templates Bar */}
      <div className="bg-gray-50 border-b border-border px-6 py-2.5 flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5">
          <Layout className="w-3 h-3" />
          Templates:
        </span>
        <div className="flex gap-2">
          {[
            { label: 'Abstract', text: 'Abstract: \nInsert your technical draft here...' },
            { label: 'Introduction', text: 'Introduction: \nDefine background, motivation, and problem statement...' },
            { label: 'Literature Review', text: 'Related Work: \nList key citations and state-of-the-art developments...' },
            { label: 'Methodology', text: 'Methodology: \nDetail experimental setup, algorithms, or proof structures...' },
            { label: 'Conclusion', text: 'Conclusion: \nSummarize contributions and suggest future research directions...' },
          ].map((template) => (
            <button
              key={template.label}
              onClick={() => setInput(template.text)}
              className="px-3 py-1 bg-white border border-border rounded-full text-[11px] font-semibold text-gray-600 hover:border-black hover:text-black transition-all whitespace-nowrap hover:shadow-sm"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden pb-10">
        {/* Input Area */}
        <section className="flex-1 flex flex-col border-r border-border p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-400">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Source Material</span>
            </div>
            <div className="text-[10px] text-gray-400 font-medium">
              {input.length} characters
            </div>
          </div>
          
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your academic draft, LaTeX code, or research notes here..."
            className="flex-1 w-full bg-transparent resize-none focus:outline-none text-[15px] leading-relaxed text-gray-700 placeholder:text-gray-300 font-mono"
          />

          <div className="mt-6 pt-4 border-t border-border flex justify-end">
            <button 
              onClick={handleRewrite}
              disabled={isProcessing || !input.trim()}
              className={cn(
                "px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-black/5",
                input.trim() 
                  ? "bg-black text-white hover:scale-[1.02] active:scale-[0.98]" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Refine Manuscript
                </>
              )}
            </button>
          </div>
        </section>

        {/* Output Area */}
        <section className="flex-1 flex flex-col p-6 bg-bg relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Check className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">ScholarNode Result</span>
            </div>
            {output && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopy}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm font-bold shadow-sm",
                    copied 
                      ? "bg-green-50 border-green-200 text-green-700" 
                      : "bg-black text-white hover:bg-gray-800 border-black"
                  )}
                  title={`Copy as ${options.format}`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : `Copy ${options.format}`}</span>
                </button>
                <div className="w-[1px] h-4 bg-border mx-1" />
                <button 
                  onClick={() => setOutput('')}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-600"
                  title="Clear result"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto bg-white rounded-xl border border-border p-8 shadow-sm flex flex-col">
            <AnimatePresence mode="wait">
              {!output && !isProcessing ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400 group"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-8 h-8 opacity-20" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-600">Ready to assist</h3>
                    <p className="text-sm max-w-[240px]">Select your target style and mode, then click 'Refine Manuscript' to begin.</p>
                  </div>
                </motion.div>
              ) : isProcessing ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center space-y-6"
                >
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                    <Sparkles className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/20" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-bold text-black font-mono">HUMANIZING CONTENT</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Preserving technical meaning...</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={output}
                  className="flex-1 flex flex-col"
                >
                  {/* Analysis Header */}
                  {result && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <div className="bg-gray-50 rounded-lg p-3 ring-1 ring-border">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Uniqueness</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-black">{(100 - result.plagiarismPercentage).toFixed(0)}%</span>
                          <span className="text-[10px] text-green-600 font-semibold">Verified</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 ring-1 ring-border">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Human Confidence</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-black">{(100 - result.aiGeneratedPercentage).toFixed(0)}%</span>
                          <span className="text-[10px] text-blue-600 font-semibold">High</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 ring-1 ring-border">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Plagiarism Score</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-black">{result.plagiarismPercentage}%</span>
                          <span className="text-[10px] text-gray-400 font-semibold">Low</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 ring-1 ring-border">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">AI Detected</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-black">{result.aiGeneratedPercentage}%</span>
                          <span className="text-[10px] text-gray-400 font-semibold">Natural</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="prose prose-slate max-w-none text-gray-800 flex-1 relative group">
                    {options.format === 'LaTeX' ? (
                      <div className="group relative">
                        <pre className="p-4 bg-gray-50 rounded-lg overflow-auto border border-border font-mono text-sm leading-relaxed">
                          <code>{output}</code>
                        </pre>
                      </div>
                    ) : (
                      <ReactMarkdown 
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          p: ({children}) => <p className="mb-4 leading-relaxed font-serif text-[17px] text-gray-900">{children}</p>,
                          h1: ({children}) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2 text-black">{children}</h1>,
                          h2: ({children}) => <h2 className="text-xl font-bold mt-6 mb-3 text-black">{children}</h2>,
                          ul: ({children}) => <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-800">{children}</ul>,
                          li: ({children}) => <li className="text-[16px] leading-relaxed">{children}</li>,
                          strong: ({children}) => <strong className="font-bold text-black">{children}</strong>,
                          em: ({children}) => <em className="italic text-gray-900">{children}</em>,
                        }}
                      >
                        {output}
                      </ReactMarkdown>
                    )}
                  </div>

                  {result && result.suggestions.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Academic Improvements made</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.suggestions.map((s, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-black/5 text-black rounded-md text-[11px] font-medium border border-black/5 leading-none">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Status Bar */}
      <footer className="h-8 border-t border-border bg-white px-6 flex items-center justify-between text-[10px] text-gray-400 font-bold tracking-widest bg-opacity-95 fixed bottom-0 w-full z-50">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            GS-3 ENGINE ACTIVE
          </span>
          <span>LATEX COMPILER v1.2</span>
        </div>
        <div className="flex gap-4">
          <span>ETHICAL AI ASSISTANT</span>
          <span className="text-black">© 2026 SCHOLARNODE</span>
        </div>
      </footer>
    </div>
  );
}

