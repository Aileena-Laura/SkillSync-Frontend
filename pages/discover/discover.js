import { API_URL } from "../../settings.js";
import {
  handleHttpErrors,
  makeOptions,
  sanitizeString,
  fetchGeoapifyAutocomplete,
  formatEnumName,
  fetchUser,
} from "../../utils.js";

const URLProject = API_URL + "/project";
const URLStudent = API_URL + "/student";
let currentPage = 0; // Start at the first page
const pageSize = 5; // Number of projects per page

export function initDiscover() {
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

async function fetchAndRenderProjects(page, size) {
  console.log(size);
  try {
    const user = await fetchUser(URLStudent);
    const url = `${URLProject}/match?studentId=${user.username}&page=${page}&size=${size}`;
    const res = await fetch(url, makeOptions("GET", null, true)).then(
      handleHttpErrors
    );
    console.log(res);

    renderProjects(res.content);
    updatePaginationControls(page, res.totalPages);
  } catch (err) {
    console.error("Failed to fetch projects:", err);
  }
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
    fetchAndRenderProjects(currentPage - 1, pageSize); // Default page size is 5
  }
}

function handleNextPage() {
  const pageInfo = document.getElementById("page-info");
  const [currentPage, totalPages] = getPageAndSizeFromInfo(pageInfo);

  if (currentPage < totalPages - 1) {
    fetchAndRenderProjects(currentPage + 1, pageSize); // Default page size is 5
  }
}

function getPageAndSizeFromInfo(pageInfoElement) {
  const pageInfoText = pageInfoElement.innerText; // "Page 1 of 10"
  const matches = pageInfoText.match(/Page (\d+) of (\d+)/);
  if (!matches) return [0, 0];

  const currentPage = parseInt(matches[1], 10) - 1; // Convert to 0-based index
  const totalPages = parseInt(matches[2], 10);

  return [currentPage, totalPages];
}

function setupEventHandlers() {
  console.log("company");
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