/**
 * Storage module - LocalStorage-based data persistence
 * Handles all CRUD operations for products, meals, and user preferences
 */

const STORAGE_KEYS = {
  PRODUCTS: 'nutrisan_products',
  MEALS: 'nutrisan_meals',
  DAILY_LOG: 'nutrisan_daily_log',
  USER_PREFS: 'nutrisan_user_prefs'
};

class Storage {
  /**
   * Get all products from storage
   */
  static getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading products:', e);
      return [];
    }
  }

  /**
   * Save all products to storage
   */
  static saveProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return true;
    } catch (e) {
      console.error('Error saving products:', e);
      return false;
    }
  }

  /**
   * Add a new product
   */
  static addProduct(product) {
    const products = this.getProducts();
    product.id = Date.now().toString();
    product.createdAt = new Date().toISOString();
    products.push(product);
    return this.saveProducts(products) ? product : null;
  }

  /**
   * Update an existing product
   */
  static updateProduct(id, updates) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
      return this.saveProducts(products) ? products[index] : null;
    }
    return null;
  }

  /**
   * Delete a product
   */
  static deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    return this.saveProducts(products);
  }

  /**
   * Get a single product by ID
   */
  static getProduct(id) {
    return this.getProducts().find(p => p.id === id);
  }

  /**
   * Get all meals from storage
   */
  static getMeals() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEALS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading meals:', e);
      return [];
    }
  }

  /**
   * Save all meals to storage
   */
  static saveMeals(meals) {
    try {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
      return true;
    } catch (e) {
      console.error('Error saving meals:', e);
      return false;
    }
  }

  /**
   * Add a new meal
   */
  static addMeal(meal) {
    const meals = this.getMeals();
    meal.id = Date.now().toString();
    meal.createdAt = new Date().toISOString();
    meals.push(meal);
    return this.saveMeals(meals) ? meal : null;
  }

  /**
   * Update an existing meal
   */
  static updateMeal(id, updates) {
    const meals = this.getMeals();
    const index = meals.findIndex(m => m.id === id);
    if (index !== -1) {
      meals[index] = { ...meals[index], ...updates, updatedAt: new Date().toISOString() };
      return this.saveMeals(meals) ? meals[index] : null;
    }
    return null;
  }

  /**
   * Delete a meal
   */
  static deleteMeal(id) {
    const meals = this.getMeals().filter(m => m.id !== id);
    return this.saveMeals(meals);
  }

  /**
   * Get meals for a specific date
   */
  static getMealsByDate(date) {
    const meals = this.getMeals();
    return meals.filter(m => m.date === date);
  }

  /**
   * Get daily nutrition totals
   */
  static getDailyTotals(date) {
    const meals = this.getMealsByDate(date);
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      saturatedFat: 0
    };

    meals.forEach(meal => {
      if (meal.items) {
        meal.items.forEach(item => {
          if (item.nutrition) {
            totals.calories += item.nutrition.calories || 0;
            totals.protein += item.nutrition.protein || 0;
            totals.carbs += item.nutrition.carbs || 0;
            totals.fat += item.nutrition.fat || 0;
            totals.fiber += item.nutrition.fiber || 0;
            totals.sugar += item.nutrition.sugar || 0;
            totals.sodium += item.nutrition.sodium || 0;
            totals.saturatedFat += item.nutrition.saturatedFat || 0;
          }
        });
      }
    });

    return totals;
  }

  /**
   * Get user preferences
   */
  static getUserPrefs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PREFS);
      return data ? JSON.parse(data) : {
        dailyCalories: 2000,
        dailyProtein: 50,
        dailyCarbs: 250,
        dailyFat: 65,
        dailyFiber: 25,
        dailySugar: 50,
        dailySodium: 2300
      };
    } catch (e) {
      console.error('Error reading user prefs:', e);
      return {
        dailyCalories: 2000,
        dailyProtein: 50,
        dailyCarbs: 250,
        dailyFat: 65,
        dailyFiber: 25,
        dailySugar: 50,
        dailySodium: 2300
      };
    }
  }

  /**
   * Save user preferences
   */
  static saveUserPrefs(prefs) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFS, JSON.stringify(prefs));
      return true;
    } catch (e) {
      console.error('Error saving user prefs:', e);
      return false;
    }
  }

  /**
   * Clear all data (for debugging/testing)
   */
  static clearAll() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_LOG);
    localStorage.removeItem(STORAGE_KEYS.USER_PREFS);
  }
}

export default Storage;