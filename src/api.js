/**
 * OCR API integration for nutrition label extraction
 * Uses Tesseract.js for client-side OCR processing
 */

import { parseNutritionTable } from './nutrition.js';

/**
 * Process an image to extract nutrition information
 * @param {File|Blob} image - The image file to process
 * @returns {Promise<Object|null>} Parsed nutrition data or null if extraction fails
 */
export async function extractNutritionFromImage(image) {
  try {
    // Load Tesseract.js dynamically
    const Tesseract = await loadTesseract();
    
    // Recognize text from the image
    const { data } = await Tesseract.recognize(image, 'eng+deu+nld', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log('OCR progress:', Math.round(m.progress * 100) + '%');
        }
      }
    });

    // Parse the nutrition table from the recognized text
    const nutritionData = parseNutritionTable(data.text);
    
    if (nutritionData && nutritionData.nutrients) {
      return {
        success: true,
        text: data.text,
        confidence: data.confidence,
        ...nutritionData
      };
    }

    return {
      success: false,
      text: data.text,
      confidence: data.confidence,
      error: 'Could not parse nutrition table from image'
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    return {
      success: false,
      error: error.message || 'OCR processing failed'
    };
  }
}

/**
 * Load Tesseract.js library
 * @returns {Promise<Object>} Tesseract instance
 */
async function loadTesseract() {
  if (window.Tesseract) {
    return window.Tesseract;
  }

  // Load Tesseract.js from CDN
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error('Failed to load Tesseract.js'));
    document.head.appendChild(script);
  });
}

/**
 * Preprocess image for better OCR results
 * @param {File|Blob} image - The image file
 * @returns {Promise<string>} Base64 encoded image
 */
export async function preprocessImage(image) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize for better performance
        const maxSize = 2048;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to grayscale and enhance contrast
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          // Simple threshold for better text recognition
          const value = avg > 128 ? 255 : 0;
          data[i] = value;     // R
          data[i + 1] = value; // G
          data[i + 2] = value; // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(image);
  });
}