import { API_URL } from "../../settings.js";
import { handleHttpErrors } from "../../utils.js";

const URL = API_URL + "/user-with-role";
let role = null;
let responseStatus;

export function initSignup() {
  responseStatus = document.getElementById("status");
  document.getElementById("btn-signup").onclick = signup;
}

async function signup(evt) {
  evt.preventDefault();
  const username = document.getElementById("input-username").value;
  const email = document.getElementById("input-email").value;
  const password = document.getElementById("input-password").value;
  const studentChecked = document.getElementById("checkbox-student").checked;
  const companyChecked = document.getElementById("checkbox-company").checked;

  if (!username || !email || !password) {
    responseStatus.innerText = "All fields are required.";
    return; // Prevent form submission if any field is empty
  }

  if (studentChecked) {
    role = "student";
  } else if (companyChecked) {
    role = "company";
  }

  const user = { username, email, password, role };
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
      responseStatus.innerText =
        "Registration failed: " + err.apiError.message || "Unknown error";
    } else {
      responseStatus.innerText = err.message;
    }
  }
}
