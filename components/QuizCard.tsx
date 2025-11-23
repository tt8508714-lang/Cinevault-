import React, { useState, useEffect } from 'react';
import { Brain, Award, RefreshCw } from 'lucide-react';
import { QuizQuestion } from '../types';
import { generateTrivia } from '../services/geminiService';

interface Props {
  isPremium: boolean;
  onUnlock: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const QuizCard: React.FC<Props> = ({ isPremium, onUnlock, showToast }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const loadQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    try {
      // In a real scenario with many users, we might want to cache trivia
      const q = await generateTrivia();
      setQuestion(q);
    } catch (e) {
      console.error(e);
      showToast("Could not load trivia question", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (question && idx === question.correctAnswer) {
      setScore(s => s + 10);
      showToast("Correct! +10 Points", "success");
    } else {
      showToast("Incorrect answer", "error");
    }
  };

  if (!question && !loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-cine-muted">Trivia currently unavailable.</p>
        <button onClick={loadQuestion} className="mt-4 text-cine-accent">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 animate-fade-in">
       <div className="bg-gradient-to-br from-purple-900/40 to-cine-card p-6 rounded-2xl border border-purple-500/20 shadow-lg">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center space-x-2">
               <Brain className="text-purple-400" />
               <h2 className="text-xl font-bold">Movie Trivia</h2>
             </div>
             <div className="flex items-center space-x-2 bg-black/30 px-3 py-1 rounded-full">
                <Award className="text-cine-gold" size={16} />
                <span className="text-cine-gold font-bold">{score} pts</span>
             </div>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="animate-spin text-purple-500" size={32} />
            </div>
          ) : (
            question && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium leading-relaxed">{question.question}</h3>
                <div className="space-y-2 mt-4">
                  {question.options.map((opt, idx) => {
                    let btnClass = "w-full p-4 rounded-xl text-left transition-all border border-white/5 bg-white/5 hover:bg-white/10";
                    
                    if (selectedOption !== null) {
                      if (idx === question.correctAnswer) {
                        btnClass = "w-full p-4 rounded-xl text-left bg-green-500/20 border-green-500 text-green-400";
                      } else if (idx === selectedOption) {
                        btnClass = "w-full p-4 rounded-xl text-left bg-red-500/20 border-red-500 text-red-400";
                      } else {
                        btnClass = "w-full p-4 rounded-xl text-left opacity-50";
                      }
                    }

                    return (
                      <button 
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedOption !== null}
                        className={btnClass}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (
                  <div className="mt-4 animate-slide-up">
                    <p className="text-sm text-gray-300 bg-black/20 p-3 rounded-lg">{question.explanation}</p>
                    <button 
                      onClick={loadQuestion} 
                      className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors"
                    >
                      Next Question
                    </button>
                  </div>
                )}
              </div>
            )
          )}
       </div>

       {!isPremium && (
         <div className="mt-6 p-4 bg-cine-gold/10 border border-cine-gold/20 rounded-xl flex justify-between items-center">
            <div>
              <h4 className="text-cine-gold font-bold text-sm">Unlock Premium Quizzes</h4>
              <p className="text-xs text-gray-400">Get 2x points and exclusive categories</p>
            </div>
            <button onClick={onUnlock} className="bg-cine-gold text-black px-4 py-2 rounded-lg text-xs font-bold">Upgrade</button>
         </div>
       )}
    </div>
  );
};

export default QuizCard;