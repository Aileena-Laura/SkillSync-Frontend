import { API_URL } from "../../settings.js";
import { handleHttpErrors, updateNavbarLink } from "../../utils.js";

let responseStatus;
export function initLogin(match) {
  const msg = match?.params?.msg;
  if (msg) {
    document.getElementById("signedup-msg").innerText = msg || "";
  }
  responseStatus = document.getElementById("response-status");
  document.getElementById("login-btn").addEventListener("click", login);
}

async function login() {
  responseStatus.innerText = "";
  document.getElementById("signedup-msg").innerText = "";
  const userNameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginRequest = {};
  loginRequest.username = userNameInput.value;
  loginRequest.password = passwordInput.value;
  const options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(loginRequest),
  };
  try {
    const res = await fetch(API_URL + "/auth/login", options).then((r) =>
      handleHttpErrors(r)
    );
    storeLoginDetails(res);

    // Redirect based on the user's role
    const userRole = res.role;
    if (userRole === "STUDENT") {
      window.router.navigate("/discover");
    } else if (userRole === "COMPANY") {
      window.router.navigate("/dashboard");
    } else {
      console.warn("Unknown user role. Redirecting to homepage.");
      window.router.navigate("/"); // Fallback to homepage
    }
  } catch (err) {
    responseStatus.style.color = "darkred";
    if (err.apiError) {
      responseStatus.innerText =
        "Login failed: " + err.apiError.message || "Unknown error";
    } else {
      responseStatus.innerText = err.message;
    }
  }
}
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  toggleLoginStatus(false);
}

export function toggleLoginStatus(loggedIn) {
  //Hide or show all menu-links depending on login status
  document.getElementById("login-container").style.display = loggedIn
    ? "none"
    : "block";
  document.getElementById("profile-container").style.display = loggedIn
    ? "block"
    : "none";
  document.getElementById("signup-container").style.display = loggedIn
    ? "none"
    : "block";
  const loggedInUserTxt = loggedIn
    ? `User: ${localStorage["user"]} (${localStorage["role"]})`
    : "";

  updateNavbarLink();

  if (responseStatus) {
    responseStatus.innerText = "";
  }
}

/**
 * Store username, roles and token in localStorage, and update UI-status
 * @param res - Response object with details provided by server for a succesful login
 */
function storeLoginDetails(res) {
  localStorage.setItem("token", res.token);
  localStorage.setItem("user", res.username);
  localStorage.setItem("role", res.role);
  //Update UI
  toggleLoginStatus(true);
}
