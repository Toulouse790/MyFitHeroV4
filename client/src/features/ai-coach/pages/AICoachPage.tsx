import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ChangeEvent,
  KeyboardEvent,
  memo,
  FC,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { AiOutlineSend, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from 'sonner';

/* --- TYPES --- */

type AIMessageRole = 'user' | 'assistant';
interface AIChatMessage {
  role: AIMessageRole;
  content: string;
}

interface ExerciseAnalysisResult {
  postureScore: number;
  warning: string;
  caloriesBurned: number;
}

interface PersonalPlan {
  workouts: string[];
  nutrition: { calories: number; macros: { protein: number; carbs: number; fat: number } };
  hydration: { dailyLiters: number };
  sleep: { hours: number };
}

type QuickActionType = 'planJour' | 'ajusterCharge' | 'analyserForme';

/* --- API SIMULATIONS --- */

async function fetchAICoachResponse(params: { messages: AIChatMessage[] }): Promise<string> {
  // Simule un stream ou un délai
  await new Promise(r => setTimeout(r, 1500));
  return 'Réponse IA simulée basée sur le contexte et messages...';
}

async function fetchExerciseAnalysis(videoElem: HTMLVideoElement): Promise<ExerciseAnalysisResult> {
  // Simule analyse vidéo
  await new Promise(r => setTimeout(r, 1000));
  return {
    postureScore: 85,
    warning: '',
    caloriesBurned: 12,
  };
}

async function fetchPersonalizedPlan(): Promise<PersonalPlan> {
  return {
    workouts: ['Séance full body', 'Cardio HIIT'],
    nutrition: { calories: 2200, macros: { protein: 150, carbs: 250, fat: 70 } },
    hydration: { dailyLiters: 2.5 },
    sleep: { hours: 7.5 },
  };
}

/* --- HOOK VOICE INPUT/OUTPUT --- */

const useVoice = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voiceSupported = Boolean(
    window.SpeechRecognition || (window as any).webkitSpeechRecognition
  );

  useEffect(() => {
    if (!voiceSupported) return;
    const SpeechRecognitionClass = (window.SpeechRecognition ||
      (window as any).webkitSpeechRecognition) as typeof SpeechRecognition;
    recognitionRef.current = new SpeechRecognitionClass();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'fr-FR';

    recognitionRef.current.onresult = event => {
      if (event.results.length > 0) {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
      }
    };
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = e => {
      console.error('Recognition error', e);
      toast.error('Erreur micro, veuillez réessayer.');
      setIsListening(false);
    };
  }, [voiceSupported]);

  const listen = useCallback(() => {
    if (!voiceSupported || !recognitionRef.current) return;
    setText('');
    setIsListening(true);
    recognitionRef.current.start();
  }, [voiceSupported]);

  const stopListening = useCallback(() => {
    if (!voiceSupported || !recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, [voiceSupported]);

  return {
    text,
    isListening,
    listen,
    stopListening,
    voiceSupported,
  };
};

/* --- COMPOSANTS SECONDAIRES --- */

interface UniformHeaderProps {
  title: string;
  subtitle?: string;
}
const UniformHeader: FC<UniformHeaderProps> = memo(({ title, subtitle }) => (
  <header className="bg-blue-700 dark:bg-blue-900 text-white p-4 shadow-md sticky top-0 z-30">
    <h1 className="text-3xl font-semibold">{title}</h1>
    {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
  </header>
));

interface SkeletonProps {
  count: number;
  className?: string;
}
const Skeleton: FC<SkeletonProps> = ({ count, className }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={clsx('bg-gray-300 animate-pulse rounded-md my-1', className)} />
    ))}
  </>
);

interface ChatMessageProps {
  role: AIMessageRole;
  content: string;
}
const ChatMessage: FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className={clsx(
        'max-w-[75%] p-3 rounded-lg mb-2 whitespace-pre-wrap',
        isUser ? 'bg-blue-600 text-white self-end' : 'bg-gray-200 text-gray-900 self-start',
        'shadow-sm'
      )}
      role="article"
      aria-label={isUser ? 'Message utilisateur' : 'Message assistant AI'}
    >
      {content}
    </motion.div>
  );
};

interface QuickActionsProps {
  onAction: (action: QuickActionType) => void;
}
const QuickActions: FC<QuickActionsProps> = ({ onAction }) => (
  <section
    aria-label="Actions rapides pour coach IA"
    className="flex justify-around bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-inner"
  >
    <button
      onClick={() => onAction('planJour')}
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-400"
      aria-label="Générer plan du jour"
    >
      Plan du jour
    </button>
    <button
      onClick={() => onAction('ajusterCharge')}
      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-400"
      aria-label="Ajuster charge"
    >
      Ajuster charge
    </button>
    <button
      onClick={() => onAction('analyserForme')}
      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-400"
      aria-label="Analyser forme"
    >
      Analyser forme
    </button>
  </section>
);

interface VideoAnalyserProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  exerciseAnalysis: ExerciseAnalysisResult | null;
  isLiveCoaching: boolean;
}
const VideoAnalyser: FC<VideoAnalyserProps> = ({ videoRef, exerciseAnalysis, isLiveCoaching }) => (
  <div className="flex flex-col items-center">
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="rounded-lg shadow-md border w-full max-w-md aspect-video bg-black"
      aria-label="Flux vidéo pour analyse de la forme"
    />
    {isLiveCoaching ? (
      <p className="mt-2 text-green-600 font-semibold">Coaching live activé</p>
    ) : (
      <p className="mt-2 text-gray-500 italic">Coaching live désactivé</p>
    )}
    {exerciseAnalysis && (
      <div className="mt-4 text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-lg w-full max-w-md shadow-inner">
        <p>
          <strong>Score posture:</strong> {exerciseAnalysis.postureScore}%
        </p>
        {exerciseAnalysis.warning && (
          <p className="text-red-600 font-semibold">⚠️ {exerciseAnalysis.warning}</p>
        )}
        <p>
          <strong>Calories estimées brûlées:</strong> {exerciseAnalysis.caloriesBurned}
        </p>
      </div>
    )}
  </div>
);

/* --- HOOK LOGIQUE PRINCIPALE --- */

const useAICoachLogic = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [exerciseAnalysis, setExerciseAnalysis] = useState<ExerciseAnalysisResult | null>(null);
  const [personalPlan, setPersonalPlan] = useState<PersonalPlan | null>(null);
  const [isLiveCoaching, setIsLiveCoaching] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Voice input/output
  const { text: voiceText, isListening, listen, stopListening, voiceSupported } = useVoice();

  // Append user message and get AI response
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      const newUserMsg: AIChatMessage = { role: 'user', content };
      setMessages(prev => [...prev, newUserMsg]);
      setIsStreaming(true);
      try {
        const response = await fetchAICoachResponse({ messages: [...messages, newUserMsg] });
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      } catch {
      // Erreur silencieuse
        toast.error('Erreur communication IA.');
      } finally {
        setIsStreaming(false);
      }
    },
    [messages]
  );

  // On voice text change and listen stopped, send voice as message
  useEffect(() => {
    if (voiceText && !isListening) {
      sendMessage(voiceText);
      setInput('');
    }
  }, [voiceText, isListening, sendMessage]);

  // Input handlers
  const onChangeInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);
  const onKeyDownInput = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && input.trim()) {
        sendMessage(input);
        setInput('');
      }
    },
    [input, sendMessage]
  );

  // Quick actions
  const onExecuteQuickAction = useCallback(async (action: QuickActionType) => {
    if (action === 'planJour') {
      try {
        const plan = await fetchPersonalizedPlan();
        setPersonalPlan(plan);
        toast.success('Plan personnalisé généré.');
      } catch {
      // Erreur silencieuse
        toast.error('Erreur lors génération plan.');
      }
    } else if (action === 'ajusterCharge') {
      toast.info('Fonction Ajuster Charge en développement.');
    } else if (action === 'analyserForme') {
      if (!videoRef.current) {
        toast.error('Vidéo non disponible.');
        return;
      }
      try {
        const analysis = await fetchExerciseAnalysis(videoRef.current);
        setExerciseAnalysis(analysis);
        toast.success('Analyse forme terminée.');
      } catch {
      // Erreur silencieuse
        toast.error('Erreur analyse video.');
      }
    }
  }, []);

  // Live coaching - cycle analyse vidéo continu
  useEffect(() => {
    let animationId: number | null = null;

    const analyseLoop = async () => {
      if (!videoRef.current) return;
      try {
        const analysis = await fetchExerciseAnalysis(videoRef.current);
        setExerciseAnalysis(analysis);
      } catch {
      // Erreur silencieuse
        // Silence error buffering
      }
      animationId = requestAnimationFrame(analyseLoop);
    };

    if (isLiveCoaching) analyseLoop();
    else if (animationId) cancelAnimationFrame(animationId);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isLiveCoaching]);

  const toggleLiveCoaching = useCallback(() => setIsLiveCoaching(v => !v), []);

  return {
    messages,
    input,
    isStreaming,
    onChangeInput,
    onKeyDownInput,
    sendMessage,
    voiceSupported,
    isListening,
    listen,
    stopListening,
    onExecuteQuickAction,
    exerciseAnalysis,
    personalPlan,
    videoRef,
    isLiveCoaching,
    toggleLiveCoaching,
  };
};

/* --- PAGE PRINCIPALE AICoachPage --- */

const AICoachPage: FC = () => {
  const {
    messages,
    input,
    isStreaming,
    onChangeInput,
    onKeyDownInput,
    voiceSupported,
    isListening,
    listen,
    stopListening,
    onExecuteQuickAction,
    exerciseAnalysis,
    personalPlan,
    videoRef,
    isLiveCoaching,
    toggleLiveCoaching,
  } = useAICoachLogic();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <UniformHeader title="AI Coach" subtitle="Votre coach fitness intelligent" />
      <main className="flex-grow max-w-4xl mx-auto p-4 grid gap-8">
        <QuickActions onAction={onExecuteQuickAction} />

        <section
          aria-label="Chat conversation avec AI Coach"
          className="flex flex-col border rounded-lg p-4 min-h-[400px] bg-white dark:bg-gray-900 shadow"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-800">
            {messages.length === 0 && !isStreaming && (
              <Skeleton count={3} className="h-10 rounded-md" />
            )}
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <ChatMessage key={i} role={m.role} content={m.content} />
              ))}
              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="italic text-gray-500 dark:text-gray-400"
                  aria-live="assertive"
                >
                  <AiOutlineLoading3Quarters className="inline animate-spin mr-1" />
                  L'IA rédige...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              if (input.trim()) onExecuteQuickAction('planJour');
            }}
            className="flex items-center mt-2"
            aria-label="Envoyer un message au coach AI"
          >
            <input
              type="text"
              aria-label="Votre question ou message"
              placeholder="Posez une question ou dites quelque chose..."
              value={input}
              onChange={onChangeInput}
              onKeyDown={onKeyDownInput}
              disabled={isStreaming}
              className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {voiceSupported && (
              <button
                type="button"
                aria-pressed={isListening}
                onClick={isListening ? stopListening : listen}
                title={isListening ? "Arrêter l'écoute vocale" : "Activer l'écoute vocale"}
                className={clsx(
                  'px-3 py-2 border border-l-0 rounded-r-md focus:outline-none',
                  isListening ? 'bg-red-600 text-white' : 'bg-gray-300 dark:bg-gray-700'
                )}
              >
                🎤
              </button>
            )}
            <button
              type="submit"
              disabled={isStreaming || input.trim() === ''}
              aria-disabled={isStreaming || input.trim() === ''}
              title="Envoyer"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              <AiOutlineSend size={20} />
            </button>
          </form>
        </section>

        <section
          aria-label="Analyse vidéo de la forme d'exercice"
          className="border rounded-lg p-4 bg-white dark:bg-gray-900 shadow flex flex-col items-center"
        >
          <h2 className="text-lg font-semibold mb-2">Analyse vidéo</h2>
          <VideoAnalyser
            videoRef={videoRef}
            exerciseAnalysis={exerciseAnalysis}
            isLiveCoaching={isLiveCoaching}
          />
          <button
            onClick={toggleLiveCoaching}
            aria-pressed={isLiveCoaching}
            className={clsx(
              'mt-3 px-4 py-2 rounded-md focus:outline-none',
              isLiveCoaching ? 'bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-700'
            )}
          >
            {isLiveCoaching ? 'Arrêter le coaching live' : 'Démarrer coaching live'}
          </button>
        </section>

        {personalPlan && (
          <section
            aria-label="Plan personnalisé généré"
            className="border rounded-lg p-4 bg-white dark:bg-gray-900 shadow max-w-4xl overflow-auto"
          >
            <h2 className="text-lg font-semibold mb-2">Plan personnalisé</h2>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(personalPlan, null, 2)}
            </pre>
          </section>
        )}
      </main>
    </div>
  );
};

export default memo(AICoachPage);
