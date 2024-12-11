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

          return `
              <div id="project-${project.id}" class="card mb-2">
                <div class="card-header">
                  <h5 class="card-title">${sanitizeString(project.title)}</h5>
                </div>
                <div class="card-body">
                  <p>${sanitizeString(project.description)}</p>
                  <div class="skills-container">
                    ${skillTags || "<small>No skills listed</small>"}
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

  initializeSkillAdder();
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
    skillGroup.classList.add("skillGroup");

    // Create a dropdown for selecting skill from the fetched skills
    const skillSelect = document.createElement("select");
    skillSelect.classList.add("skillSelect");
    skills.forEach((skill) => {
      const option = document.createElement("option");
      option.value = skill.id; // Use only the skillName for the option's value and text
      option.textContent = skill.skillName; // Display the skillName in the dropdown
      skillSelect.appendChild(option);
    });

    skillGroup.innerHTML = `
        <label>Skill Name:</label>
      `;
    skillGroup.appendChild(skillSelect);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.classList.add("removeSkillButton");
    removeButton.textContent = "Remove";

    skillGroup.appendChild(removeButton);
    skillsContainer.appendChild(skillGroup);

    // Add remove functionality to the newly added skill
    removeButton.addEventListener("click", () => {
      skillsContainer.removeChild(skillGroup);
    });
  });
}

function clearModal() {
  const skillsContainer = document.getElementById("skills-content");
  skillsContainer.replaceChildren(); // Clear all existing skills
}

async function addProject(user) {
  console.log(user);
  try {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    // Collect skill IDs - ensure we get the skill IDs from the selects in each skillGroup
    const skillGroups = document.querySelectorAll(".skillGroup");

    const requiredSkills = Array.from(skillGroups)
      .map((group) => {
        const skillSelect = group.querySelector(".skillSelect"); // Ensure this is the right class
        const skillId = skillSelect ? parseInt(skillSelect.value, 10) : null; // Parse the selected value as an integer (ID)
        return skillId;
      })
      .filter((skillId) => skillId !== null); // Remove any null values

    // Create the body for the POST request
    const body = {
      title,
      description,
      requiredSkills,
      companyId: user.username, // Assuming 'username' is the company ID
    };
    console.log(body);

    // Send the request to create the project
    const newProject = await fetch(
      `${URLProject}`,
      makeOptions("POST", body, true)
    ).then(handleHttpErrors);

    // Optionally, handle the new project data if needed
    //addSkillToUI(newSkill);
  } catch (error) {
    console.error("Error saving project:", error);
  }
}
