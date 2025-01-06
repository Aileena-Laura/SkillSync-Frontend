import { API_URL } from "../../settings.js";
import { handleHttpErrors, fetchGeoapifyAutocomplete } from "../../utils.js"; // Import the geolocation utility

const URL = API_URL + "/user-with-role/student";
let role = null;
let responseStatus;

export function initSignupStudent() {
  responseStatus = document.getElementById("status");
  document.getElementById("btn-signup").onclick = signupStudent;

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
  
  async function populateFieldsOfStudy() {
  const fieldSelect = document.getElementById("select-field-of-study");
  try {
    const fieldsOfStudy = await fetch(FIELDS_URL).then(handleHttpErrors);
    fieldsOfStudy.forEach((field) => {
      const option = document.createElement("option");
      option.value = field;
      option.textContent = field.replace("_", " "); // Format enum names
      fieldSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error fetching fields of study:", err);
    responseStatus.innerText =
      "Failed to load fields of study. Try again later.";
  }

// Sign up logic
async function signupStudent(evt) {
  evt.preventDefault();

  const username = document.getElementById("input-username").value;
  const email = document.getElementById("input-email").value;
  const firstName = document.getElementById("input-first-name").value;
  const lastName = document.getElementById("input-last-name").value;
  const password = document.getElementById("input-password").value;
  const confirmPassword = document.getElementById("input-password-confirm").value;
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

  role = "STUDENT";

  const user = {
    username,
    email,
    password,
    role,
    firstName,
    lastName,
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

      responseStatus.innerText = "Registration failed: " + lastErrorMessage;
    } else {
      responseStatus.innerText = err.message;
    }
  }
}
