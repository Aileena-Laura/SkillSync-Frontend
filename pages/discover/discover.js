import { API_URL } from "../../settings.js";
import {
  handleHttpErrors,
  makeOptions,
  sanitizeString,
  formatEnumName,
  fetchUser,
  clearMessage,
  loadingContent,
} from "../../utils.js";

const URLProject = API_URL + "/project";
const URLStudent = API_URL + "/student";
let currentPage = 0; // Start at the first page
const pageSize = 5; // Number of projects per page

export function initDiscover() {
  document.getElementById("match-projects").innerHTML =
    sanitizeString(loadingContent);
  setupEventHandlers();
  setupPaginationControls();
  fetchAndRenderProjects(currentPage, pageSize);
}

function setupPaginationControls() {
  const prevButton = document.getElementById("prev-page");
  const nextButton = document.getElementById("next-page");

  prevButton.addEventListener("click", handlePrevPage);
  nextButton.addEventListener("click", handleNextPage);
}

function updatePaginationControls(currentPage, totalPages) {
  const prevButton = document.getElementById("prev-page");
  const nextButton = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");

  pageInfo.innerText = `Page ${currentPage + 1} of ${totalPages}`;
  prevButton.disabled = currentPage <= 0;
  nextButton.disabled = currentPage >= totalPages - 1;
}

async function fetchAndRenderProjects(page, size, searchTerm) {
  try {
    const username = localStorage.getItem("user");
    let url = `${URLProject}/match?studentId=${username}&page=${page}&size=${size}`;
    if (searchTerm) {
      url = `${URLProject}/search?term=${searchTerm}&userId=${username}&page=${page}&size=${size}`;
    }

    const res = await fetch(url, makeOptions("GET", null, true)).then(
      handleHttpErrors
    );
    if (res.content.length == 0) {
      displayMessage(
        "response-message",
        "No projects found matching your search"
      );
    } else {
      clearMessage("response-message");
      renderProjects(res.content);
      updatePaginationControls(page, res.totalPages);
    }
  } catch (err) {
    console.error("Failed to fetch projects:", err);
  }
}

function displayMessage(elementId, message) {
  const element = document.getElementById(elementId);
  element.innerText = sanitizeString(message);
}

function renderProjects(projects) {
  const projectsContainer = document.getElementById("match-projects");
  projectsContainer.innerHTML = projects
    .map((project) => generateProjectCard(project))
    .join("");
}

function generateProjectCard(project) {
  const skillTags = project.requiredSkills
    .map(
      (skill) =>
        `<span class="badge bg-secondary me-1">${sanitizeString(
          skill.skillName
        )}</span>`
    )
    .join("");

  const fieldTags = project.requiredFieldsOfStudy
    .map(
      (field) =>
        `<span class="badge bg-primary me-1">${sanitizeString(
          formatEnumName(field)
        )}</span>`
    )
    .join("");

  return `
        <div id="project_${project.id}" class="card mb-2">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">${sanitizeString(project.title)}</h5>
            <span id="company_${
              project.companyId
            }" class="company-id badge bg-info">${sanitizeString(
    project.companyName
  )}</span>
          </div>
          <div class="card-body">
            <p class="h7">Description:</p>
            <p>${sanitizeString(project.description)}</p>
            <div class="skills-container">
              <p class="h7">Skills:</p>
              ${skillTags || "<small>No skills listed</small>"}
            </div>
            <div class="fields-container mt-2">
              <p class="h7">Fields of Study:</p>
              ${fieldTags || "<small>No fields of study listed</small>"}
            </div>
            <!-- Add companyId and match information -->
            <div class="project-details mt-3">              
              <p class="h7" ><strong>Match Percentage:</strong> ${
                project.match
              }%</p>
            </div>
          </div>
        </div>
      `;
}

function handlePrevPage() {
  const pageInfo = document.getElementById("page-info");
  const [currentPage] = getPageAndSizeFromInfo(pageInfo);

  if (currentPage > 0) {
    fetchAndRenderProjects(currentPage - 1, pageSize);
  }
}

function handleNextPage() {
  const pageInfo = document.getElementById("page-info");
  const [currentPage, totalPages] = getPageAndSizeFromInfo(pageInfo);

  if (currentPage < totalPages - 1) {
    fetchAndRenderProjects(currentPage + 1, pageSize);
  }
}

function getPageAndSizeFromInfo(pageInfoElement) {
  const pageInfoText = pageInfoElement.innerText;
  const matches = pageInfoText.match(/Page (\d+) of (\d+)/);
  if (!matches) return [0, 0];

  const currentPage = parseInt(matches[1], 10) - 1;
  const totalPages = parseInt(matches[2], 10);

  return [currentPage, totalPages];
}

function setupEventHandlers() {
  const searchForm = document.getElementById("apply-filters");
  searchForm.addEventListener("click", handleSearchSubmit);

  const companyDetails = (evt) => {
    const clicked = evt.target;
    console.log(clicked);
    if (clicked.id.startsWith("company_")) {
      const id = clicked.id.replace("company_", "");
      window.router.navigate(`/company-info?id=${id}`);
    }
  };
  document.getElementById("match-projects").onclick = companyDetails;
}

// Handle search form submission
function handleSearchSubmit(evt) {
  evt.preventDefault();

  const searchTerm = document.getElementById("search-term").value;

  // Reset current page to 0 when a new search is submitted
  currentPage = 0;

  // Fetch and render projects based on search criteria
  fetchAndRenderProjects(currentPage, pageSize, searchTerm);
}
