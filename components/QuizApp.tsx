'use client';

import React, { useState, useEffect } from 'react';

// --- ТИПЫ ---
interface Question {
  id: number;
  text: string;       // Russian
  textEn: string;     // English
  options: string[];
  optionsEn: string[];
  answer: string;
  answerEn: string;
  time: number;
  points: number;
  image?: string;     // URL to image (optional)
}

interface Round {
  title: string;
  titleEn: string;
  format: string;
  formatEn: string;
  questions: Question[];
}

interface Team {
  id: number;
  name: string;
  score: number;
}

// --- ПРЕДЗАПОЛНЕННЫЕ ДАННЫЕ ---
const INITIAL_DATA: Round[] = [
  {
    title: 'Раунд 1: Разминка для всех',
    titleEn: 'Round 1: Warm-Up for Everyone',
    format: '6 вопросов с вариантами ответов',
    formatEn: '6 multiple-choice questions',
    questions: [
      {
        id: 11,
        text: 'В каком древнем городе ученики Иисуса Христа впервые стали называться «Христианами»?',
        textEn: 'In which ancient city were the disciples of Jesus Christ first called "Christians"?',
        options: ['А) Иерусалим', 'Б) Антиохия', 'В) Дамаск', 'Г) Рим'],
        optionsEn: ['A) Jerusalem', 'B) Antioch', 'C) Damascus', 'D) Rome'],
        answer: 'Б) Антиохия (Деяния 11:26)',
        answerEn: 'B) Antioch (Acts 11:26)',
        time: 45, points: 1,
      },
      {
        id: 12,
        text: 'Сколько книг входит в общепринятый протестантский канон Библии?',
        textEn: 'How many books are in the accepted Protestant canon of the Bible?',
        options: ['А) 39', 'Б) 27', 'В) 66', 'Г) 70'],
        optionsEn: ['A) 39', 'B) 27', 'C) 66', 'D) 70'],
        answer: 'В) 66',
        answerEn: 'C) 66',
        time: 45, points: 1,
      },
      {
        id: 13,
        text: 'В каком году и в каком городе зародилась первая община нашего движения (МЦХ)?',
        textEn: 'In what year and city was the first community of our movement (ICC) founded?',
        options: ['А) 1979, Нью-Йорк', 'Б) 1985, Бостон', 'В) 1979, Бостон', 'Г) 1991, Москва'],
        optionsEn: ['A) 1979, New York', 'B) 1985, Boston', 'C) 1979, Boston', 'D) 1991, Moscow'],
        answer: 'В) 1979, Бостон',
        answerEn: 'C) 1979, Boston',
        time: 45, points: 1,
      },
      {
        id: 14,
        text: 'Какое единственное животное в Библии (помимо змея в Эдеме) заговорило человеческим голосом?',
        textEn: 'What is the only animal in the Bible (besides the serpent in Eden) that spoke with a human voice?',
        options: ['А) Лев Даниила', 'Б) Ослица Валаама', 'В) Ворон Илии', 'Г) Большая рыба Ионы'],
        optionsEn: ["A) Daniel's Lion", "B) Balaam's Donkey", "C) Elijah's Raven", "D) Jonah's Great Fish"],
        answer: 'Б) Ослица Валаама (Числа 22:28)',
        answerEn: "B) Balaam's Donkey (Numbers 22:28)",
        time: 45, points: 1,
      },
      {
        id: 15,
        text: 'Какое выражение переводится как «Господь наш пришёл» или «Гряди, Господь!»?',
        textEn: 'Which expression translates as "Our Lord has come" or "Come, Lord!"?',
        options: ['А) Осанна', 'Б) Маранафа', 'В) Селах', 'Г) Елеон'],
        optionsEn: ['A) Hosanna', 'B) Maranatha', 'C) Selah', 'D) Olivet'],
        answer: 'Б) Маранафа',
        answerEn: 'B) Maranatha',
        time: 45, points: 1,
      },
      {
        id: 16,
        text: 'На какой горе пророк Илия вступил в состязание с 450 пророками Ваала?',
        textEn: 'On which mountain did the prophet Elijah contest 450 prophets of Baal?',
        options: ['А) Синай', 'Б) Кармил', 'В) Фавор', 'Г) Елеон'],
        optionsEn: ['A) Sinai', 'B) Carmel', 'C) Tabor', 'D) Olivet'],
        answer: 'Б) Кармил (3 Царств 18)',
        answerEn: 'B) Carmel (1 Kings 18)',
        time: 45, points: 1,
      },
    ],
  },
  {
    title: 'Раунд 2: Логика, Визуал и Наша Церковь',
    titleEn: 'Round 2: Logic, Visuals & Our Church',
    format: '5 вопросов без вариантов ответа',
    formatEn: '5 open-ended questions',
    questions: [
      {
        id: 21,
        text: 'Фото-сопоставление «Тогда и сейчас». Сопоставьте архивное фото с нынешней фотографией служителя.',
        textEn: '"Then & Now" photo match. Match the archive photo with the current photo of the minister.',
        options: [], optionsEn: [],
        answer: 'Зависит от ваших фото (например: 1-В, 2-А, 3-Г, 4-Б)',
        answerEn: 'Depends on your photos (e.g. 1-C, 2-A, 3-D, 4-B)',
        time: 120, points: 2,
      },
      {
        id: 22,
        text: 'Логика артефактов: Золотой сосуд с манной, Расцветший жезл, Каменные плиты. Внутри чего это хранилось?',
        textEn: 'Artifact logic: Golden jar of manna, Aaron\'s budding staff, Stone tablets. Inside what were these stored?',
        options: [], optionsEn: [],
        answer: 'Ковчег Завета',
        answerEn: 'The Ark of the Covenant',
        time: 120, points: 2,
      },
      {
        id: 23,
        text: 'Медиа-вопрос: На каком именно виде транспорта главный герой ролика уехал из города?',
        textEn: 'Media question: What exact mode of transport did the main character use to leave the city in the video?',
        options: [], optionsEn: [],
        answer: 'Ответ по вашему видео (поезд/автобус/машина)',
        answerEn: 'Answer based on your video (train/bus/car)',
        time: 120, points: 2,
      },
      {
        id: 24,
        text: 'Четыре херувима имеют лики: человек, лев, вол. Назовите четвёртое существо?',
        textEn: 'Four cherubim have the faces of: a man, a lion, an ox. Name the fourth creature.',
        options: [], optionsEn: [],
        answer: 'Орёл (Иез. 1:10 / Откр. 4:7)',
        answerEn: 'Eagle (Ezek. 1:10 / Rev. 4:7)',
        time: 120, points: 2,
      },
      {
        id: 25,
        text: 'В каком году прошла самая первая официальная воскресная служба церкви Христа в нашем городе?',
        textEn: 'In what year was the very first official Sunday service of the Church of Christ held in our city?',
        options: [], optionsEn: [],
        answer: 'Точный год основания вашей церкви',
        answerEn: 'The exact founding year of your church',
        time: 120, points: 2,
      },
    ],
  },
  {
    title: 'Раунд 3: Раунд доверия',
    titleEn: 'Round 3: The Trust Round',
    format: '5 сложных вопросов. Галочка «Уверены!» дает +2 балла или -1 балл.',
    formatEn: '5 tough questions. Checking "We\'re sure!" gives +2 or -1 point.',
    questions: [
      {
        id: 31,
        text: 'Уравнение: (Дни поста Иисуса / Заповеди) + (Ученики круга * Спасшиеся в Ковчеге). Итоговое число?',
        textEn: 'Equation: (Days of Jesus\' fast ÷ Commandments) + (Disciples × Saved in the Ark). What is the result?',
        options: [], optionsEn: [],
        answer: '(40 / 10) + (12 * 8) = 4 + 96 = 100',
        answerEn: '(40 ÷ 10) + (12 × 8) = 4 + 96 = 100',
        time: 120, points: 1,
      },
      {
        id: 32,
        text: 'Каким ремеслом зарабатывал на жизнь апостол Павел?',
        textEn: 'What trade did the Apostle Paul use to earn a living?',
        options: [], optionsEn: [],
        answer: 'Изготовление палаток (Палаточник)',
        answerEn: 'Tent-making (Acts 18:3)',
        time: 120, points: 1,
      },
      {
        id: 33,
        text: 'Сколько церквей сейчас официально входит в семью МЦХ в Евразии? (Погрешность ±3)',
        textEn: 'How many churches are officially part of the ICC family in Eurasia? (Margin ±3)',
        options: [], optionsEn: [],
        answer: '68 (принимается 65–71)',
        answerEn: '68 (65–71 accepted)',
        time: 120, points: 1,
      },
      {
        id: 34,
        text: 'В какой реке крестился Иисус?',
        textEn: 'In which river was Jesus baptized?',
        options: [], optionsEn: [],
        answer: 'Иордан',
        answerEn: 'The Jordan River',
        time: 120, points: 1,
      },
      {
        id: 35,
        text: 'В какой библейской книге впервые встречается выражение «Яблоко от яблони далеко не падает»?',
        textEn: 'In which biblical book does the phrase "The apple doesn\'t fall far from the tree" first appear?',
        options: [], optionsEn: [],
        answer: 'Ни в какой. Это народная поговорка.',
        answerEn: 'None. It\'s a folk proverb, not from the Bible.',
        time: 120, points: 1,
      },
    ],
  },
];

// --- ИКОНКИ ---
const StarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

// --- ДЕКОРАТИВНЫЕ ЗВЁЗДЫ НА ФОНЕ ---
const BackgroundStars = () => (
  <>
    <div className="fixed top-8 left-8 text-[#0F3592] opacity-10 w-20 h-20 pointer-events-none"><StarIcon /></div>
    <div className="fixed top-1/4 left-4 text-[#AD4716] opacity-8 w-10 h-10 pointer-events-none"><StarIcon /></div>
    <div className="fixed top-1/2 left-16 text-[#0F3592] opacity-6 w-6 h-6 pointer-events-none"><StarIcon /></div>
    <div className="fixed bottom-20 left-10 text-[#AD4716] opacity-10 w-14 h-14 pointer-events-none"><StarIcon /></div>

    <div className="fixed top-6 right-12 text-[#AD4716] opacity-8 w-12 h-12 pointer-events-none"><StarIcon /></div>
    <div className="fixed top-1/3 right-6 text-[#0F3592] opacity-10 w-8 h-8 pointer-events-none"><StarIcon /></div>
    <div className="fixed bottom-10 right-10 text-[#AD4716] opacity-10 w-44 h-44 pointer-events-none"><StarIcon /></div>
    <div className="fixed bottom-1/3 right-20 text-[#0F3592] opacity-6 w-6 h-6 pointer-events-none"><StarIcon /></div>

    <div className="fixed top-1/2 left-1/3 text-[#AD4716] opacity-5 w-32 h-32 pointer-events-none"><StarIcon /></div>
    <div className="fixed top-3/4 left-1/2 text-[#0F3592] opacity-5 w-16 h-16 pointer-events-none"><StarIcon /></div>
  </>
);

// --- ГЛАВНЫЙ КОМПОНЕНТ ---
export default function QuizApp() {
  const [view, setView] = useState<'MENU' | 'GAME' | 'ADMIN' | 'LEADERBOARD' | 'DESIGNS'>('MENU');
  const [quizData, setQuizData] = useState<Round[]>(INITIAL_DATA);
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Команда 1', score: 0 },
    { id: 2, name: 'Команда 2', score: 0 },
  ]);

  return (
    <div
      className="min-h-screen relative overflow-hidden selection:bg-[#AD4716] selection:text-white"
      style={{
        background: 'linear-gradient(135deg, #e8e4f0 0%, #D5CCC5 40%, #f0ddd2 100%)',
      }}
    >
      <BackgroundStars />

      {/* Шапка */}
      <nav className="relative z-10 flex justify-between items-center p-4 md:px-8 border-b border-[#0F3592]/20 print:hidden backdrop-blur-sm bg-white/20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('MENU')}>
          <StarIcon className="w-8 h-8 text-[#AD4716]" />
          <span className="font-bold text-xl uppercase tracking-wider text-[#0F3592]">КВИЗ АЦХ</span>
        </div>
        <div className="flex gap-2 md:gap-4 overflow-x-auto">
          {(['MENU', 'GAME', 'LEADERBOARD', 'ADMIN', 'DESIGNS'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                view === v ? 'bg-[#0F3592] text-[#D5CCC5]' : 'hover:bg-[#0F3592]/10'
              }`}
            >
              {v === 'MENU' && 'Главная'}
              {v === 'GAME' && 'Играть'}
              {v === 'LEADERBOARD' && 'Таблица'}
              {v === 'ADMIN' && 'Редактор'}
              {v === 'DESIGNS' && 'Бланки'}
            </button>
          ))}
        </div>
      </nav>

      {/* Основной контент */}
      <main className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto">
        {view === 'MENU' && <MenuScreen setView={setView} />}
        {view === 'GAME' && <GameScreen quizData={quizData} />}
        {view === 'ADMIN' && <AdminScreen quizData={quizData} setQuizData={setQuizData} />}
        {view === 'LEADERBOARD' && <LeaderboardScreen teams={teams} setTeams={setTeams} />}
        {view === 'DESIGNS' && <DesignsScreen />}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print-break { page-break-after: always; }
        }
      `}} />
    </div>
  );
}

// --- ЭКРАН МЕНЮ ---
function MenuScreen({ setView }: { setView: (v: 'MENU' | 'GAME' | 'ADMIN' | 'LEADERBOARD' | 'DESIGNS') => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="relative mb-6">
        <StarIcon className="w-24 h-24 text-[#AD4716] animate-pulse" />
      </div>
      <h1 className="text-4xl md:text-6xl font-black mb-2 uppercase tracking-tighter text-[#0F3592]">
        КВИЗ АЦХ
      </h1>
      <p className="text-sm md:text-base mb-2 opacity-60 uppercase tracking-widest text-[#0F3592] font-semibold">
        ACC QUIZ
      </p>
      <p className="text-lg md:text-xl mb-3 opacity-80 max-w-2xl text-[#0F3592]">
        Праздничный квиз ко Дню Рождения Церкви.
      </p>
      <p className="text-base md:text-lg mb-12 opacity-60 max-w-2xl text-[#0F3592] italic">
        A birthday quiz for our Church. Let&apos;s celebrate together!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <button onClick={() => setView('GAME')} className="group relative p-6 bg-[#0F3592] text-[#D5CCC5] rounded-3xl hover:-translate-y-1 transition-transform shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[#AD4716] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative z-10 text-2xl font-bold">Начать игру / Start</span>
        </button>
        <button onClick={() => setView('LEADERBOARD')} className="p-6 bg-white/50 backdrop-blur border-2 border-[#0F3592] text-[#0F3592] rounded-3xl hover:bg-[#0F3592] hover:text-[#D5CCC5] transition-colors shadow-lg text-2xl font-bold">
          Таблица / Scores
        </button>
        <button onClick={() => setView('DESIGNS')} className="p-6 bg-[#AD4716] text-[#D5CCC5] rounded-3xl hover:-translate-y-1 transition-transform shadow-xl text-2xl font-bold">
          Бланки / Answer Sheets
        </button>
        <button onClick={() => setView('ADMIN')} className="p-6 bg-white/30 backdrop-blur border border-[#0F3592]/30 text-[#0F3592] rounded-3xl hover:bg-white/60 transition-colors shadow-md text-2xl font-bold">
          Редактор / Editor
        </button>
      </div>
    </div>
  );
}

// --- ЭКРАН ИГРЫ ---
function GameScreen({ quizData }: { quizData: Round[] }) {
  const [rIndex, setRIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState<'INTRO' | 'QUESTION' | 'ROUND_ANSWERS' | 'FINISHED'>('INTRO');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentRound = quizData[rIndex];
  const currentQuestion = currentRound?.questions[qIndex];

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const startQuestion = () => {
    setPhase('QUESTION');
    setTimeLeft(currentQuestion.time);
    setIsTimerRunning(true);
  };

  const nextQuestion = () => {
    if (qIndex < currentRound.questions.length - 1) {
      setQIndex(prev => prev + 1);
      setPhase('QUESTION');
      setTimeLeft(currentRound.questions[qIndex + 1].time);
      setIsTimerRunning(true);
    } else {
      setPhase('ROUND_ANSWERS');
      setIsTimerRunning(false);
    }
  };

  const nextRound = () => {
    if (rIndex < quizData.length - 1) {
      setRIndex(prev => prev + 1);
      setQIndex(0);
      setPhase('INTRO');
    } else {
      setPhase('FINISHED');
    }
  };

  if (!currentRound) return <div>Загрузка...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh]">

      {/* 1. ЗАСТАВКА РАУНДА */}
      {phase === 'INTRO' && (
        <div className="text-center max-w-2xl">
          <StarIcon className="w-16 h-16 mx-auto mb-4 text-[#AD4716]" />
          <h2 className="text-4xl font-black mb-1 uppercase text-[#0F3592]">{currentRound.title}</h2>
          <h3 className="text-2xl font-bold mb-4 text-[#AD4716] italic">{currentRound.titleEn}</h3>
          <p className="text-xl mb-1 opacity-80">{currentRound.format}</p>
          <p className="text-base mb-8 opacity-60 italic">{currentRound.formatEn}</p>
          <button
            onClick={startQuestion}
            className="px-8 py-4 bg-[#0F3592] text-white rounded-full text-2xl font-bold hover:scale-105 transition-transform shadow-xl"
          >
            Начать раунд / Start Round
          </button>
        </div>
      )}

      {/* 2. ВОПРОС */}
      {phase === 'QUESTION' && (
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Прогресс бар */}
          <div className="h-3 bg-gray-200 w-full">
            <div
              className="h-full bg-[#AD4716] transition-all duration-1000 linear"
              style={{ width: `${(timeLeft / currentQuestion.time) * 100}%` }}
            />
          </div>

          <div className="p-6 md:p-10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-[#AD4716]">
                Вопрос {qIndex + 1} / {currentRound.questions.length}
              </span>
              <span className={`text-4xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#0F3592]'}`}>
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </span>
            </div>

            {/* Текст вопроса — билингвальный */}
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold leading-tight text-[#0F3592] mb-2">
                {currentQuestion.text}
              </h3>
              <p className="text-lg md:text-xl text-[#AD4716] italic leading-snug">
                {currentQuestion.textEn}
              </p>
            </div>

            {/* Изображение (если есть) */}
            {currentQuestion.image && (
              <div className="mb-6 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentQuestion.image}
                  alt="Question image"
                  className="max-h-64 rounded-2xl shadow-lg object-contain border-4 border-[#0F3592]/10"
                />
              </div>
            )}

            {/* Варианты ответов */}
            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {currentQuestion.options.map((opt, i) => (
                  <div key={i} className="p-4 border-2 border-[#0F3592]/20 rounded-xl bg-gray-50">
                    <div className="text-lg font-semibold text-[#0F3592]">{opt}</div>
                    {currentQuestion.optionsEn[i] && (
                      <div className="text-sm text-[#AD4716] italic">{currentQuestion.optionsEn[i]}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-5 border-t border-gray-200">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-6 py-2 bg-gray-200 rounded-full font-bold hover:bg-gray-300"
              >
                {isTimerRunning ? 'Пауза / Pause' : 'Продолжить / Resume'}
              </button>
              <button
                onClick={nextQuestion}
                className="px-8 py-3 bg-[#AD4716] text-white rounded-full font-bold text-lg hover:shadow-lg"
              >
                {qIndex < currentRound.questions.length - 1 ? 'Следующий / Next →' : 'Завершить / Finish ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ОТВЕТЫ РАУНДА */}
      {phase === 'ROUND_ANSWERS' && (
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl font-black mb-2 text-[#0F3592] uppercase text-center">Правильные ответы</h2>
          <p className="text-center text-[#AD4716] italic mb-8">Correct Answers</p>
          <div className="space-y-5 mb-8 max-h-[50vh] overflow-y-auto pr-2">
            {currentRound.questions.map((q, i) => (
              <div key={i} className="p-4 bg-[#D5CCC5]/30 rounded-xl border-l-4 border-[#AD4716]">
                <p className="font-bold text-sm text-gray-400 mb-1">Вопрос {i + 1}</p>
                <p className="text-base mb-1 text-[#0F3592]">{q.text}</p>
                <p className="text-sm mb-2 text-[#AD4716] italic">{q.textEn}</p>
                <p className="font-black text-[#0F3592]">✓ {q.answer}</p>
                <p className="text-sm text-[#AD4716] italic">✓ {q.answerEn}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={nextRound}
              className="px-8 py-4 bg-[#0F3592] text-white rounded-full font-bold text-2xl hover:scale-105 transition-transform"
            >
              {rIndex < quizData.length - 1 ? 'К следующему раунду / Next Round →' : 'Завершить игру / End Game ✓'}
            </button>
          </div>
        </div>
      )}

      {/* 4. КОНЕЦ ИГРЫ */}
      {phase === 'FINISHED' && (
        <div className="text-center">
          <StarIcon className="w-24 h-24 mx-auto mb-6 text-[#AD4716]" />
          <h2 className="text-5xl font-black mb-2 uppercase text-[#0F3592]">Игра завершена!</h2>
          <p className="text-2xl italic text-[#AD4716] mb-4">Game Over!</p>
          <p className="text-xl mb-8 opacity-70">Соберите финальные бланки и подсчитайте баллы.<br />
            <span className="italic text-base">Collect the answer sheets and count the scores.</span>
          </p>
        </div>
      )}
    </div>
  );
}

// --- ЭКРАН ТАБЛИЦЫ ЛИДЕРОВ ---
function LeaderboardScreen({ teams, setTeams }: { teams: Team[]; setTeams: (t: Team[]) => void }) {
  const [newTeamName, setNewTeamName] = useState('');

  const addTeam = () => {
    if (newTeamName.trim()) {
      setTeams([...teams, { id: Date.now(), name: newTeamName, score: 0 }]);
      setNewTeamName('');
    }
  };

  const updateScore = (id: number, delta: number) => {
    setTeams(teams.map(t => t.id === id ? { ...t, score: t.score + delta } : t));
  };

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-black uppercase tracking-wider mb-2 text-[#0F3592]">Таблица баллов</h2>
      <p className="text-[#AD4716] italic mb-8">Scoreboard</p>

      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTeam()}
            placeholder="Название команды / Team name"
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-[#0F3592] outline-none text-lg"
          />
          <button onClick={addTeam} className="px-6 py-3 bg-[#AD4716] text-white font-bold rounded-xl hover:bg-orange-800 transition">
            + Добавить
          </button>
        </div>

        <div className="space-y-4">
          {sortedTeams.map((team, index) => (
            <div key={team.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-[#D5CCC5]/20 border border-[#0F3592]/10 rounded-2xl gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-[#0F3592]'}`}>
                  {index + 1}
                </div>
                <span className="text-2xl font-bold text-[#0F3592]">{team.name}</span>
              </div>
              <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-full md:w-auto justify-between">
                <button onClick={() => updateScore(team.id, -1)} className="w-10 h-10 bg-red-100 text-red-600 rounded-full font-black text-xl hover:bg-red-200">-</button>
                <span className="text-3xl font-black w-16 text-center text-[#0F3592]">{team.score}</span>
                <button onClick={() => updateScore(team.id, 1)} className="w-10 h-10 bg-green-100 text-green-600 rounded-full font-black text-xl hover:bg-green-200">+</button>
              </div>
            </div>
          ))}
          {teams.length === 0 && <p className="text-center text-gray-500 py-8">Команды пока не добавлены / No teams yet</p>}
        </div>
      </div>
    </div>
  );
}

// --- ЭКРАН РЕДАКТОРА ---
function AdminScreen({ quizData, setQuizData }: { quizData: Round[]; setQuizData: (d: Round[]) => void }) {
  const handleQuestionChange = (
    rIdx: number,
    qIdx: number,
    field: keyof Question,
    value: string | string[] | number
  ) => {
    const newData = quizData.map((round, ri) => {
      if (ri !== rIdx) return round;
      return {
        ...round,
        questions: round.questions.map((q, qi) =>
          qi === qIdx ? { ...q, [field]: value } : q
        ),
      };
    });
    setQuizData(newData);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-4xl font-black uppercase mb-2 text-[#0F3592]">Редактор Квиза</h2>
      <p className="text-[#AD4716] italic mb-8">Quiz Editor</p>

      <div className="space-y-8">
        {quizData.map((round, rIdx) => (
          <div key={rIdx} className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-1 text-[#AD4716] border-b pb-2">{round.title}</h3>
            <p className="text-sm italic text-gray-400 mb-4">{round.titleEn}</p>

            <div className="space-y-6">
              {round.questions.map((q, qIdx) => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex gap-4 items-start">
                    <span className="font-bold text-gray-400 mt-2 min-w-[24px]">#{qIdx + 1}</span>
                    <div className="flex-1 space-y-3">

                      {/* Вопрос RU / EN */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Вопрос (RU)</label>
                          <textarea
                            value={q.text}
                            onChange={e => handleQuestionChange(rIdx, qIdx, 'text', e.target.value)}
                            className="w-full p-2 border rounded focus:border-[#0F3592] outline-none text-sm"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Question (EN)</label>
                          <textarea
                            value={q.textEn}
                            onChange={e => handleQuestionChange(rIdx, qIdx, 'textEn', e.target.value)}
                            className="w-full p-2 border rounded focus:border-[#AD4716] outline-none text-sm italic"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Варианты RU / EN */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Варианты RU (через запятую)</label>
                            <input
                              value={q.options.join(', ')}
                              onChange={e => handleQuestionChange(rIdx, qIdx, 'options', e.target.value.split(',').map(s => s.trim()))}
                              className="w-full p-2 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Options EN (comma-separated)</label>
                            <input
                              value={q.optionsEn.join(', ')}
                              onChange={e => handleQuestionChange(rIdx, qIdx, 'optionsEn', e.target.value.split(',').map(s => s.trim()))}
                              className="w-full p-2 border rounded text-sm italic"
                            />
                          </div>
                        </div>
                      )}

                      {/* Ответ RU / EN */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Ответ (RU)</label>
                          <input
                            value={q.answer}
                            onChange={e => handleQuestionChange(rIdx, qIdx, 'answer', e.target.value)}
                            className="w-full p-2 border rounded text-[#0F3592] font-medium text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Answer (EN)</label>
                          <input
                            value={q.answerEn}
                            onChange={e => handleQuestionChange(rIdx, qIdx, 'answerEn', e.target.value)}
                            className="w-full p-2 border rounded text-[#AD4716] font-medium text-sm italic"
                          />
                        </div>
                      </div>

                      {/* Изображение и время */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">🖼 URL изображения / Image URL (необязательно)</label>
                          <input
                            value={q.image || ''}
                            onChange={e => handleQuestionChange(rIdx, qIdx, 'image', e.target.value)}
                            placeholder="https://..."
                            className="w-full p-2 border rounded text-sm text-gray-600"
                          />
                          {q.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={q.image} alt="preview" className="mt-2 h-20 rounded-lg object-contain border" />
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Время (сек)</label>
                          <input
                            type="number"
                            value={q.time}
                            onChange={e => handleQuestionChange(rIdx, qIdx, 'time', parseInt(e.target.value))}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ЭКРАН БЛАНКОВ (ДЛЯ ПЕЧАТИ) ---
function DesignsScreen() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h2 className="text-4xl font-black uppercase text-[#0F3592]">Бланки ответов</h2>
          <p className="text-[#AD4716] italic">Answer Sheets</p>
        </div>
        <button onClick={() => window.print()} className="px-6 py-3 bg-[#AD4716] text-white font-bold rounded-xl flex gap-2 items-center hover:bg-orange-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Распечатать / Print
        </button>
      </div>

      <div className="space-y-12">
        {/* БЛАНК РАУНДА 1 */}
        <div className="bg-[#D5CCC5] border border-[#0F3592]/20 shadow-xl mx-auto relative overflow-hidden print-break print:shadow-none print:border-none" style={{ width: '210mm', height: '148.5mm', padding: '15mm' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F3592] rounded-bl-full opacity-10"></div>
          <StarIcon className="absolute top-6 right-6 w-12 h-12 text-[#AD4716]" />
          <h1 className="text-[#0F3592] font-black text-xl uppercase tracking-widest mb-0">КВИЗ АЦХ / ACC QUIZ</h1>
          <h2 className="text-[#AD4716] font-bold text-3xl mb-5">Раунд 1: Разминка / Warm-Up</h2>
          <div className="flex items-end gap-2 border-b-2 border-[#0F3592] pb-1 w-2/3 mb-7">
            <span className="font-bold text-[#0F3592] text-xl">Команда / Team:</span>
            <div className="flex-1 h-6"></div>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-5">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div key={num} className="flex items-center gap-4">
                <div className="text-2xl font-black text-[#0F3592] w-6">{num}.</div>
                <div className="flex gap-3">
                  {['А/A', 'Б/B', 'В/C', 'Г/D'].map(letter => (
                    <div key={letter} className="w-12 h-10 border-2 border-[#0F3592] rounded-lg flex items-center justify-center font-bold text-[#0F3592] text-sm">
                      {letter}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* БЛАНК РАУНДА 2 */}
        <div className="bg-[#D5CCC5] border border-[#0F3592]/20 shadow-xl mx-auto relative overflow-hidden print-break print:shadow-none print:border-none" style={{ width: '210mm', height: '148.5mm', padding: '15mm' }}>
          <StarIcon className="absolute top-6 left-6 w-12 h-12 text-[#0F3592]" />
          <div className="text-right mb-6">
            <h1 className="text-[#0F3592] font-black text-xl uppercase tracking-widest mb-0">КВИЗ АЦХ / ACC QUIZ</h1>
            <h2 className="text-[#AD4716] font-bold text-3xl">Раунд 2: Логика / Logic</h2>
          </div>
          <div className="flex items-end gap-2 border-b-2 border-[#0F3592] pb-1 w-full mb-7">
            <span className="font-bold text-[#0F3592] text-xl">Команда / Team:</span>
            <div className="flex-1 h-6"></div>
          </div>
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} className="flex items-end gap-4">
                <div className="text-2xl font-black text-[#0F3592] w-6 pb-1">{num}.</div>
                <div className="flex-1 border-b-2 border-[#0F3592]/50 h-10"></div>
              </div>
            ))}
          </div>
        </div>

        {/* БЛАНК РАУНДА 3 */}
        <div className="bg-[#D5CCC5] border border-[#0F3592]/20 shadow-xl mx-auto relative overflow-hidden print-break print:shadow-none print:border-none" style={{ width: '210mm', height: '148.5mm', padding: '15mm' }}>
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#AD4716] rounded-br-full opacity-10"></div>
          <StarIcon className="absolute bottom-6 right-6 w-24 h-24 text-[#0F3592] opacity-20" />
          <h1 className="text-[#0F3592] font-black text-xl uppercase tracking-widest mb-0 text-center">КВИЗ АЦХ / ACC QUIZ</h1>
          <h2 className="text-[#AD4716] font-bold text-3xl mb-5 text-center">Раунд 3: Доверие / Trust</h2>
          <div className="flex items-end gap-2 border-b-2 border-[#0F3592] pb-1 w-3/4 mx-auto mb-7">
            <span className="font-bold text-[#0F3592] text-xl">Команда / Team:</span>
            <div className="flex-1 h-6"></div>
          </div>
          <div className="space-y-5 max-w-2xl mx-auto">
            <div className="flex justify-end pr-2 opacity-60">
              <span className="font-bold text-sm uppercase text-[#0F3592]">Уверены! / Sure! (+2/−1)</span>
            </div>
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} className="flex items-end gap-4">
                <div className="text-2xl font-black text-[#0F3592] w-6 pb-1">{num}.</div>
                <div className="flex-1 border-b-2 border-[#0F3592]/50 h-10"></div>
                <div className="w-12 h-12 border-4 border-[#AD4716] rounded-xl flex-shrink-0"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
