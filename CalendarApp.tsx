import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Dumbbell, Check } from 'lucide-react';

interface DayData {
  marked?: boolean;
  alcohol?: boolean;
  water?: boolean;
  steps?: boolean;
  nutrition?: boolean;
}

interface MarkedDates {
  [key: string]: DayData;
}

const CalendarApp: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    const loadMarkedDates = async () => {
      try {
        const stored = localStorage.getItem('markedDates');
        if (stored) {
          setMarkedDates(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMarkedDates();
  }, []);

  // Сохранение данных в localStorage при изменении
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('markedDates', JSON.stringify(markedDates));
    }
  }, [markedDates, isLoading]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Понедельник = 0
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isWorkoutDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    // Понедельник = 1, Среда = 3, Пятница = 5
    return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
  };

  const toggleMarked = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateKey = formatDateKey(year, month, day);

    setMarkedDates(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        marked: !prev[dateKey]?.marked
      }
    }));
  };

  const toggleCheckbox = (day: number, field: 'alcohol' | 'water' | 'steps' | 'nutrition') => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateKey = formatDateKey(year, month, day);

    setMarkedDates(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [field]: !prev[dateKey]?.[field]
      }
    }));
  };

  const getDayData = (day: number): DayData => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateKey = formatDateKey(year, month, day);
    return markedDates[dateKey] || {};
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDay(null);
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const getCompletionCount = (day: number) => {
    const data = getDayData(day);
    let count = 0;
    if (data.alcohol) count++;
    if (data.water) count++;
    if (data.steps) count++;
    if (data.nutrition) count++;
    return count;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-purple-600 text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Заголовок */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft className="w-6 h-6 text-purple-600" />
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              aria-label="Следующий месяц"
            >
              <ChevronRight className="w-6 h-6 text-purple-600" />
            </button>
          </div>
        </div>

        {/* Календарь */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          {/* Дни недели */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Дни месяца */}
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {days.map(day => {
              const dayData = getDayData(day);
              const marked = dayData.marked;
              const today = isToday(day);
              const workout = isWorkoutDay(day);
              const completionCount = getCompletionCount(day);
              const isSelected = selectedDay === day;
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`
                    aspect-square rounded-2xl flex flex-col items-center justify-center
                    font-medium text-lg transition-all relative overflow-hidden
                    ${today ? 'ring-2 ring-purple-400' : ''}
                    ${isSelected ? 'ring-2 ring-purple-600 scale-105' : ''}
                    ${marked 
                      ? 'bg-red-50 text-red-400 hover:bg-red-100' 
                      : 'bg-purple-50 text-gray-800 hover:bg-purple-100'
                    }
                    active:scale-95
                  `}
                >
                  {/* Иконка тренировки */}
                  {workout && (
                    <Dumbbell 
                      className="absolute top-1 right-1 w-3 h-3 text-orange-500" 
                      strokeWidth={2.5}
                    />
                  )}

                  <span className={marked ? 'opacity-50' : ''}>{day}</span>
                  
                  {/* Индикатор прогресса */}
                  {completionCount > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            i < completionCount ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {marked && (
                    <X className="absolute w-8 h-8 text-red-500 pointer-events-none" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Легенда */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-lg bg-purple-50 ring-2 ring-purple-400"></div>
                <span>Сегодня</span>
              </div>
              <div className="flex items-center gap-1">
                <Dumbbell className="w-4 h-4 text-orange-500" />
                <span>Тренировка</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-green-500" />
                  ))}
                </div>
                <span>Прогресс</span>
              </div>
            </div>
          </div>
        </div>

        {/* Панель деталей дня */}
        {selectedDay !== null && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mt-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedDay} {monthNames[currentDate.getMonth()]}
                {isWorkoutDay(selectedDay) && (
                  <span className="ml-2 text-orange-500">
                    <Dumbbell className="inline w-5 h-5" />
                  </span>
                )}
              </h2>
              <button
                onClick={() => toggleMarked(selectedDay)}
                className={`p-2 rounded-full transition-colors ${
                  getDayData(selectedDay).marked
                    ? 'bg-red-100 hover:bg-red-200'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <X className={`w-5 h-5 ${
                  getDayData(selectedDay).marked ? 'text-red-500' : 'text-gray-400'
                }`} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Алкоголь */}
              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    toggleCheckbox(selectedDay, 'alcohol');
                  }}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    getDayData(selectedDay).alcohol
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-300'
                  }`}
                >
                  {getDayData(selectedDay).alcohol && (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  )}
                </div>
                <span className="text-lg text-gray-800 flex-1">🚫 Без алкоголя</span>
              </label>

              {/* Вода */}
              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    toggleCheckbox(selectedDay, 'water');
                  }}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    getDayData(selectedDay).water
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-300'
                  }`}
                >
                  {getDayData(selectedDay).water && (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  )}
                </div>
                <span className="text-lg text-gray-800 flex-1">💧 Вода (2л)</span>
              </label>

              {/* Шаги */}
              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    toggleCheckbox(selectedDay, 'steps');
                  }}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    getDayData(selectedDay).steps
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-300'
                  }`}
                >
                  {getDayData(selectedDay).steps && (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  )}
                </div>
                <span className="text-lg text-gray-800 flex-1">👟 Шаги (10k)</span>
              </label>

              {/* Питание */}
              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    toggleCheckbox(selectedDay, 'nutrition');
                  }}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    getDayData(selectedDay).nutrition
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-300'
                  }`}
                >
                  {getDayData(selectedDay).nutrition && (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  )}
                </div>
                <span className="text-lg text-gray-800 flex-1">🥗 Правильное питание</span>
              </label>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Выполнено: {getCompletionCount(selectedDay)} из 4
              </p>
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mt-4">
          <div className="text-center">
            <p className="text-gray-600 mb-1">Отмечено дней в этом месяце</p>
            <p className="text-4xl font-bold text-purple-600">
              {days.filter(day => getDayData(day).marked).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarApp;
