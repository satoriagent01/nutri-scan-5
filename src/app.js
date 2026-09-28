import { initRouter } from './ui.js';
import { initStorage } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initRouter();
});