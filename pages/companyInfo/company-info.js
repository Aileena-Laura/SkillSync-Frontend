import { API_URL } from "../../settings.js";
import {
  handleHttpErrors,
  makeOptions,
  sanitizeString,
  fetchGeoapifyAutocomplete,
  formatEnumName,
  fetchUser,
  renderProjects,
  generateProjectCard,
  fetchCompany,
} from "../../utils.js";

const URLProject = API_URL + "/project";
const URLStudent = API_URL + "/student";
const URLCompany = API_URL + "/company";

export function initCompanyInfo(match) {
  if (match?.params?.id) {
    console.log(match.params.id);
    const companyId = match.params.id;
    fetchCompanyAndRenderPage(companyId);
  }
}

async function fetchCompanyAndRenderPage(companyId) {
  try {
    const company = await fetchCompany(URLCompany, companyId);
    // Render the company's description
    document.getElementById("user-description").innerText =
      sanitizeString(company.description) ||
      "The company has not provided a description yet.";

    // Render the company's name
    document.getElementById("company-name").innerText = sanitizeString(
      company.companyName
    );

    // Render the company's basic info
    document.getElementById("basic-email").innerHTML = `
      <strong>Contact Email:</strong> ${
        sanitizeString(company.email) || "N/A"
      }`;
    document.getElementById("basic-website").innerHTML = `
      <strong>Website:</strong> ${sanitizeString(company.website) || "N/A"}`;
    document.getElementById("basic-location").innerHTML = `
      <strong>Location:</strong> ${sanitizeString(company.location) || "N/A"}`;

    // Render the company's projects
    renderProjects(company.projects, "company-projects");
  } catch (err) {
    console.error("Failed to fetch or render company data:", err);
  }
}
