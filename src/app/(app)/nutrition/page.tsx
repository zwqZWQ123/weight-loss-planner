'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { FoodEntry } from '@/lib/types';
import { foodDatabase, searchFoods, foodCategories } from '@/lib/foods';
import { getToday, generateId, getMealTypeLabel } from '@/lib/utils';
import { Plus, X, Apple, Search, ChevronRight } from 'lucide-react';

export default function NutritionPage() {
  const profile = useStore((s) => s.profile);
  const results = useStore((s) => s.results);
  const foodEntries = useStore((s) => s.foodEntries);
  const addFoodEntry = useStore((s) => s.addFoodEntry);
  const removeFoodEntry = useStore((s) => s.removeFoodEntry);

  const today = getToday();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedMeal, setSelectedMeal] = useState<FoodEntry['mealType']>('breakfast');
  const [customServing, setCustomServing] = useState<Record<string, number | undefined>>({});
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFood, setCustomFood] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: '100g' });
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);

  // Date navigation
  const dates = useMemo(() => {
    const arr = [];
    for (let i = -6; i <= 0; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      arr.push(d.toISOString().split('T')[0]);
    }
    return arr;
  }, []);

  const entries = foodEntries[selectedDate] || [];
  const todayEntries = foodEntries[today] || [];

  const totalCalories = todayEntries.reduce((s, f) => s + f.calories, 0);
  const totalProtein = todayEntries.reduce((s, f) => s + f.protein, 0);
  const totalCarbs = todayEntries.reduce((s, f) => s + f.carbs, 0);
  const totalFat = todayEntries.reduce((s, f) => s + f.fat, 0);

  const mealTotals = useMemo(() => {
    const mt: Record<string, { cal: number; protein: number; carbs: number; fat: number }> = {};
    for (const e of todayEntries) {
      if (!mt[e.mealType]) mt[e.mealType] = { cal: 0, protein: 0, carbs: 0, fat: 0 };
      mt[e.mealType].cal += e.calories;
      mt[e.mealType].protein += e.protein;
      mt[e.mealType].carbs += e.carbs;
      mt[e.mealType].fat += e.fat;
    }
    return mt;
  }, [todayEntries]);

  const filteredFoods = useMemo(() => {
    if (search) return searchFoods(search);
    if (selectedCategory !== '全部') return foodDatabase.filter((f) => f.category === selectedCategory);
    return foodDatabase;
  }, [search, selectedCategory]);

  function handleAddFood(food: typeof foodDatabase[0]) {
    const multiplier = (customServing[food.id] || 1) / 100;
    const servingGrams = customServing[food.id] || 100;
    const entry: FoodEntry = {
      id: generateId(),
      name: food.name,
      mealType: selectedMeal,
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
      servingSize: `${servingGrams}g`,
      timestamp: new Date().toISOString(),
      date: today,
    };
    addFoodEntry(entry);
    setShowFoodPicker(false);
    setSearch('');
    setCustomServing({});
  }

  function handleAddCustom() {
    if (!customFood.name) return;
    const entry: FoodEntry = {
      id: generateId(),
      name: customFood.name,
      mealType: selectedMeal,
      calories: customFood.calories,
      protein: customFood.protein,
      carbs: customFood.carbs,
      fat: customFood.fat,
      servingSize: customFood.servingSize,
      timestamp: new Date().toISOString(),
      date: today,
    };
    addFoodEntry(entry);
    setShowCustomForm(false);
    setCustomFood({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: '100g' });
  }

  const mealTypes: FoodEntry['mealType'][] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-5">
      {/* Daily Summary */}
      <div className="bg-[var(--card)] border p-4">
        <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-3">今日营养总览</div>
        <div className="grid grid-cols-4 gap-3 text-center mb-3">
          <div>
            <div className="text-xs text-[var(--muted)]">热量</div>
            <div className="text-lg font-bold number-font">{totalCalories}</div>
            <div className="text-[10px] text-[var(--muted)]">/ {results?.dailyCalorieTarget || 2000}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted)]">蛋白质</div>
            <div className="text-lg font-bold number-font">{Math.round(totalProtein)}</div>
            <div className="text-[10px] text-[var(--muted)]">g</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted)]">碳水</div>
            <div className="text-lg font-bold number-font">{Math.round(totalCarbs)}</div>
            <div className="text-[10px] text-[var(--muted)]">g</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted)]">脂肪</div>
            <div className="text-lg font-bold number-font">{Math.round(totalFat)}</div>
            <div className="text-[10px] text-[var(--muted)]">g</div>
          </div>
        </div>
        <div className="w-full h-1.5 bg-[var(--border)]">
          <div
            className={`h-full ${totalCalories > (results?.dailyCalorieTarget || 2000) ? 'bg-[var(--danger)]' : 'bg-[var(--accent)]'}`}
            style={{ width: `${Math.min((totalCalories / (results?.dailyCalorieTarget || 2000)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Add Food Button */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowFoodPicker(true)}
          className="flex-1 py-2.5 border text-sm flex items-center justify-center gap-2 hover:border-[var(--accent)] transition-colors"
        >
          <Plus size={16} /> 添加食物
        </button>
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="py-2.5 px-4 border text-sm hover:border-[var(--accent)] transition-colors"
        >
          自定义
        </button>
      </div>

      {/* Custom Food Form */}
      {showCustomForm && (
        <div className="bg-[var(--card)] border p-4 space-y-3">
          <div className="text-xs text-[var(--muted)] tracking-wider uppercase">自定义食物</div>
          <input
            value={customFood.name}
            onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
            placeholder="食物名称"
            className="w-full bg-transparent border px-3 py-2 text-sm focus:border-[var(--accent)]"
          />
          <div className="grid grid-cols-4 gap-2">
            {(['calories', 'protein', 'carbs', 'fat'] as const).map((key) => (
              <div key={key}>
                <label className="text-[10px] text-[var(--muted)] uppercase">{key === 'calories' ? '热量' : key === 'protein' ? '蛋白质' : key === 'carbs' ? '碳水' : '脂肪'}</label>
                <input
                  type="number"
                  value={customFood[key]}
                  onChange={(e) => setCustomFood({ ...customFood, [key]: Number(e.target.value) })}
                  className="w-full bg-transparent border px-2 py-1.5 text-sm number-font focus:border-[var(--accent)]"
                />
              </div>
            ))}
          </div>
          <button onClick={handleAddCustom} className="w-full py-2 bg-[var(--accent)] text-black text-sm font-semibold">
            添加
          </button>
        </div>
      )}

      {/* Food Picker Modal */}
      {showFoodPicker && (
        <div className="bg-[var(--card)] border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[var(--muted)] tracking-wider uppercase">选择食物</span>
            <button onClick={() => setShowFoodPicker(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
              <X size={16} />
            </button>
          </div>

          {/* Meal Type Tabs */}
          <div className="flex gap-1 mb-3">
            {mealTypes.map((mt) => (
              <button
                key={mt}
                onClick={() => setSelectedMeal(mt)}
                className={`flex-1 py-1.5 text-xs border ${
                  selectedMeal === mt
                    ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-semibold'
                    : 'border-[var(--border)] text-[var(--muted)]'
                }`}
              >
                {getMealTypeLabel(mt)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索食物..."
              className="w-full bg-transparent border pl-9 pr-3 py-2 text-sm focus:border-[var(--accent)]"
            />
          </div>

          {/* Categories */}
          {!search && (
            <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
              {['全部', ...foodCategories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-2.5 py-1 text-xs border ${
                    selectedCategory === cat
                      ? 'bg-[var(--accent)] text-black border-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--muted)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Food List */}
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between p-2 border border-[var(--border)] hover:border-[var(--muted)] transition-colors cursor-pointer"
                onClick={() => handleAddFood(food)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{food.name}</div>
                  <div className="text-[10px] text-[var(--muted)]">
                    {food.calories} kcal | 蛋白{food.protein}g | 碳水{food.carbs}g | 脂肪{food.fat}g | {food.servingSize}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="g"
                    value={customServing[food.id] || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCustomServing((prev) => ({
                        ...prev,
                        [food.id]: val > 0 ? val : undefined,
                      }));
                    }}
                    className="w-14 bg-transparent border px-1.5 py-1 text-xs number-font text-center"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Plus size={14} className="text-[var(--accent)] shrink-0" strokeWidth={2} />
                </div>
              </div>
            ))}
            {filteredFoods.length === 0 && (
              <div className="text-xs text-[var(--muted)] text-center py-6">未找到食物，试试自定义添加</div>
            )}
          </div>
        </div>
      )}

      {/* Today's Entries by Meal */}
      <div className="space-y-3">
        <h2 className="text-xs text-[var(--muted)] tracking-wider uppercase">今日记录</h2>
        {mealTypes.map((mt) => {
          const mealEntries = todayEntries.filter((e) => e.mealType === mt);
          const mtTotals = mealTotals[mt] || { cal: 0, protein: 0, carbs: 0, fat: 0 };

          return (
            <div key={mt} className="bg-[var(--card)] border">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
                <span className="text-sm font-semibold">{getMealTypeLabel(mt)}</span>
                <span className="text-xs text-[var(--muted)] number-font">{Math.round(mtTotals.cal)} kcal</span>
              </div>
              {mealEntries.length === 0 ? (
                <div className="px-4 py-3 text-xs text-[var(--muted)]">暂无记录</div>
              ) : (
                mealEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] last:border-0">
                    <div>
                      <div className="text-sm">{entry.name}</div>
                      <div className="text-[10px] text-[var(--muted)]">{entry.servingSize}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-[var(--muted)] number-font">
                        P{entry.protein} C{entry.carbs} F{entry.fat}
                      </div>
                      <div className="text-sm font-bold number-font">{entry.calories}</div>
                      <button onClick={() => removeFoodEntry(today, entry.id)} className="text-[var(--muted)] hover:text-[var(--danger)]">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* History - last 7 days */}
      <div>
        <h2 className="text-xs text-[var(--muted)] tracking-wider uppercase mb-3">近 7 天记录</h2>
        <div className="space-y-1">
          {dates.map((d) => {
            const dayEntries = foodEntries[d] || [];
            const dayCals = dayEntries.reduce((s, f) => s + f.calories, 0);
            const isToday = d === today;
            return (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`w-full flex items-center justify-between p-3 border text-left text-sm ${
                  isToday ? 'border-[var(--accent)]' : 'border-[var(--border)] bg-[var(--card)]'
                } ${selectedDate === d ? 'ring-1 ring-[var(--accent)]' : ''}`}
              >
                <span>{d}</span>
                <span className="number-font">{dayCals > 0 ? `${dayCals} kcal` : '--'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
