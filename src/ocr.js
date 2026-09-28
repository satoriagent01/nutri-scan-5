/**
 * OCR processing using Tesseract.js for nutrition label recognition
 * Handles image preprocessing, OCR, and text extraction
 */

class OCRProcessor {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Tesseract.js worker
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Dynamically import Tesseract.js
      const Tesseract = await import('tesseract.js');
      this.worker = await Tesseract.createWorker('eng');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Tesseract.js:', error);
      throw new Error('OCR engine initialization failed');
    }
  }

  /**
   * Preprocess image for better OCR results
   * @param {string} imageDataUrl - Base64 image data URL
   * @returns {string} Preprocessed image data URL
   */
  preprocessImage(imageDataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to grayscale and enhance contrast
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          // Apply threshold for better text recognition
          const enhanced = avg > 128 ? 255 : 0;
          data[i] = enhanced;     // R
          data[i + 1] = enhanced; // G
          data[i + 2] = enhanced; // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.src = imageDataUrl;
    });
  }

  /**
   * Extract nutrition information from image
   * @param {string} imageDataUrl - Base64 image data URL
   * @returns {Promise<string>} Extracted text
   */
  async extractText(imageDataUrl) {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      // Preprocess image for better results
      const processedImage = await this.preprocessImage(imageDataUrl);
      
      // Perform OCR
      const result = await this.worker.recognize(processedImage);
      
      return result.data.text;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Clean and format extracted text for nutrition parsing
   * @param {string} text - Raw OCR text
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n/g, ' ')   // Replace newlines with spaces
      .replace(/[^\w\s\-\.,%°µ\/\(\)]/g, '') // Remove special characters
      .trim();
  }

  /**
   * Destroy worker to free resources
   */
  async destroy() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
const ocrProcessor = new OCRProcessor();
export default ocrProcessor;