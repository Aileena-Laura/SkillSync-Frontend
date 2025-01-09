import { API_URL } from "../../settings.js";
import { handleHttpErrors } from "../../utils.js";

export function initHome() {
    // Add event listeners to navigation links for smooth scrolling (optional if CSS handles it)
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  
    console.log("Home page loaded with scroll navigation.");
  }
  