/**
 * Nutrition data parsing and calculation utilities
 */

/**
 * Parse nutrition label text into structured data
 * Handles multiple languages and formats
 */
export function parseNutritionLabel(text) {
  const lines = text.split('\n');
  const result = {
    energy: null,
    fat: null,
    saturatedFat: null,
    carbohydrates: null,
    sugars: null,
    fiber: null,
    protein: null,
    salt: null,
    servingSize: null,
    servingUnit: null,
    servingsPerContainer: null,
    product: null,
    ingredients: null
  };

  // Known nutrition terms in multiple languages
  const terms = {
    energy: ['energie', 'energy', 'énergie', 'energia', 'calorías', 'calorias', 'calories', 'kcal', 'kj'],
    fat: ['fett', 'matières grasses', 'vetten', 'grassi', 'grasa', 'gras', 'fat', 'grasos'],
    saturatedFat: ['gesättigte Fettsäuren', 'acides gras saturés', 'vetzuren', 'acidi grassi saturi', 'grasas saturadas', 'saturated fat', 'acides gras saturés'],
    carbohydrates: ['kohlenhydrate', 'glucides', 'koolhydraten', 'carboidrati', 'carbohidratos', 'carbohydrates', 'glucides', 'carbohydrates'],
    sugars: ['zucker', 'sucre', 'suikers', 'zuccheri', 'azúcar', 'sugars', 'sucres', 'suker'],
    fiber: ['ballaststoffe', 'fibres alimentaires', 'vezels', 'fibre', 'fibra', 'fiber', 'fibres'],
    protein: ['eiweiß', 'protéines', 'eiwitten', 'proteine', 'proteína', 'protein', 'protéines', 'proteine'],
    salt: ['salz', 'sel', 'zout', 'sale', 'sal', 'salt', 'sel', 'sel'],
    servingSize: ['portion', 'serving', 'porción', 'porzione', 'portie', 'portie', 'servicio'],
    ingredients: ['ingrediente', 'ingredients', 'ingrédients', 'ingredienti', 'ingredientes']
  };

  let inNutritionTable = false;
  let inIngredients = false;
  let ingredientsText = [];
  let nutritionValues = {};
  let servingSizeText = null;
  let productText = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    // Detect product name (usually at the top, before nutrition table)
    if (!inNutritionTable && !inIngredients && line.length > 5 && line.length < 80) {
      // Check if this looks like a product name (not a nutrition term)
      const isNutritionTerm = Object.values(terms).some(terms =>
        terms.some(term => lowerLine.includes(term))
      );
      if (!isNutritionTerm && !line.includes('/') && !line.includes('g') && !line.includes('ml')) {
        if (!productText) {
          productText = line;
        }
      }
    }

    // Detect ingredients section
    if (terms.ingredients.some(term => lowerLine.includes(term))) {
      inIngredients = true;
      inNutritionTable = false;
      continue;
    }

    if (inIngredients) {
      if (line === '' || line.includes('Nutr') || line.includes('Voedings') || line.includes('Nährwert') || line.includes('Información') || line.includes('Informazioni')) {
        inIngredients = false;
        result.ingredients = ingredientsText.join(' ');
      } else {
        ingredientsText.push(line);
      }
      continue;
    }

    // Detect nutrition table header
    if (terms.energy.some(term => lowerLine.includes(term)) ||
        terms.fat.some(term => lowerLine.includes(term)) ||
        lowerLine.includes('nährwert') ||
        lowerLine.includes('voedingswaarde') ||
        lowerLine.includes('déclaration nutritionnelle') ||
        lowerLine.includes('dichiarazione nutrizionale') ||
        lowerLine.includes('nutritional') ||
        lowerLine.includes('nutrition')) {
      inNutritionTable = true;
      continue;
    }

    if (inNutritionTable) {
      // Try to parse nutrition values
      // Look for patterns like "Energie ... 2292 kJ / 549 kcal" or "Energie ... 2292 kJ 549 kcal"
      for (const [key, termList] of Object.entries(terms)) {
        if (key === 'energy' || key === 'servingSize' || key === 'ingredients') continue;

        for (const term of termList) {
          if (lowerLine.includes(term)) {
            // Try to extract numeric value
            const match = line.match(/(\d+[.,]?\d*)\s*(g|ml|kj|kcal|%)/i);
            if (match) {
              const value = parseFloat(match[1].replace(',', '.'));
              const unit = match[2].toLowerCase();

              if (key === 'servingSize') {
                servingSizeText = line;
              } else {
                nutritionValues[key] = { value, unit };
              }
            }
            break;
          }
        }
      }

      // Detect serving size
      if (line.match(/(\d+)\s*(g|ml)/i)) {
        const match = line.match(/(\d+)\s*(g|ml)/i);
        if (match) {
          result.servingSize = parseInt(match[1]);
          result.servingUnit = match[2].toLowerCase();
        }
      }

      // Check for "per 100g" or "per 100ml"
      if (lowerLine.includes('per 100')) {
        inNutritionTable = true;
      }

      // Check for end of table (empty line or new section)
      if (line === '' && Object.keys(nutritionValues).length > 0) {
        // Could be end of table, but continue to be safe
      }
    }
  }

  // Set product name if found
  if (productText) {
    result.product = productText;
  }

  // Set nutrition values
  if (nutritionValues.energy) {
    result.energy = nutritionValues.energy.value;
  }
  if (nutritionValues.fat) {
    result.fat = nutritionValues.fat.value;
  }
  if (nutritionValues.saturatedFat) {
    result.saturatedFat = nutritionValues.saturatedFat.value;
  }
  if (nutritionValues.carbohydrates) {
    result.carbohydrates = nutritionValues.carbohydrates.value;
  }
  if (nutritionValues.sugars) {
    result.sugars = nutritionValues.sugars.value;
  }
  if (nutritionValues.fiber) {
    result.fiber = nutritionValues.fiber.value;
  }
  if (nutritionValues.protein) {
    result.protein = nutritionValues.protein.value;
  }
  if (nutritionValues.salt) {
    result.salt = nutritionValues.salt.value;
  }

  // Set serving size if not detected
  if (!result.servingSize && servingSizeText) {
    const match = servingSizeText.match(/(\d+)\s*(g|ml)/i);
    if (match) {
      result.servingSize = parseInt(match[1]);
      result.servingUnit = match[2].toLowerCase();
    }
  }

  // Default serving size if not detected
  if (!result.servingSize) {
    result.servingSize = 100;
    result.servingUnit = 'g';
  }

  return result;
}

/**
 * Calculate nutrition values for a given weight
 */
export function calculateNutritionForWeight(nutritionData, weightInGrams) {
  if (!nutritionData || !nutritionData.servingSize) {
    return null;
  }

  const ratio = weightInGrams / nutritionData.servingSize;

  return {
    energy: nutritionData.energy ? nutritionData.energy * ratio : null,
    fat: nutritionData.fat ? nutritionData.fat * ratio : null,
    saturatedFat: nutritionData.saturatedFat ? nutritionData.saturatedFat * ratio : null,
    carbohydrates: nutritionData.carbohydrates ? nutritionData.carbohydrates * ratio : null,
    sugars: nutritionData.sugars ? nutritionData.sugars * ratio : null,
    fiber: nutritionData.fiber ? nutritionData.fiber * ratio : null,
    protein: nutritionData.protein ? nutritionData.protein * ratio : null,
    salt: nutritionData.salt ? nutritionData.salt * ratio : null,
    servingSize: weightInGrams,
    servingUnit: nutritionData.servingUnit
  };
}

/**
 * Calculate daily totals from meal entries
 */
export function calculateDailyTotals(mealEntries) {
  const totals = {
    energy: 0,
    fat: 0,
    saturatedFat: 0,
    carbohydrates: 0,
    sugars: 0,
    fiber: 0,
    protein: 0,
    salt: 0
  };

  for (const entry of mealEntries) {
    if (entry.nutrition) {
      for (const key of Object.keys(totals)) {
        if (entry.nutrition[key] !== null && entry.nutrition[key] !== undefined) {
          totals[key] += entry.nutrition[key];
        }
      }
    }
  }

  return totals;
}

/**
 * Get recommended daily values (average adult)
 */
export function getDailyReferenceValues() {
  return {
    energy: 2000, // kcal
    fat: 70, // g
    saturatedFat: 20, // g
    carbohydrates: 260, // g
    sugars: 90, // g
    fiber: 25, // g
    protein: 50, // g
    salt: 6 // g
  };
}

/**
 * Calculate percentage of daily reference values
 */
export function calculateDailyPercentages(nutritionValues) {
  const dailyRef = getDailyReferenceValues();
  const percentages = {};

  for (const key of Object.keys(dailyRef)) {
    if (nutritionValues[key] !== null && nutritionValues[key] !== undefined) {
      percentages[key] = Math.round((nutritionValues[key] / dailyRef[key]) * 100);
    }
  }

  return percentages;
}