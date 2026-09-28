# NutriScan - Plan

## Requirements

- **Nutrition Label Scanning**: Take photos of nutrition labels (like the ones in the provided images) and extract nutritional information using OCR.
- **Custom Nutrition Tracking**: Track any nutritional metric - calories, sodium, saturated fats, etc. No pre-set categories only.
- **Meal Planner**: Create meals by specifying grams of each product, automatically calculating nutritional totals.
- **Free & No Ads**: Completely free to use, no advertisements, no paywalls.
- **Multi-language**: Support for labels in multiple languages (Dutch, German, French, Italian, English, Spanish).

## Architecture

### Frontend-Only SPA
- Single Page Application using vanilla JavaScript
- No backend needed - all data stored in LocalStorage
- Tesseract.js for client-side OCR
- Camera API for photo capture

### Pages
1. **Dashboard**: Daily nutritional overview with charts
2. **Scan**: Camera interface to capture nutrition labels
3. **Products**: Catalog of scanned products with nutrition data
4. **Meals**: Meal planner - create meals from products

### Data Model
- **Products**: { id, name, brand, servingSize, nutritionPer100g: { energy, fat, saturatedFat, carbs, sugars, fiber, protein, sodium, ... }, customFields: {} }
- **Meals**: { id, name, date, items: [{ productId, grams, nutrition }] }
- **DailyTotals**: { date, totals: { energy, fat, ... }, meals: [mealIds] }

## Decisions

- **No backend**: Keeps it free, no server costs, no ads needed
- **Tesseract.js**: Client-side OCR, works offline after initial load
- **LocalStorage**: Simple persistence, no auth needed
- **Vanilla JS**: No framework overhead, fast loading
- **CSS Grid/Flexbox**: Responsive design for mobile-first

## What's Not Done Yet

- Cloud sync between devices
- Barcode scanning (EAN lookup)
- Recipe import from URLs
- Export to CSV/PDF
- Dark mode
- PWA offline support (basic)