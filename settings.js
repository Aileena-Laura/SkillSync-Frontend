export let API_URL = "";
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  API_URL = "http://localhost:80/api";
} else {
  //Add URL to your hosted API, once you have it deployed.
  API_URL =
    "https://skillsync-backend-gtgrd5emg5fagudj.northeurope-01.azurewebsites.net/api";
}
