import { API_URL } from "../../settings.js";
import {
  handleHttpErrors,
  makeOptions,
  sanitizeString,
  fetchGeoapifyAutocomplete,
} from "../../utils.js";

const URLStudent = API_URL + "/student";
const URLCompany = API_URL + "/company";
const URLProject = API_URL + "/project";
const URLSKill = API_URL + "/skill";
const FIELDS_URL = API_URL + "/fields-of-study";
let messageTimeout;

export function initDashboard() {
  fetchUserAndRenderPage();
  document
    .getElementById("add-project-modal")
    .addEventListener("hidden.bs.modal", () => {
      clearModal(); // Reset modal when closed
    });
}

async function fetchSkills() {
  try {
    const skills = await fetch(URLSKill, makeOptions("GET", null, true)).then(
      handleHttpErrors
    );
    return skills; // Assuming it returns an array of skill objects
  } catch (error) {
    console.error("Error fetching skills:", error);
  }
}

async function fetchFieldsOfStudy() {
  try {
    // Fetch the fields of study from the API and handle errors
    const fieldsOfStudy = await fetch(
      FIELDS_URL,
      makeOptions("GET", false, true)
    ).then(handleHttpErrors);

    return fieldsOfStudy; // Return the array as is
  } catch (err) {
    console.error("Error fetching fields of study:", err);
  }
}

async function fetchUser() {
  try {
    const username = localStorage.getItem("user");
    let URL =
      localStorage.getItem("role") == "STUDENT" ? URLStudent : URLCompany;

    const user = await fetch(
      `${URL}/${username}`,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);

    return { user, URL };
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
}

async function fetchUserAndRenderPage() {
  try {
    const { user, URL } = await fetchUser();

    if (user.role == "STUDENT") {
    } else if (user.role == "COMPANY") {
      renderProjects(user);
      initializeSkillAdder();
      initializeFieldAdder();
    }
  } catch (err) {
    if (err.apiError) {
      console.error(
        "Something went wrong: " + err.apiError.message || "Unknown error"
      );
    }
  }
}

async function renderProjects(user) {
  console.log(user);
  const myProjectsContainer = document.getElementById("my-projects");

  myProjectsContainer.innerHTML = user.projects
    ? user.projects
        .map((project) => {
          // Generate skill tags
          const skillTags = project.requiredSkills
            .map(
              (skill) =>
                `<span class="badge bg-secondary me-1">${sanitizeString(
                  skill.skillName
                )}</span>`
            )
            .join("");

          // Generate field tags
          const fieldTags = project.requiredFieldsOfStudy
            .map(
              (field) =>
                `<span class="badge bg-primary me-1">${sanitizeString(
                  formatEnumName(field)
                )}</span>`
            )
            .join("");

          return `
            <div id="project-${project.id}" class="card mb-2">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">${sanitizeString(
                  project.title
                )}</h5>
                <button 
                  type="button" 
                  class="btn-close" 
                  aria-label="Close" 
                  data-id="${project.id}">
                </button>
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
              </div>
            </div>
          `;
        })
        .join("")
    : "<p>No projects added</p>";

  const saveProjectBtn = document.getElementById("save-project-btn");

  saveProjectBtn.addEventListener("click", () => {
    addProject(user);
  });

  document.querySelectorAll(".btn-close").forEach((button) => {
    button.addEventListener("click", (event) => {
      const projectId = event.target.dataset.id;
      if (projectId) {
        deleteProject(projectId);
      }
    });
  });
}

async function initializeFieldAdder() {
  const fieldsContainer = document.getElementById("fields-content");
  const addFieldButton = document.getElementById("add-field-button");

  // Clear the fields container each time
  fieldsContainer.replaceChildren();

  // Fetch the predefined fields of study
  const fieldsOfStudy = await fetchFieldsOfStudy();

  // Replace the button to remove all previous listeners
  const newAddFieldButton = addFieldButton.cloneNode(true);
  addFieldButton.replaceWith(newAddFieldButton);

  // Add a single event listener to the new button
  newAddFieldButton.addEventListener("click", () => {
    const fieldGroup = document.createElement("div");
    fieldGroup.classList.add(
      "fieldGroup",
      "d-flex",
      "align-items-center",
      "mb-2"
    );

    // Create a dropdown for selecting fields of study
    const fieldSelect = document.createElement("select");
    fieldSelect.classList.add(
      "form-select",
      "me-2",
      "flex-grow-1",
      "fieldSelect"
    );
    fieldsOfStudy.forEach((field) => {
      const option = document.createElement("option");
      option.value = field;
      option.textContent = formatEnumName(field);
      fieldSelect.appendChild(option);
    });

    // Add the dropdown to the group
    fieldGroup.appendChild(fieldSelect);

    // Create a remove button
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.classList.add("btn", "btn-danger", "btn-sm");
    removeButton.textContent = "Remove";

    // Append the button to the group
    fieldGroup.appendChild(removeButton);

    // Add the group to the container
    fieldsContainer.appendChild(fieldGroup);

    // Add remove functionality to the newly added button
    removeButton.addEventListener("click", () => {
      fieldsContainer.removeChild(fieldGroup);
    });
  });
}

async function initializeSkillAdder() {
  const skillsContainer = document.getElementById("skills-content");
  const addSkillButton = document.getElementById("add-skill-button");

  // Clear the skills container each time
  skillsContainer.replaceChildren();

  // Fetch the predefined skills
  const skills = await fetchSkills();

  // Replace the button to remove all previous listeners
  const newAddSkillButton = addSkillButton.cloneNode(true);
  addSkillButton.replaceWith(newAddSkillButton);

  // Add a single event listener to the new button
  newAddSkillButton.addEventListener("click", () => {
    const skillGroup = document.createElement("div");
    skillGroup.classList.add(
      "skillGroup",
      "d-flex",
      "align-items-center",
      "mb-2"
    );

    // Create a dropdown for selecting skill from the fetched skills
    const skillSelect = document.createElement("select");
    skillSelect.classList.add(
      "form-select",
      "me-2",
      "flex-grow-1",
      "skillSelect"
    );
    skills.forEach((skill) => {
      const option = document.createElement("option");
      option.value = skill.id; // Use skill ID as value
      option.textContent = skill.skillName; // Display skill name
      skillSelect.appendChild(option);
    });

    // Add the dropdown to the group
    skillGroup.appendChild(skillSelect);

    // Create a remove button
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.classList.add("btn", "btn-danger", "btn-sm");
    removeButton.textContent = "Remove";

    // Append the button to the group
    skillGroup.appendChild(removeButton);

    // Add the group to the container
    skillsContainer.appendChild(skillGroup);

    // Add remove functionality to the newly added button
    removeButton.addEventListener("click", () => {
      skillsContainer.removeChild(skillGroup);
    });
  });
}

function clearModal() {
  const skillsContainer = document.getElementById("skills-content");
  skillsContainer.replaceChildren();

  const fieldsContainer = document.getElementById("fields-content");
  fieldsContainer.replaceChildren();
}

async function addProject(user) {
  try {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    // Collect skills
    const skillGroups = document.querySelectorAll(".skillGroup");
    const requiredSkills = Array.from(skillGroups)
      .map((group) => {
        const skillSelect = group.querySelector(".skillSelect");
        const skillId = skillSelect ? parseInt(skillSelect.value, 10) : null;
        return skillId;
      })
      .filter((skillId) => skillId !== null);

    // Collect fields of study
    const fieldGroups = document.querySelectorAll(".fieldGroup");
    const requiredFieldsOfStudy = Array.from(fieldGroups)
      .map((group) => {
        const fieldSelect = group.querySelector(".fieldSelect");
        return fieldSelect ? fieldSelect.value : null;
      })
      .filter((field) => field !== null);

    // Create the body for the POST request
    const body = {
      title,
      description,
      requiredSkills,
      requiredFieldsOfStudy, // Include fields of study
      companyId: user.username, // Assuming 'username' is the company ID
    };

    // Send the request to create the project
    const newProject = await fetch(
      `${URLProject}`,
      makeOptions("POST", body, true)
    ).then(handleHttpErrors);

    console.log("New project added:", newProject);
  } catch (error) {
    console.error("Error saving project:", error);
  }
}

async function deleteProject(projectId) {
  try {
    const response = await fetch(
      `${URLProject}/${projectId}`,
      makeOptions("DELETE", null, true)
    ).then(handleHttpErrors);

    console.log(response);
    // Optionally re-fetch and re-render the projects after deletion
    const updatedUser = await fetchUser();
    renderProjects(updatedUser.user);
  } catch (error) {
    console.error(`Error deleting project:`, error);
  }
}

function formatEnumName(value) {
  // Replace underscores with spaces and capitalize each word
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
