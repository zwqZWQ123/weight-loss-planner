import { FoodItem } from './types';

export const foodDatabase: FoodItem[] = [
  // 主食
  { id: 'rice', name: '米饭', calories: 116, protein: 2.6, carbs: 25.9, fat: 0.3, servingSize: '100g', category: '主食' },
  { id: 'noodles', name: '面条(煮)', calories: 110, protein: 3.4, carbs: 22.8, fat: 0.5, servingSize: '100g', category: '主食' },
  { id: 'steamed-bun', name: '馒头', calories: 223, protein: 7.0, carbs: 44.2, fat: 1.1, servingSize: '100g', category: '主食' },
  { id: 'corn', name: '玉米', calories: 112, protein: 4.0, carbs: 22.8, fat: 1.2, servingSize: '100g', category: '主食' },
  { id: 'sweet-potato', name: '红薯', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, servingSize: '100g', category: '主食' },
  { id: 'oatmeal', name: '燕麦片', calories: 377, protein: 13.5, carbs: 66.3, fat: 6.7, servingSize: '100g', category: '主食' },
  { id: 'whole-wheat-bread', name: '全麦面包', calories: 246, protein: 8.5, carbs: 41.3, fat: 3.4, servingSize: '100g', category: '主食' },
  { id: 'brown-rice', name: '糙米', calories: 111, protein: 2.6, carbs: 23.0, fat: 0.9, servingSize: '100g', category: '主食' },
  { id: 'steamed-bun2', name: '包子(肉)', calories: 226, protein: 8.1, carbs: 33.5, fat: 6.8, servingSize: '100g', category: '主食' },

  // 肉类蛋白质
  { id: 'chicken-breast', name: '鸡胸肉', calories: 133, protein: 31.0, carbs: 0, fat: 1.2, servingSize: '100g', category: '肉类' },
  { id: 'egg', name: '鸡蛋(1个)', calories: 72, protein: 6.7, carbs: 0.6, fat: 4.8, servingSize: '50g', category: '肉类' },
  { id: 'beef-lean', name: '瘦牛肉', calories: 125, protein: 20.2, carbs: 0.2, fat: 4.2, servingSize: '100g', category: '肉类' },
  { id: 'pork-lean', name: '瘦猪肉', calories: 143, protein: 20.3, carbs: 1.5, fat: 6.2, servingSize: '100g', category: '肉类' },
  { id: 'salmon', name: '三文鱼', calories: 208, protein: 20.4, carbs: 0, fat: 13.4, servingSize: '100g', category: '肉类' },
  { id: 'shrimp', name: '虾仁', calories: 93, protein: 18.6, carbs: 0, fat: 1.5, servingSize: '100g', category: '肉类' },
  { id: 'chicken-drumstick', name: '鸡腿肉', calories: 181, protein: 20.6, carbs: 0, fat: 10.7, servingSize: '100g', category: '肉类' },
  { id: 'duck', name: '鸭肉', calories: 240, protein: 15.5, carbs: 0.1, fat: 19.7, servingSize: '100g', category: '肉类' },
  { id: 'fish-grass', name: '草鱼', calories: 113, protein: 16.6, carbs: 0, fat: 5.2, servingSize: '100g', category: '肉类' },
  { id: 'tofu', name: '豆腐', calories: 81, protein: 8.1, carbs: 4.2, fat: 3.7, servingSize: '100g', category: '肉类' },

  // 蔬菜
  { id: 'broccoli', name: '西兰花', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, servingSize: '100g', category: '蔬菜' },
  { id: 'spinach', name: '菠菜', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: '100g', category: '蔬菜' },
  { id: 'cucumber', name: '黄瓜', calories: 15, protein: 0.7, carbs: 2.9, fat: 0.1, servingSize: '100g', category: '蔬菜' },
  { id: 'tomato', name: '番茄', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: '100g', category: '蔬菜' },
  { id: 'carrot', name: '胡萝卜', calories: 41, protein: 1.0, carbs: 9.6, fat: 0.2, servingSize: '100g', category: '蔬菜' },
  { id: 'cabbage', name: '大白菜', calories: 13, protein: 1.5, carbs: 2.2, fat: 0.1, servingSize: '100g', category: '蔬菜' },
  { id: 'green-pepper', name: '青椒', calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, servingSize: '100g', category: '蔬菜' },
  { id: 'mushroom', name: '蘑菇', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, servingSize: '100g', category: '蔬菜' },
  { id: 'lettuce', name: '生菜', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, servingSize: '100g', category: '蔬菜' },
  { id: 'celery', name: '芹菜', calories: 16, protein: 0.7, carbs: 3.4, fat: 0.2, servingSize: '100g', category: '蔬菜' },
  { id: 'eggplant', name: '茄子', calories: 25, protein: 1.0, carbs: 5.9, fat: 0.2, servingSize: '100g', category: '蔬菜' },
  { id: 'corn-vege', name: '生菜(油麦菜)', calories: 15, protein: 1.4, carbs: 2.8, fat: 0.2, servingSize: '100g', category: '蔬菜' },
  { id: 'onion', name: '洋葱', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, servingSize: '100g', category: '蔬菜' },
  { id: 'chinese-leek', name: '韭菜', calories: 26, protein: 2.4, carbs: 4.6, fat: 0.4, servingSize: '100g', category: '蔬菜' },

  // 水果
  { id: 'apple', name: '苹果(1个)', calories: 95, protein: 0.5, carbs: 25.1, fat: 0.3, servingSize: '200g', category: '水果' },
  { id: 'banana', name: '香蕉(1根)', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.4, servingSize: '120g', category: '水果' },
  { id: 'orange', name: '橙子(1个)', calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, servingSize: '150g', category: '水果' },
  { id: 'grape', name: '葡萄', calories: 69, protein: 0.7, carbs: 18.1, fat: 0.2, servingSize: '100g', category: '水果' },
  { id: 'watermelon', name: '西瓜', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, servingSize: '100g', category: '水果' },
  { id: 'blueberry', name: '蓝莓', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, servingSize: '100g', category: '水果' },
  { id: 'kiwi', name: '猕猴桃(1个)', calories: 42, protein: 0.8, carbs: 10.1, fat: 0.4, servingSize: '75g', category: '水果' },
  { id: 'strawberry', name: '草莓', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, servingSize: '100g', category: '水果' },

  // 奶制品
  { id: 'milk', name: '牛奶(全脂)', calories: 66, protein: 3.2, carbs: 4.8, fat: 3.6, servingSize: '100ml', category: '奶制品' },
  { id: 'milk-skim', name: '牛奶(脱脂)', calories: 35, protein: 3.4, carbs: 4.9, fat: 0.1, servingSize: '100ml', category: '奶制品' },
  { id: 'yogurt', name: '酸奶(原味)', calories: 72, protein: 2.5, carbs: 12.5, fat: 1.5, servingSize: '100g', category: '奶制品' },
  { id: 'greek-yogurt', name: '希腊酸奶', calories: 97, protein: 9.0, carbs: 3.6, fat: 5.0, servingSize: '100g', category: '奶制品' },
  { id: 'cheese', name: '奶酪', calories: 350, protein: 25.0, carbs: 1.3, fat: 27.3, servingSize: '100g', category: '奶制品' },

  // 坚果
  { id: 'almond', name: '杏仁', calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, servingSize: '100g', category: '坚果' },
  { id: 'walnut', name: '核桃', calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, servingSize: '100g', category: '坚果' },
  { id: 'peanut', name: '花生', calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, servingSize: '100g', category: '坚果' },
  { id: 'cashew', name: '腰果', calories: 553, protein: 18.2, carbs: 30.2, fat: 43.9, servingSize: '100g', category: '坚果' },

  // 饮品
  { id: 'coffee-black', name: '黑咖啡', calories: 2, protein: 0.3, carbs: 0, fat: 0, servingSize: '250ml', category: '饮品' },
  { id: 'green-tea', name: '绿茶', calories: 1, protein: 0, carbs: 0, fat: 0, servingSize: '250ml', category: '饮品' },
  { id: 'soy-milk', name: '豆浆(无糖)', calories: 31, protein: 3.2, carbs: 1.1, fat: 1.5, servingSize: '100ml', category: '饮品' },

  // 调味 / 其他
  { id: 'honey', name: '蜂蜜', calories: 304, protein: 0.3, carbs: 82.4, fat: 0, servingSize: '100g', category: '其他' },
  { id: 'olive-oil', name: '橄榄油', calories: 884, protein: 0, carbs: 0, fat: 100, servingSize: '100g', category: '其他' },
  { id: 'peanut-butter', name: '花生酱', calories: 588, protein: 25.1, carbs: 20.0, fat: 50.4, servingSize: '100g', category: '其他' },

  // 中餐常见菜式
  { id: 'stir-fry-chicken', name: '宫保鸡丁', calories: 180, protein: 18.0, carbs: 8.0, fat: 9.0, servingSize: '100g', category: '中式菜肴' },
  { id: 'mapo-tofu', name: '麻婆豆腐', calories: 85, protein: 6.0, carbs: 4.0, fat: 5.0, servingSize: '100g', category: '中式菜肴' },
  { id: 'stir-fry-bean', name: '炒豆角', calories: 45, protein: 2.5, carbs: 7.0, fat: 1.0, servingSize: '100g', category: '中式菜肴' },
  { id: 'egg-tomato', name: '番茄炒蛋', calories: 85, protein: 5.0, carbs: 3.0, fat: 5.5, servingSize: '100g', category: '中式菜肴' },
  { id: 'green-vege', name: '清炒时蔬', calories: 40, protein: 2.0, carbs: 4.0, fat: 2.0, servingSize: '100g', category: '中式菜肴' },
  { id: 'steamed-fish', name: '清蒸鱼', calories: 100, protein: 18.0, carbs: 1.0, fat: 3.0, servingSize: '100g', category: '中式菜肴' },
  { id: 'stir-fry-beef', name: '青椒炒牛肉', calories: 135, protein: 16.0, carbs: 4.0, fat: 6.0, servingSize: '100g', category: '中式菜肴' },
  { id: 'sweet-sour-pork', name: '糖醋里脊', calories: 210, protein: 14.0, carbs: 18.0, fat: 10.0, servingSize: '100g', category: '中式菜肴' },
  { id: 'hotpot-soup', name: '清汤火锅', calories: 60, protein: 4.0, carbs: 3.0, fat: 3.5, servingSize: '100g', category: '中式菜肴' },
  { id: 'dumpling', name: '饺子(猪肉)', calories: 200, protein: 8.0, carbs: 27.0, fat: 7.0, servingSize: '100g', category: '中式菜肴' },
];

export function searchFoods(query: string): FoodItem[] {
  const lower = query.toLowerCase();
  return foodDatabase.filter(
    (f) => f.name.toLowerCase().includes(lower) || f.category.toLowerCase().includes(lower)
  );
}

export function getFoodById(id: string): FoodItem | undefined {
  return foodDatabase.find((f) => f.id === id);
}

export function getFoodsByCategory(category: string): FoodItem[] {
  return foodDatabase.filter((f) => f.category === category);
}

export const foodCategories = [
  '主食',
  '肉类',
  '蔬菜',
  '水果',
  '奶制品',
  '坚果',
  '饮品',
  '中式菜肴',
  '其他',
];
