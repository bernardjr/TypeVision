/**
 * Main Entry Point
 * Bootstraps the TypeVision application
 */
import { App } from './App.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  
  // Expose to window for debugging (optional)
  if (process.env?.NODE_ENV === 'development') {
    window.app = app;
  }
});

// Handle unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
