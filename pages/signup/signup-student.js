import { API_URL } from "../../settings.js";
import { handleHttpErrors } from "../../utils.js";

const URL = API_URL + "/user-with-role/student";
let role = null;
let responseStatus;

export function initSignupStudent() {
  responseStatus = document.getElementById("status");
  document.getElementById("btn-signup").onclick = signupStudent;
}

async function signupStudent(evt) {
  evt.preventDefault();
  const username = document.getElementById("input-username").value;
  const email = document.getElementById("input-email").value;
  const password = document.getElementById("input-password").value;
  const firstName = document.getElementById("input-firstName").value;
  const lastName = document.getElementById("input-lastName").value;
  const confirmPassword = document.getElementById(
    "input-password-confirm"
  ).value;

  if (password != confirmPassword) {
    responseStatus.innerText = "Passwords does not match.";
    return;
  }

  role = "STUDENT";

  const user = { username, email, password, role, firstName, lastName };
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
