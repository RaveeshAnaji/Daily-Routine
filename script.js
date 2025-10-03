// script.js (The Main Entry Point Module)

// Import the function responsible for setting up all interaction logic
// This function will handle getting the DOM elements and attaching listeners.
import { setupEventListeners } from './modules/taskManager.js';

// Wait for the entire HTML document to be fully loaded before running any script.
// This ensures all HTML elements (like buttons and lists) are available.
document.addEventListener("DOMContentLoaded", () => {
    console.log("Daily Routine App starting...");
    
    // Initialize the core logic of the application
    setupEventListeners();
});

// --- PWA Service Worker Registration (Optional, but included for completeness) ---
// This is related to the second script tag seen in your video.
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registered successfully!', reg))
        .catch(err => console.log('Service Worker registration failed:', err));
}
