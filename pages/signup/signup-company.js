import { API_URL } from "../../settings.js";
import {
  handleHttpErrors,
  fetchGeoapifyAutocomplete,
  makeOptions,
} from "../../utils.js";

const URL = API_URL + "/user-with-role/company";
let role = null;
let responseStatus;

export function initSignupCompany() {
  responseStatus = document.getElementById("status");
  document.getElementById("btn-signup").onclick = signupCompany;

  // Initialize location autocomplete
  const locationInput = document.getElementById("location");
  const suggestionsList = document.getElementById("suggestions-list");

  locationInput.addEventListener("input", function () {
    const query = locationInput.value.trim();

    if (query) {
      fetchGeoapifyAutocomplete(query, locationInput, suggestionsList);
    } else {
      suggestionsList.innerHTML = ""; // Clear suggestions if input is empty
    }
  });
}

// Password validation function
function validatePassword(password) {
  const minLength = 8;
  const hasNumber = /\d/;

  if (password.length < minLength) {
    return "Password must be at least 8 characters long.";
  }
  if (!hasNumber.test(password)) {
    return "Password must contain at least one number.";
  }
  return null; // Valid password
}

// Sign up logic
async function signupCompany(evt) {
  evt.preventDefault();

  const username = document.getElementById("input-username").value;
  const email = document.getElementById("input-email").value;
  const companyName = document.getElementById("input-company-name").value;
  const password = document.getElementById("input-password").value;
  const confirmPassword = document.getElementById(
    "input-password-confirm"
  ).value;
  const website = document.getElementById("input-website").value;
  const location = document.getElementById("location").value; // Get location value

  // Validate password
  const passwordError = validatePassword(password);
  if (passwordError) {
    responseStatus.innerText = passwordError;
    responseStatus.style.color = "darkred";
    return;
  }

  if (password !== confirmPassword) {
    responseStatus.innerText = "Passwords do not match.";
    responseStatus.style.color = "darkred";
    return;
  }

  role = "COMPANY";

  const user = {
    username,
    email,
    password,
    role,
    companyName,
    website,
    location,
  };

  try {
    await fetch(URL, makeOptions("POST", user, false)).then(handleHttpErrors);
    window.router.navigate(
      "/login?msg=" + "You have successfully signed up. Please login"
    );
  } catch (err) {
    responseStatus.style.color = "darkred";
    if (err.apiError) {
      const errorMessages = Object.values(err.apiError);
      const lastErrorMessage = errorMessages[errorMessages.length - 1];

      responseStatus.innerText = "Registration failed: " + lastErrorMessage;
    } else {
      responseStatus.innerText = err.message;
    }
  }
}
