import { API_URL } from "../../settings.js";
import { handleHttpErrors, fetchGeoapifyAutocomplete } from "../../utils.js"; // Import the geolocation utility

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
      fetchGeoapifyAutocomplete(query, locationInput, suggestionsList); // Use the reusable utility function
    } else {
      suggestionsList.innerHTML = ""; // Clear suggestions if input is empty
    }
  });
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

  if (password !== confirmPassword) {
    responseStatus.innerText = "Passwords do not match.";
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
    location, // Include location in the user object
  };

  const options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(user),
  };

  try {
    await fetch(URL, options).then(handleHttpErrors);
    window.router.navigate(
      "/login?msg=" + "You have successfully signed up. Please login"
    );
  } catch (err) {
    responseStatus.style.color = "darkred";
    if (err.apiError) {
      const errorMessages = Object.values(err.apiError);
      const lastErrorMessage = errorMessages[errorMessages.length - 1];

      // Display only the last error message
      responseStatus.innerText = "Registration failed: " + lastErrorMessage;
    } else {
      responseStatus.innerText = err.message;
    }
  }
}
