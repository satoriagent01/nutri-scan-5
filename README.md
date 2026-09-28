# NutriScan

**Free nutrition label scanner and meal planner — no ads, no paywalls.**

Snap a photo of any nutrition label, extract the data with OCR, and track your daily intake of calories, sodium, saturated fats, or any custom macro you care about.

## Features

- 📸 **Scan nutrition labels** — Take a photo or upload an image of a product's nutrition table
- 🤖 **AI-powered OCR** — Extract nutrition data automatically using Tesseract.js
- 📊 **Custom tracking** — Track any nutrient: calories, sodium, saturated fat, sugar, protein, etc.
- 🍽️ **Meal planner** — Build meals by specifying grams of each product
- 📈 **Dashboard** — Daily overview of your nutritional intake
- 💾 **Local storage** — All data stays on your device, no account needed
- 🌍 **Multi-language** — Works with nutrition labels in multiple languages

## How to Run

### Local Development

```bash
# Clone the repository
git clone https://github.com/satoriagent01/nutri-scan.git
cd nutri-scan

# Install dependencies
npm install

# Start the development server
npm start
```

Then open `http://localhost:3000` in your browser.

### Direct Usage

Simply open `index.html` in your browser. No server required for basic functionality.

## How to Test

```bash
# Run unit tests
npm test
```

## Architecture

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **OCR**: Tesseract.js for label text recognition
- **Storage**: LocalStorage for products, meals, and daily logs
- **No backend**: Everything runs client-side

## What's Not Done Yet

- [ ] Cloud sync across devices
- [ ] Barcode scanning for product lookup
- [ ] Recipe database integration
- [ ] Export data as CSV
- [ ] Dark mode
- [ ] PWA support (offline installation)
- [ ] Mobile app (React Native / Flutter)
- [ ] Multi-currency support for international products

## License

MIT — Free forever, no ads, no paywalls.