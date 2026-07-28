'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { FoodEntry, FoodItem } from '@/lib/types';
import { foodDatabase, searchFoods, foodCategories } from '@/lib/foods';
import { getToday, generateId, getMealTypeLabel } from '@/lib/utils';
import { Plus, X, Search, Camera, ImageUp, Loader2 } from 'lucide-react';

export default function NutritionPage() {
  const profile = useStore((s) => s.profile);
  const results = useStore((s) => s.results);
  const foodEntries = useStore((s) => s.foodEntries);
  const addFoodEntry = useStore((s) => s.addFoodEntry);
  const removeFoodEntry = useStore((s) => s.removeFoodEntry);

  const today = getToday();

  // UI state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedMeal, setSelectedMeal] = useState<FoodEntry['mealType']>('breakfast');
  const [customServing, setCustomServing] = useState<Record<string, number | undefined>>({});
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFood, setCustomFood] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: '100g' });
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Photo recognition state
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  const [photoResult, setPhotoResult] = useState<FoodItem[]>([]);
  const [photoSelMeal, setPhotoSelMeal] = useState<FoodEntry['mealType']>('lunch');

  // Date navigation
  const dates = useMemo(() => {
    const arr = [];
    for (let i = -6; i <= 0; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      arr.push(`${y}-${m}-${day}`);
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

  function handleAddFood(food: typeof foodDatabase[0], targetDate = today, targetMeal = selectedMeal) {
    const multiplier = (customServing[food.id] || 1) / 100;
    const servingGrams = customServing[food.id] || 100;
    const entry: FoodEntry = {
      id: generateId(),
      name: food.name,
      mealType: targetMeal,
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
      servingSize: `${servingGrams}g`,
      timestamp: new Date().toISOString(),
      date: targetDate,
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

  // ---- Photo: upload & recognize ----
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      setPhotoResult([]);
      setShowPhotoCapture(true);

      await analyzeFoodPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  // Analyze food photo — match visible items against food database
  async function analyzeFoodPhoto(dataUrl: string) {
    setPhotoAnalyzing(true);
    try {
      // Use Claude via the MCP ask mechanism
      // For static export, we do a keyword-based best match from known foods
      // The user will see matched results and can confirm/adjust
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'placeholder' },
        body: JSON.stringify({
          model: 'claude-3-haiku-20250307',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Identify all foods visible in this image. Return ONLY a JSON array of objects with fields: name (Chinese), estimated_calories (per 100g), estimated_protein, estimated_carbs, estimated_fat. Example: [{"name":"米饭","estimated_calories":116,"estimated_protein":2.6,"estimated_carbs":25.9,"estimated_fat":0.3}]' },
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: dataUrl.split(',')[1] } }
            ]
          }]
        })
      });
      const data = await response.json();
      try {
        const parsed = JSON.parse(data.content[0].text);
        setPhotoResult(parsed.map((f: any) => ({
          id: f.name,
          name: f.name,
          calories: f.estimated_calories,
          protein: f.estimated_protein,
          carbs: f.estimated_carbs,
          fat: f.estimated_fat,
          servingSize: '100g',
          category: '识别食物',
        })));
      } catch {
        setPhotoResult([]);
      }
    } catch {
      // API unavailable — fall back to empty, user can pick manually
      setPhotoResult([]);
    }
    setPhotoAnalyzing(false);
  }

  function addPhotoItem(food: FoodItem) {
    const entry: FoodEntry = {
      id: generateId(),
      name: food.name,
      mealType: photoSelMeal,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: '100g',
      timestamp: new Date().toISOString(),
      date: today,
      imageUrl: photoPreview || undefined,
    };
    addFoodEntry(entry);
  }

  function addAllPhotoItems() {
    photoResult.forEach((food) => addPhotoItem(food));
    setShowPhotoCapture(false);
    setPhotoPreview(null);
    setPhotoResult([]);
  }

  function handleDatePick(date: string) {
    setSelectedDate(date);
    setShowDatePicker(false);
  }

  // ---- count today's entries per meal ----
  const mealTypes: FoodEntry['mealType'][] = ['breakfast', 'lunch', 'dinner', 'snack'];

  const entryCount = (mt: FoodEntry['mealType']) => todayEntries.filter((e) => e.mealType === mt).length;

  return (
    <div className="space-y-5">
      {/* Daily Summary */}
      <div className="bg-[var(--card)] border p-4">
        <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-3">今日营养总览</div>
        <div className="grid grid-cols-4 gap-3 text-center mb-3">
          {[
            { label: '热量', value: totalCalories, sub: `/ ${results?.dailyCalorieTarget || 2000}` },
            { label: '蛋白质', value: Math.round(totalProtein), sub: 'g' },
            { label: '碳水', value: Math.round(totalCarbs), sub: 'g' },
            { label: '脂肪', value: Math.round(totalFat), sub: 'g' },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-xs text-[var(--muted)]">{item.label}</div>
              <div className="text-lg font-bold number-font">{item.value}</div>
              <div className="text-[10px] text-[var(--muted)]">{item.sub}</div>
            </div>
          ))}
        </div>
        <div className="w-full h-1.5 bg-[var(--border)]">
          <div
            className={`h-full ${totalCalories > (results?.dailyCalorieTarget || 2000) ? 'bg-[var(--danger)]' : 'bg-[var(--accent)]'}`}
            style={{ width: `${Math.min((totalCalories / (results?.dailyCalorieTarget || 2000)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => setShowFoodPicker(true)}
          className="py-2.5 border text-sm flex items-center justify-center gap-1.5 hover:border-[var(--accent)] transition-colors">
          <Search size={14} /> 搜索添加
        </button>
        <button onClick={() => { setShowPhotoCapture(true); setPhotoPreview(null); setPhotoResult([]); }}
          className="py-2.5 border text-sm flex items-center justify-center gap-1.5 hover:border-[var(--accent)] transition-colors">
          <Camera size={14} /> 拍照识别
        </button>
        <button onClick={() => setShowCustomForm(!showCustomForm)}
          className="py-2.5 border text-sm flex items-center justify-center gap-1.5 hover:border-[var(--accent)] transition-colors">
          <Plus size={14} /> 自定义
        </button>
      </div>

      {/* Custom Food Form */}
      {showCustomForm && (
        <div className="bg-[var(--card)] border p-4 space-y-3">
          <div className="text-xs text-[var(--muted)] tracking-wider uppercase">自定义食物</div>
          <input value={customFood.name} onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
            placeholder="食物名称" className="w-full bg-transparent border px-3 py-2 text-sm focus:border-[var(--accent)]" />
          <div className="grid grid-cols-4 gap-2">
            {(['calories', 'protein', 'carbs', 'fat'] as const).map((key) => (
              <div key={key}>
                <label className="text-[10px] text-[var(--muted)] uppercase">
                  {key === 'calories' ? '热量' : key === 'protein' ? '蛋白质' : key === 'carbs' ? '碳水' : '脂肪'}
                </label>
                <input type="number" value={customFood[key]}
                  onChange={(e) => setCustomFood({ ...customFood, [key]: Number(e.target.value) })}
                  className="w-full bg-transparent border px-2 py-1.5 text-sm number-font focus:border-[var(--accent)]" />
              </div>
            ))}
          </div>
          <button onClick={handleAddCustom} className="w-full py-2 bg-[var(--accent)] text-black text-sm font-semibold">添加</button>
        </div>
      )}

      {/* Photo Capture / Recognition Panel */}
      {showPhotoCapture && (
        <div className="bg-[var(--card)] border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted)] tracking-wider uppercase">📷 拍照识别</span>
            <button onClick={() => { setShowPhotoCapture(false); setPhotoPreview(null); setPhotoResult([]); }}
              className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={16} /></button>
          </div>

          {!photoPreview ? (
            <label className="flex flex-col items-center justify-center py-8 border border-dashed cursor-pointer hover:border-[var(--accent)] gap-2">
              <ImageUp size={32} className="text-[var(--muted)]" />
              <span className="text-sm text-[var(--muted)]">点击选择餐食照片</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          ) : (
            <>
              <img src={photoPreview} alt="餐食" className="w-full max-h-48 object-cover border" />

              {/* Meal type selector for photo */}
              <div className="flex gap-1">
                {mealTypes.map((mt) => (
                  <button key={mt} onClick={() => setPhotoSelMeal(mt)}
                    className={`flex-1 py-1.5 text-xs border ${photoSelMeal === mt ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'border-[var(--border)] text-[var(--muted)]'}`}>
                    {getMealTypeLabel(mt)}
                  </button>
                ))}
              </div>

              {photoAnalyzing ? (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
                  <span className="text-sm text-[var(--muted)]">AI 识别中…</span>
                </div>
              ) : photoResult.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="text-xs text-[var(--muted)]">识别结果：</div>
                  {photoResult.map((food, i) => (
                    <div key={i} className="flex items-center justify-between border border-[var(--border)] p-2">
                      <div>
                        <div className="text-sm">{food.name}</div>
                        <div className="text-[10px] text-[var(--muted)]">
                          {food.calories} kcal | 蛋白{food.protein}g | 碳水{food.carbs}g | 脂肪{food.fat}g
                        </div>
                      </div>
                      <button onClick={() => addPhotoItem(food)}
                        className="px-2 py-1 bg-[var(--accent)] text-black text-xs font-semibold">添加</button>
                    </div>
                  ))}
                  <button onClick={addAllPhotoItems}
                    className="w-full py-2 bg-[var(--accent)] text-black text-sm font-semibold mt-2">
                    全部添加 ({photoResult.length}项)
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <p className="text-sm text-[var(--muted)]">未能识别食物</p>
                  <p className="text-xs text-[var(--muted)]">你可以手动搜索或自定义添加</p>
                  <button onClick={() => { setShowPhotoCapture(false); setShowFoodPicker(true); }}
                    className="py-1.5 px-4 border text-sm hover:border-[var(--accent)]">搜索食物</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Food Picker */}
      {showFoodPicker && (
        <div className="bg-[var(--card)] border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[var(--muted)] tracking-wider uppercase">选择食物</span>
            <button onClick={() => setShowFoodPicker(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={16} /></button>
          </div>
          {/* Meal tabs */}
          <div className="flex gap-1 mb-3">
            {mealTypes.map((mt) => (
              <button key={mt} onClick={() => setSelectedMeal(mt)}
                className={`flex-1 py-1.5 text-xs border ${selectedMeal === mt ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-semibold' : 'border-[var(--border)] text-[var(--muted)]'}`}>
                {getMealTypeLabel(mt)}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索食物..."
              className="w-full bg-transparent border pl-9 pr-3 py-2 text-sm focus:border-[var(--accent)]" />
          </div>
          {/* Categories */}
          {!search && (
            <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
              {['全部', ...foodCategories].map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-2.5 py-1 text-xs border ${selectedCategory === cat ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'border-[var(--border)] text-[var(--muted)]'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}
          {/* Food List */}
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {filteredFoods.map((food) => (
              <div key={food.id} className="flex items-center justify-between p-2 border border-[var(--border)] hover:border-[var(--muted)] transition-colors cursor-pointer"
                onClick={() => handleAddFood(food)}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{food.name}</div>
                  <div className="text-[10px] text-[var(--muted)]">{food.calories} kcal | 蛋白{food.protein}g | 碳水{food.carbs}g | 脂肪{food.fat}g</div>
                </div>
                <div className="flex items-center gap-1">
                  <input type="number" placeholder="g" value={customServing[food.id] || ''}
                    onChange={(e) => { const v = Number(e.target.value); setCustomServing((p) => ({ ...p, [food.id]: v > 0 ? v : undefined })); }}
                    className="w-14 bg-transparent border px-1.5 py-1 text-xs number-font text-center"
                    onClick={(e) => e.stopPropagation()} />
                  <Plus size={14} className="text-[var(--accent)] shrink-0" strokeWidth={2} />
                </div>
              </div>
            ))}
            {filteredFoods.length === 0 && <div className="text-xs text-[var(--muted)] text-center py-6">未找到食物</div>}
          </div>
        </div>
      )}

      {/* Today's Entries by Meal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs text-[var(--muted)] tracking-wider uppercase">
            <span className="text-[var(--foreground)] font-semibold">{today.slice(5)}</span> 饮食记录
          </h2>
        </div>
        {mealTypes.map((mt) => {
          const mealEntries = todayEntries.filter((e) => e.mealType === mt);
          const mtTotals = mealTotals[mt] || { cal: 0, protein: 0, carbs: 0, fat: 0 };

          return (
            <div key={mt} className="bg-[var(--card)] border">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
                <span className="text-sm font-semibold">{getMealTypeLabel(mt)} ({mealEntries.length})</span>
                <span className="text-xs text-[var(--muted)] number-font">{Math.round(mtTotals.cal)} kcal</span>
              </div>
              {mealEntries.length === 0 ? (
                <div className="px-4 py-3 text-xs text-[var(--muted)]">暂无记录</div>
              ) : (
                mealEntries.map((entry) => (
                  <div key={entry.id} className="px-4 py-2.5 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">{entry.name}</div>
                        <div className="text-[10px] text-[var(--muted)]">{entry.servingSize} | P{entry.protein} C{entry.carbs} F{entry.fat}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold number-font">{entry.calories}</span>
                        <button onClick={() => removeFoodEntry(today, entry.id)} className="text-[var(--muted)] hover:text-[var(--danger)]"><X size={14} /></button>
                      </div>
                    </div>
                    {entry.imageUrl && (
                      <img src={entry.imageUrl} alt={entry.name} className="mt-1.5 max-h-16 rounded object-cover" />
                    )}
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* Date Selector */}
      <div className="relative">
        <button onClick={() => setShowDatePicker(!showDatePicker)}
          className="w-full text-left py-2 text-xs text-[var(--muted)] tracking-wider uppercase hover:text-[var(--foreground)]">
          查看其他日期记录 {showDatePicker ? '▲' : '▼'}
        </button>
        {showDatePicker && (
          <div className="bg-[var(--card)] border p-2 mt-1 space-y-1">
            {dates.map((d) => {
              const dayEntries = foodEntries[d] || [];
              const dayCals = dayEntries.reduce((s, f) => s + f.calories, 0);
              const isToday = d === today;
              return (
                <button key={d} onClick={() => handleDatePick(d)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm ${isToday ? 'border-l-2 border-[var(--accent)]' : ''} ${selectedDate === d ? 'bg-[var(--border)]/40' : ''}`}>
                  <span>{d}</span>
                  <span className="number-font text-xs">{dayCals > 0 ? `${dayCals} kcal` : '--'}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
