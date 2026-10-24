import { useEffect, useRef, useState } from 'react';
import { Bot, Mic, MicOff, Send, Trash2, Volume2 } from 'lucide-react';
import { answerJourneyQuestion, getJourneyStateResponse, type JourneyAssistantContext } from '../modules/ai/journeyAssistant';
import { speechRecognition } from '../modules/voice/speechRecognition';
import { speechSynth } from '../modules/voice/speechSynthesis';

interface JourneyAssistantProps {
  initialQuestion?: string;
  onInitialQuestionHandled?: () => void;
  language?: string;
  context: JourneyAssistantContext;
}

interface ChatMessage {
  id: number;
  role: 'assistant' | 'user';
  text: string;
}

const suggestions = [
  'How can I go from Charbagh Railway Station to Hazratganj?',
  'Which bus should I take to Gomti Nagar?',
  'How much is a trip to Hazratganj?',
  'Show trips under ₹500',
  'What is the next bus to the airport?',
];

export function JourneyAssistant({
  initialQuestion = '',
  onInitialQuestionHandled,
  language = 'en-IN',
  context,
}: JourneyAssistantProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 0,
    role: 'assistant',
    text: 'I can answer from Drishti AI’s demo routes, bus records and place budget estimates. Route and fare details are limited to the available data.',
  }]);
  const messageCounter = useRef(1);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const contextResponse = getJourneyStateResponse(context, language);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  useEffect(() => {
    if (!initialQuestion.trim()) return;
    sendQuestion(initialQuestion);
    onInitialQuestionHandled?.();
    // The prop represents a one-time action from a place card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  useEffect(() => () => speechRecognition.stopListening(), []);

  const sendQuestion = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const answer = answerJourneyQuestion(trimmed, context, language);
    setMessages((current) => [
      ...current,
      { id: messageCounter.current++, role: 'user', text: trimmed },
      { id: messageCounter.current++, role: 'assistant', text: answer },
    ]);
    setInput('');
    setError('');
    speechSynth.speak(answer);
  };

  const startVoiceInput = () => {
    setError('');
    speechRecognition.startListening(
      (result) => {
        setIsListening(false);
        setInput(result.transcript);
        sendQuestion(result.transcript);
      },
      (message) => {
        setIsListening(false);
        setError(message);
        speechSynth.speak(message);
      },
      setIsListening,
      language
    );
  };

  const clearChat = () => {
    messageCounter.current = 1;
    setMessages([{
      id: 0,
      role: 'assistant',
      text: 'Conversation cleared. Ask about a demo route, bus, fare, travel time or place budget.',
    }]);
    setInput('');
    setError('');
  };

  return (
    <section id="journey-assistant" aria-labelledby="journey-assistant-heading" className="scroll-mt-24 space-y-4 rounded-2xl border-2 border-violet-200 bg-white p-5 shadow-sm dark:border-violet-900 dark:bg-slate-800 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Bot className="mt-1 h-6 w-6 shrink-0 text-violet-700 dark:text-violet-300" aria-hidden="true" />
          <div>
            <h2 id="journey-assistant-heading" className="text-2xl font-extrabold">AI Journey Assistant</h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Demo assistant grounded in the app’s routes, fare table and place data. It will state when route data is unavailable.</p>
          </div>
        </div>
        <button type="button" onClick={clearChat} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-400 px-3 py-2 text-sm font-bold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 dark:border-slate-600 dark:hover:bg-slate-700">
          <Trash2 size={17} aria-hidden="true" /> Clear conversation
        </button>
      </div>

      <div aria-live="polite" aria-atomic="true" className="rounded-xl border-2 border-slate-300 bg-slate-100 p-4 dark:border-slate-600 dark:bg-slate-900">
        <p className="font-extrabold">Journey status</p>
        <p className="mt-1">{contextResponse}</p>
        <button
          type="button"
          onClick={() => sendQuestion('What should I do now?')}
          className="mt-3 min-h-11 rounded-lg border-2 border-violet-700 px-4 py-2 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
        >
          What should I do next?
        </button>
      </div>

      <p className="text-sm text-slate-700 dark:text-slate-200">
        Answers stay visible if speech output is unavailable. If speech recognition is unsupported, type your question instead.
      </p>

      <div role="log" aria-label="Journey assistant conversation" aria-live="polite" aria-relevant="additions" className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
        {messages.map((message) => (
          <div key={message.id} className={`max-w-[95%] rounded-xl p-3 ${message.role === 'user' ? 'ml-auto bg-blue-700 text-white' : 'mr-auto border border-violet-200 bg-white text-slate-950 dark:border-violet-800 dark:bg-slate-800 dark:text-white'}`}>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-wide">{message.role === 'user' ? 'You' : 'Assistant'}</p>
            <p>{message.text}</p>
            {message.role === 'assistant' && (
              <button type="button" aria-label="Speak this response" onClick={() => speechSynth.speak(message.text)} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-400 px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 dark:border-slate-600">
                <Volume2 size={16} aria-hidden="true" /> Read aloud
              </button>
            )}
          </div>
        ))}
        <div ref={lastMessageRef} />
      </div>

      <div>
        <h3 className="mb-2 font-bold">Suggested questions</h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((question) => (
            <button key={question} type="button" onClick={() => sendQuestion(question)} className="min-h-10 rounded-full border border-violet-300 bg-violet-50 px-3 py-2 text-left text-sm font-semibold hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 dark:border-violet-800 dark:bg-violet-950/40 dark:hover:bg-violet-900">
              {question}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(event) => { event.preventDefault(); sendQuestion(input); }} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="journey-assistant-input" className="sr-only">Ask a journey question</label>
        <input id="journey-assistant-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about a bus, place, fare or journey…" className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
        {speechRecognition.isSupported() && (
          <button type="button" onClick={startVoiceInput} aria-pressed={isListening} aria-label={isListening ? 'Stop voice input' : 'Ask by voice'} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-4 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 ${isListening ? 'border-rose-700 bg-rose-700 text-white' : 'border-violet-700 text-violet-900 dark:text-violet-100'}`}>
            {isListening ? <MicOff size={19} aria-hidden="true" /> : <Mic size={19} aria-hidden="true" />}
            {isListening ? 'Listening' : 'Voice'}
          </button>
        )}
        <button type="submit" disabled={!input.trim()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 font-extrabold text-white hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50">
          <Send size={18} aria-hidden="true" /> Send
        </button>
      </form>
      {error && <p role="alert" className="rounded-lg border-2 border-rose-600 bg-rose-50 p-3 text-sm font-semibold text-rose-950 dark:bg-rose-950/40 dark:text-rose-100">{error}</p>}
    </section>
  );
}
