import "./navigo_EditedByLars.js"; // Will create the global Navigo object with a few changes

import {
  setActiveLink,
  adjustForMissingHash,
  renderTemplate,
  loadTemplate,
} from "./utils.js";

import { initLogin, toggleLoginStatus, logout } from "./pages/login/login.js";
import { initSignupStudent } from "./pages/signup/signup-student.js";
import { initSignupCompany } from "./pages/signup/signup-company.js";
import { initProfile } from "./pages/profile/profile.js";
import { initHome } from "./pages/home/home.js";

// If token exists, for example after a refresh, set UI accordingly
const token = localStorage.getItem("token");
toggleLoginStatus(token);

window.addEventListener("load", async () => {
  const templateSignupStudent = await loadTemplate(
    "./pages/signup/signup-student.html"
  );
  const templateProfile = await loadTemplate("./pages/profile/profile.html");
  const templateSignupCompany = await loadTemplate(
    "./pages/signup/signup-company.html"
  );
  const templateLogin = await loadTemplate("./pages/login/login.html");
  const templateNotFound = await loadTemplate("./pages/notFound/notFound.html");
  const templateHome = await loadTemplate("./pages/home/home.html");

  adjustForMissingHash();

  const router = new Navigo("/", { hash: true });
  window.router = router; // Make the router global so it can be accessed from all js-files

  // Redirect to '/home' if root URL is accessed
  if (window.location.hash === "" || window.location.hash === "#/") {
    router.navigate("/home");
  }

  router
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url);
        done();
      },
    })
    .on({
      "/": () => {
        router.navigate("/home"); // Fallback redirection to 'home'
      },
      "/home": () => {
        renderTemplate(templateHome, "content"); // Ensure 'content' is the correct container ID
        initHome();
      },
      "/dropdown-0": () => alert(0),
      "/dropdown-1": () => alert(1),
      "/dropdown-2": () => alert(2),
      "/signup/student": () => {
        renderTemplate(templateSignupStudent, "content");
        initSignupStudent();
      },
      "/signup/company": () => {
        renderTemplate(templateSignupCompany, "content");
        initSignupCompany();
      },
      "/login": (match) => {
        renderTemplate(templateLogin, "content");
        initLogin(match);
      },
      "/profile": () => {
        renderTemplate(templateProfile, "content");
        initProfile();
      },
      "/logout": () => {
        logout();
        router.navigate("/home");
      },
    })
    .notFound(() => {
      renderTemplate(templateNotFound, "content");
    })
    .resolve();
});

// Error handling
window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert(
    "Error: " +
      errorMsg +
      " Script: " +
      url +
      " Line: " +
      lineNumber +
      " Column: " +
      column +
      " StackTrace: " +
      errorObj
  );
};

// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll(".carousel-slide");
const totalSlides = slides.length;

function showSlides() {
  slides.forEach((slide, index) => {
    slide.style.opacity = index === currentSlide ? 1 : 0;
  });

  currentSlide = (currentSlide + 1) % totalSlides; // Loop through slides
  setTimeout(showSlides, 5000); // Change slide every 5 seconds
}

// Initialize carousel
showSlides();
