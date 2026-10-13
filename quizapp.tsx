import React, { useState, useEffect } from 'react';

// --- ЦВЕТОВАЯ ПАЛИТРА ИЗ ВАШЕГО ДИЗАЙН-КОДА ---
const COLORS = {
  bg: '#D5CCC5', // Бежевый фон
  primary: '#0F3592', // Глубокий синий
  accent: '#AD4716', // Оранжево-терракотовый
  white: '#FFFFFF',
};

// --- ИКОНКИ ---
const StarIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

// --- ПРЕДЗАПОЛНЕННЫЕ ДАННЫЕ (ИЗ ВАШЕГО СЦЕНАРИЯ) ---
const INITIAL_DATA = [
  {
    title: 'Раунд 1: Разминка для всех',
    format: '6 вопросов с вариантами ответов',
    questions: [
      { id: 11, text: 'В каком древнем городе ученики Иисуса Христа впервые стали называться «Христианами»?', options: ['А) Иерусалим', 'Б) Антиохия', 'В) Дамаск', 'Г) Рим'], answer: 'Б) Антиохия (Деяния 11:26)', time: 45, points: 1 },
      { id: 12, text: 'Сколько книг входит в общепринятый протестантский канон Библии?', options: ['А) 39', 'Б) 27', 'В) 66', 'Г) 70'], answer: 'В) 66', time: 45, points: 1 },
      { id: 13, text: 'В каком году и в каком городе зародилась первая община нашего движения (МЦХ)?', options: ['А) 1979, Нью-Йорк', 'Б) 1985, Бостон', 'В) 1979, Бостон', 'Г) 1991, Москва'], answer: 'В) 1979, Бостон', time: 45, points: 1 },
      { id: 14, text: 'Какое единственное животное в Библии (помимо змея в Эдеме) заговорило человеческим голосом?', options: ['А) Лев Даниила', 'Б) Ослица Валаама', 'В) Ворон Илии', 'Г) Большая рыба Ионы'], answer: 'Б) Ослица Валаама (Числа 22:28)', time: 45, points: 1 },
      { id: 15, text: 'Какое выражение переводится как «Господь наш пришёл» или «Гряди, Господь!»?', options: ['А) Осанна', 'Б) Маранафа', 'В) Селах', 'Г) Елеон'], answer: 'Б) Маранафа', time: 45, points: 1 },
      { id: 16, text: 'На какой горе пророк Илия вступил в состязание с 450 пророками Ваала?', options: ['А) Синай', 'Б) Кармил', 'В) Фавор', 'Г) Елеон'], answer: 'Б) Кармил (3 Царств 18)', time: 45, points: 1 },
    ]
  },
  {
    title: 'Раунд 2: Логика, Визуал и Наша Церковь',
    format: '5 вопросов без вариантов ответа',
    questions: [
      { id: 21, text: 'Фото-сопоставление «Тогда и сейчас». Сопоставьте архивное фото с нынешней фотографией служителя.', options: [], answer: 'Зависит от ваших фото (например: 1-В, 2-А, 3-Г, 4-Б)', time: 120, points: 2 },
      { id: 22, text: 'Логика артефактов: Золотой сосуд с манной, Расцветший жезл, Каменные плиты. Внутри чего это хранилось?', options: [], answer: 'Ковчег Завета', time: 120, points: 2 },
      { id: 23, text: 'Медиа-вопрос: На каком именно виде транспорта главный герой ролика уехал из города?', options: [], answer: 'Ответ по вашему видео (поезд/автобус/машина)', time: 120, points: 2 },
      { id: 24, text: 'Четыре херувима имеют лики: человек, лев, вол. Назовите четвёртое существо?', options: [], answer: 'Орёл (Иез. 1:10 / Откр. 4:7)', time: 120, points: 2 },
      { id: 25, text: 'В каком году прошла самая первая официальная воскресная служба церкви Христа в нашем городе?', options: [], answer: 'Точный год основания вашей церкви', time: 120, points: 2 },
    ]
  },
  {
    title: 'Раунд 3: Раунд доверия',
    format: '5 сложных вопросов. Галочка «Уверены!» дает +2 балла или -1 балл.',
    questions: [
      { id: 31, text: 'Уравнение: (Дни поста Иисуса / Заповеди) + (Ученики круга * Спасшиеся в Ковчеге). Итоговое число?', options: [], answer: '(40 / 10) + (12 * 8) = 4 + 96 = 100', time: 120, points: 1 },
      { id: 32, text: 'Каким ремеслом зарабатывал на жизнь апостол Павел?', options: [], answer: 'Изготовление палаток (Палаточник)', time: 120, points: 1 },
      { id: 33, text: 'Сколько церквей сейчас официально входит в семью МЦХ в Евразии? (Погрешность ±3)', options: [], answer: '68 (принимается 65–71)', time: 120, points: 1 },
      { id: 34, text: 'В какой реке крестился Иисус?', options: [], answer: 'Иордан', time: 120, points: 1 },
      { id: 35, text: 'В какой библейской книге впервые встречается выражение «Яблоко от яблони далеко не падает»?', options: [], answer: 'Ни в какой. Это народная поговорка.', time: 120, points: 1 },
    ]
  }
];

// --- ГЛАВНЫЙ КОМПОНЕНТ ---
export default function QuizApp() {
  const [view, setView] = useState('MENU'); // MENU, GAME, ADMIN, LEADERBOARD, DESIGNS
  const [quizData, setQuizData] = useState(INITIAL_DATA);
  const [teams, setTeams] = useState([
    { id: 1, name: 'Команда 1', score: 0 },
    { id: 2, name: 'Команда 2', score: 0 }
  ]);

  // Глобальные стили для body (чтобы фон применялся ко всей странице)
  useEffect(() => {
    document.body.style.backgroundColor = COLORS.bg;
    document.body.style.color = COLORS.primary;
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-[#AD4716] selection:text-white">
      {/* Декоративные звезды на фоне */}
      <div className="absolute top-10 left-10 text-[#0F3592] opacity-10 w-24 h-24"><StarIcon /></div>
      <div className="absolute bottom-10 right-10 text-[#AD4716] opacity-10 w-48 h-48"><StarIcon /></div>
      
      {/* Шапка (Навигация) - скрыта при печати */}
      <nav className="relative z-10 flex justify-between items-center p-4 md:px-8 border-b border-[#0F3592]/20 print:hidden">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('MENU')}>
          <StarIcon className="w-8 h-8 text-[#AD4716]" />
          <span className="font-bold text-xl uppercase tracking-wider">День Рождения АЦХ</span>
        </div>
        <div className="flex gap-2 md:gap-4 overflow-x-auto">
          {['MENU', 'GAME', 'LEADERBOARD', 'ADMIN', 'DESIGNS'].map(v => (
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
function MenuScreen({ setView }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <StarIcon className="w-24 h-24 text-[#AD4716] mb-6 animate-pulse" />
      <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter" style={{ color: COLORS.primary }}>
        Квиз, Плиз!
      </h1>
      <p className="text-xl md:text-2xl mb-12 opacity-80 max-w-2xl">
        Праздничный квиз ко Дню Рождения Церкви. Нам есть чему радоваться и куда идти дальше!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <button onClick={() => setView('GAME')} className="group relative p-6 bg-[#0F3592] text-[#D5CCC5] rounded-3xl hover:-translate-y-1 transition-transform shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[#AD4716] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative z-10 text-2xl font-bold flex items-center justify-center gap-3">Начать игру</span>
        </button>
        <button onClick={() => setView('LEADERBOARD')} className="p-6 bg-white/50 backdrop-blur border-2 border-[#0F3592] text-[#0F3592] rounded-3xl hover:bg-[#0F3592] hover:text-[#D5CCC5] transition-colors shadow-lg text-2xl font-bold">
          Таблица баллов
        </button>
        <button onClick={() => setView('DESIGNS')} className="p-6 bg-[#AD4716] text-[#D5CCC5] rounded-3xl hover:-translate-y-1 transition-transform shadow-xl text-2xl font-bold">
          Печать Бланков
        </button>
        <button onClick={() => setView('ADMIN')} className="p-6 bg-white/30 backdrop-blur border border-[#0F3592]/30 text-[#0F3592] rounded-3xl hover:bg-white/60 transition-colors shadow-md text-2xl font-bold">
          Редактор вопросов
        </button>
      </div>
    </div>
  );
}

// --- ЭКРАН ИГРЫ ---
function GameScreen({ quizData }) {
  const [rIndex, setRIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState('INTRO'); // INTRO, QUESTION, ROUND_ANSWERS, FINISHED
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentRound = quizData[rIndex];
  const currentQuestion = currentRound?.questions[qIndex];

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Звук или автопереключение можно добавить здесь
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
        <div className="text-center animate-fade-in-up">
          <StarIcon className="w-16 h-16 mx-auto mb-4 text-[#AD4716]" />
          <h2 className="text-5xl font-black mb-4 uppercase">{currentRound.title}</h2>
          <p className="text-2xl mb-8 opacity-80">{currentRound.format}</p>
          <button 
            onClick={startQuestion}
            className="px-8 py-4 bg-[#0F3592] text-white rounded-full text-2xl font-bold hover:scale-105 transition-transform shadow-xl"
          >
            Начать раунд
          </button>
        </div>
      )}

      {/* 2. ВОПРОС */}
      {phase === 'QUESTION' && (
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Прогресс бар таймера */}
          <div className="h-4 bg-gray-200 w-full">
            <div 
              className="h-full bg-[#AD4716] transition-all duration-1000 linear"
              style={{ width: `${(timeLeft / currentQuestion.time) * 100}%` }}
            ></div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold text-[#AD4716]">Вопрос {qIndex + 1} / {currentRound.questions.length}</span>
              <span className={`text-4xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#0F3592]'}`}>
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">{currentQuestion.text}</h3>
            
            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.options.map((opt, i) => (
                  <div key={i} className="p-4 border-2 border-[#0F3592]/20 rounded-xl text-xl font-medium">
                    {opt}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200">
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-6 py-2 bg-gray-200 rounded-full font-bold hover:bg-gray-300"
              >
                {isTimerRunning ? 'Пауза' : 'Продолжить'}
              </button>
              <button 
                onClick={nextQuestion}
                className="px-8 py-3 bg-[#AD4716] text-white rounded-full font-bold text-xl hover:shadow-lg"
              >
                {qIndex < currentRound.questions.length - 1 ? 'Следующий вопрос' : 'Завершить раунд'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ОТВЕТЫ РАУНДА */}
      {phase === 'ROUND_ANSWERS' && (
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-fade-in">
          <h2 className="text-4xl font-black mb-8 text-[#0F3592] uppercase text-center">Правильные ответы</h2>
          <div className="space-y-6 mb-8 max-h-[50vh] overflow-y-auto pr-4">
            {currentRound.questions.map((q, i) => (
              <div key={i} className="p-4 bg-[#D5CCC5]/30 rounded-xl border-l-4 border-[#AD4716]">
                <p className="font-bold text-sm text-gray-500 mb-1">Вопрос {i + 1}</p>
                <p className="text-lg mb-2">{q.text}</p>
                <p className="text-xl font-black text-[#0F3592]">Ответ: {q.answer}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
             <button 
                onClick={nextRound}
                className="px-8 py-4 bg-[#0F3592] text-white rounded-full font-bold text-2xl hover:scale-105 transition-transform"
              >
                {rIndex < quizData.length - 1 ? 'К следующему раунду' : 'Завершить игру'}
              </button>
          </div>
        </div>
      )}

      {/* 4. КОНЕЦ ИГРЫ */}
      {phase === 'FINISHED' && (
        <div className="text-center animate-fade-in-up">
          <StarIcon className="w-24 h-24 mx-auto mb-6 text-[#AD4716]" />
          <h2 className="text-5xl font-black mb-4 uppercase">Игра завершена!</h2>
          <p className="text-2xl mb-8">Соберите финальные бланки и подсчитайте баллы.</p>
        </div>
      )}
    </div>
  );
}

// --- ЭКРАН ТАБЛИЦЫ ЛИДЕРОВ ---
function LeaderboardScreen({ teams, setTeams }) {
  const [newTeamName, setNewTeamName] = useState('');

  const addTeam = () => {
    if (newTeamName.trim()) {
      setTeams([...teams, { id: Date.now(), name: newTeamName, score: 0 }]);
      setNewTeamName('');
    }
  };

  const updateScore = (id, delta) => {
    setTeams(teams.map(t => t.id === id ? { ...t, score: t.score + delta } : t));
  };

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-4xl font-black uppercase tracking-wider">Таблица баллов</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
        {/* Добавление команды */}
        <div className="flex gap-2 mb-8">
          <input 
            type="text" 
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            placeholder="Название новой команды"
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-[#0F3592] outline-none text-lg"
          />
          <button onClick={addTeam} className="px-6 py-3 bg-[#AD4716] text-white font-bold rounded-xl hover:bg-orange-800 transition">
            Добавить
          </button>
        </div>

        {/* Список команд */}
        <div className="space-y-4">
          {sortedTeams.map((team, index) => (
            <div key={team.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-[#D5CCC5]/20 border border-[#0F3592]/10 rounded-2xl gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-[#0F3592]'}`}>
                  {index + 1}
                </div>
                <span className="text-2xl font-bold">{team.name}</span>
              </div>
              
              <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-full md:w-auto justify-between">
                <button onClick={() => updateScore(team.id, -1)} className="w-10 h-10 bg-red-100 text-red-600 rounded-full font-black text-xl hover:bg-red-200">-</button>
                <span className="text-3xl font-black w-16 text-center">{team.score}</span>
                <button onClick={() => updateScore(team.id, 1)} className="w-10 h-10 bg-green-100 text-green-600 rounded-full font-black text-xl hover:bg-green-200">+</button>
              </div>
            </div>
          ))}
          {teams.length === 0 && <p className="text-center text-gray-500 py-8">Команды пока не добавлены</p>}
        </div>
      </div>
    </div>
  );
}

// --- ЭКРАН РЕДАКТОРА ---
function AdminScreen({ quizData, setQuizData }) {
  const handleQuestionChange = (rIndex, qIndex, field, value) => {
    const newData = [...quizData];
    newData[rIndex].questions[qIndex][field] = value;
    setQuizData(newData);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-4xl font-black uppercase">Редактор Квиза</h2>
      </div>

      <div className="space-y-8">
        {quizData.map((round, rIndex) => (
          <div key={rIndex} className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-[#AD4716] border-b pb-2">{round.title}</h3>
            
            <div className="space-y-6 mt-4">
              {round.questions.map((q, qIndex) => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex gap-4 mb-3 items-start">
                    <span className="font-bold text-gray-400 mt-2">#{qIndex + 1}</span>
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Вопрос</label>
                        <textarea 
                          value={q.text} 
                          onChange={(e) => handleQuestionChange(rIndex, qIndex, 'text', e.target.value)}
                          className="w-full p-2 border rounded focus:border-[#0F3592] outline-none"
                          rows="2"
                        />
                      </div>
                      
                      {q.options && q.options.length > 0 && (
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Варианты (через запятую)</label>
                          <input 
                            value={q.options.join(', ')} 
                            onChange={(e) => handleQuestionChange(rIndex, qIndex, 'options', e.target.value.split(',').map(s => s.trim()))}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      )}

                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Правильный ответ (для ведущего)</label>
                          <input 
                            value={q.answer} 
                            onChange={(e) => handleQuestionChange(rIndex, qIndex, 'answer', e.target.value)}
                            className="w-full p-2 border rounded text-[#0F3592] font-medium"
                          />
                        </div>
                        <div className="w-24">
                          <label className="text-xs font-bold text-gray-500 uppercase">Время (сек)</label>
                          <input 
                            type="number"
                            value={q.time} 
                            onChange={(e) => handleQuestionChange(rIndex, qIndex, 'time', parseInt(e.target.value))}
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
  const printPage = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h2 className="text-4xl font-black uppercase">Бланки ответов</h2>
        <button onClick={printPage} className="px-6 py-3 bg-[#AD4716] text-white font-bold rounded-xl flex gap-2 items-center hover:bg-orange-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Распечатать бланки
        </button>
      </div>

      <div className="space-y-12">
        {/* БЛАНК РАУНДА 1 */}
        <div className="bg-[#D5CCC5] border border-[#0F3592]/20 shadow-xl mx-auto relative overflow-hidden print-break print:shadow-none print:border-none" style={{ width: '210mm', height: '148.5mm', padding: '15mm' }}>
          {/* Декор */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F3592] rounded-bl-full opacity-10"></div>
          <StarIcon className="absolute top-6 right-6 w-12 h-12 text-[#AD4716]" />
          
          <h1 className="text-[#0F3592] font-black text-2xl uppercase tracking-widest mb-1">День Рождения АЦХ</h1>
          <h2 className="text-[#AD4716] font-bold text-4xl mb-6">Раунд 1: Разминка</h2>
          
          <div className="flex items-end gap-2 border-b-2 border-[#0F3592] pb-1 w-2/3 mb-8">
            <span className="font-bold text-[#0F3592] text-xl">Команда:</span>
            <div className="flex-1 h-6"></div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div key={num} className="flex items-center gap-4">
                <div className="text-2xl font-black text-[#0F3592] w-6">{num}.</div>
                <div className="flex gap-3">
                  {['А', 'Б', 'В', 'Г'].map(letter => (
                    <div key={letter} className="w-10 h-10 border-2 border-[#0F3592] rounded-lg flex items-center justify-center font-bold text-[#0F3592] text-xl">
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
            <h1 className="text-[#0F3592] font-black text-2xl uppercase tracking-widest mb-1">День Рождения АЦХ</h1>
            <h2 className="text-[#AD4716] font-bold text-4xl">Раунд 2: Логика</h2>
          </div>
          
          <div className="flex items-end gap-2 border-b-2 border-[#0F3592] pb-1 w-full mb-8">
            <span className="font-bold text-[#0F3592] text-xl">Команда:</span>
            <div className="flex-1 h-6"></div>
          </div>

          <div className="space-y-6">
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
          
          <h1 className="text-[#0F3592] font-black text-2xl uppercase tracking-widest mb-1 text-center">День Рождения АЦХ</h1>
          <h2 className="text-[#AD4716] font-bold text-4xl mb-6 text-center">Раунд 3: Доверие</h2>
          
          <div className="flex items-end gap-2 border-b-2 border-[#0F3592] pb-1 w-3/4 mx-auto mb-8">
            <span className="font-bold text-[#0F3592] text-xl">Команда:</span>
            <div className="flex-1 h-6"></div>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Заголовок колонок */}
            <div className="flex justify-end pr-2 opacity-60">
              <span className="font-bold text-sm uppercase text-[#0F3592]">Уверены! (+2/-1)</span>
            </div>
            
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} className="flex items-end gap-4">
                <div className="text-2xl font-black text-[#0F3592] w-6 pb-1">{num}.</div>
                <div className="flex-1 border-b-2 border-[#0F3592]/50 h-10"></div>
                {/* Галочка уверенности */}
                <div className="w-12 h-12 border-4 border-[#AD4716] rounded-xl flex-shrink-0"></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}