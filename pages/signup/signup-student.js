import { API_URL } from "../../settings.js";
import { handleHttpErrors, makeOptions } from "../../utils.js";

const URL = API_URL + "/user-with-role/student";
const FIELDS_URL = API_URL + "/fields-of-study";
let responseStatus;

export function initSignupStudent() {
  responseStatus = document.getElementById("status");
  document.getElementById("btn-signup").onclick = signupStudent;
  populateFieldsOfStudy();
}

async function populateFieldsOfStudy() {
  const fieldSelect = document.getElementById("select-field-of-study");
  try {
    const fieldsOfStudy = await fetch(FIELDS_URL).then(handleHttpErrors);
    fieldsOfStudy.forEach((field) => {
      const option = document.createElement("option");
      option.value = field;
      option.textContent = field.replace("", " "); // Format enum names
      fieldSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error fetching fields of study:", err);
    responseStatus.innerText =
      "Failed to load fields of study. Try again later.";
  }
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

async function signupStudent(evt) {
  evt.preventDefault();
  const username = document.getElementById("input-username").value;
  const email = document.getElementById("input-email").value;
  const password = document.getElementById("input-password").value;
  const firstName = document.getElementById("input-firstName").value;
  const lastName = document.getElementById("input-lastName").value;
  const fieldOfStudy = document.getElementById("select-field-of-study").value;
  const confirmPassword = document.getElementById(
    "input-password-confirm"
  ).value;

  // Validate password
  const passwordError = validatePassword(password);
  if (passwordError) {
    responseStatus.innerText = passwordError;
    responseStatus.style.color = "darkred";
    return;
  }

  if (password != confirmPassword) {
    responseStatus.innerText = "Passwords does not match.";
    responseStatus.style.color = "darkred";
    return;
  }

  const role = "STUDENT";

  const body = {
    username,
    email,
    password,
    role,
    firstName,
    lastName,
    fieldOfStudy,
  };

  try {
    await fetch(URL, makeOptions("POST", body, false)).then(handleHttpErrors);
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