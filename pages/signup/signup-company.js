import { API_URL } from "../../settings.js";
import { handleHttpErrors } from "../../utils.js";

const URL = API_URL + "/user-with-role/company";
let role = null;
let responseStatus;
const API_KEY = "98a4991d3d1d4c39809827c7c0e15766"; // Your Geoapify API key

export function initSignupCompany() {
  responseStatus = document.getElementById("status");
  document.getElementById("btn-signup").onclick = signupCompany;

  // Initialize location autocomplete
  const locationInput = document.getElementById("location");
  const suggestionsList = document.getElementById("suggestions-list");

  locationInput.addEventListener("input", function () {
    const query = locationInput.value.trim();

    if (query) {
      fetchGeoapifyAutocomplete(query, locationInput, suggestionsList); // Pass inputs to the function
    } else {
      suggestionsList.innerHTML = ""; // Clear suggestions if input is empty
    }
  });
}

// Function to fetch location suggestions from Geoapify
async function fetchGeoapifyAutocomplete(
  query,
  locationInput,
  suggestionsList
) {
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
    query
  )}&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    // Clear the previous suggestions
    suggestionsList.innerHTML = "";

    // Check if there are any features (suggestions)
    if (result.features && result.features.length > 0) {
      result.features.forEach((feature) => {
        const suggestionItem = document.createElement("li");
        suggestionItem.classList.add(
          "list-group-item",
          "list-group-item-action"
        ); // Bootstrap styles for clickable items
        suggestionItem.textContent = feature.properties.formatted; // Display the location
        suggestionItem.style.cursor = "pointer"; // Makes it clear that it's clickable

        suggestionItem.addEventListener("click", () => {
          locationInput.value = feature.properties.formatted; // Set input to selected location
          suggestionsList.innerHTML = ""; // Clear suggestions
        });
        suggestionsList.appendChild(suggestionItem);
      });
    } else {
      const noResultsItem = document.createElement("li");
      noResultsItem.classList.add("list-group-item", "text-muted"); // Add a muted style for "No Results"
      noResultsItem.textContent = "No suggestions found";
      suggestionsList.appendChild(noResultsItem);
    }
  } catch (error) {
    console.error("Error fetching data from Geoapify:", error);
  }
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

  if (password != confirmPassword) {
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
