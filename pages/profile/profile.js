import { API_URL } from "../../settings.js";
import {
  handleHttpErrors,
  makeOptions,
  sanitizeString,
  fetchGeoapifyAutocomplete,
} from "../../utils.js";

const URLStudent = API_URL + "/student";
const URLCompany = API_URL + "/company";
const URLSKill = API_URL + "/skill";
let messageTimeout;

export function initProfile() {
  fetchUserAndRenderPage();
  setupLocationAutocomplete();
}

async function setupLocationAutocomplete() {
  // Initialize location autocomplete
  const locationInput = document.getElementById("edit-location");
  const suggestionsList = document.getElementById("location-suggestions");

  locationInput.addEventListener("input", function () {
    const query = locationInput.value.trim();

    if (query) {
      fetchGeoapifyAutocomplete(query, locationInput, suggestionsList); // Use the reusable utility function
    } else {
      suggestionsList.innerHTML = ""; // Clear suggestions if input is empty
    }
  });
}

async function fetchUser() {
  try {
    const username = localStorage.getItem("user");
    let URL =
      localStorage.getItem("roles") == "STUDENT" ? URLStudent : URLCompany;

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
      populateEditModal(user, true);
      renderStudentProfile(user, URL);
    } else if (user.role == "COMPANY") {
      populateEditModal(user, false);
      renderCompanyProfile(user, URL);
    }
  } catch (err) {
    if (err.apiError) {
      console.error(
        "Something went wrong: " + err.apiError.message || "Unknown error"
      );
    }
  }
}

async function renderCompanyProfile(user, URL) {
  try {
    await renderProfilePictureAndName(user);
    await renderBasicInfo(user, URL);
    await renderDescription(user, URL);
    await renderProjects(user);
  } catch (error) {
    console.error("Error rendering company profile:", error);
  }
}

async function renderStudentProfile(user, URL) {
  try {
    await renderProfilePictureAndName(user);
    await renderBasicInfo(user, URL);
    await renderDescription(user, URL);
    await renderSkills(user);
    await renderProjects(user);
  } catch (error) {
    console.error("Error rendering student profile:", error);
  }
}

async function saveSkill(username) {
  try {
    const body = {
      skillName: document.getElementById("input-skill-name").value,
      experience: document.getElementById("skill-experience").value,
      studentId: username,
    };

    const newSkill = await fetch(
      `${API_URL}/skill`,
      makeOptions("Post", body, true)
    ).then(handleHttpErrors);

    addSkillToUI(newSkill);
  } catch (error) {
    console.error("Error saving skill:", error);
  }
}

async function deleteSkillFromBackend(id) {
  try {
    const response = await fetch(
      `${URLSKill}/${id}`,
      makeOptions("DELETE", null, true)
    ).then(handleHttpErrors, fetchUserAndRenderPage);
  } catch (err) {
    throw new Error("Could not delete skill: " + err);
  }
}

async function editDescription(user, URL) {
  try {
    const body = {
      description: document.getElementById("user-description").value,
    };

    await fetch(
      `${URL}/description/${user.username}`,
      makeOptions("PATCH", body, true)
    ).then(handleHttpErrors);
    showMessage("description-message", "Changes saved");
    await fetchUserAndRenderPage();
  } catch (err) {
    throw new Error("Failed to edit description: " + err);
  }
}

function showMessage(elementId, message, duration = 4000) {
  const element = document.getElementById(elementId);
  element.innerText = sanitizeString(message);

  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }

  messageTimeout = setTimeout(() => {
    clearMessage(elementId);
  }, duration);
}

function clearMessage(elementId) {
  const element = document.getElementById(elementId);
  element.innerText = sanitizeString("");
}

async function renderProfilePictureAndName(user) {
  if (user.role === "STUDENT") {
    document.getElementById("profile-picture").src = sanitizeString(
      user.image || "/images/user.png"
    ); // Sanitize image URL
    document.getElementById("user-name").textContent = sanitizeString(
      user.firstName + " " + user.lastName
    );
  } else if (user.role === "COMPANY") {
    document.getElementById("profile-picture").src = sanitizeString(
      user.image || "/images/user.png"
    ); // Sanitize image URL
    document.getElementById("user-name").textContent = sanitizeString(
      user.companyName || "Company Name"
    );
  }
}

async function renderBasicInfo(user, URL) {
  if (user.role === "STUDENT") {
    document.getElementById("basic-info").innerHTML = `
      <div class="row"><div class="col-sm-4"><p class="mb-0">Full Name</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        user.firstName + " " + user.lastName || "Not specified"
      )}</p></div></div><hr>
      <div class="row"><div class="col-sm-4"><p class="mb-0">Email</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        user.email || "Not specified"
      )}</p></div></div><hr>
      <div class="row"><div class="col-sm-4"><p class="mb-0">Location</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        user.location || "Not specified"
      )}</p></div></div><hr>
      <div class="row"><div class="col-sm-4"><p class="mb-0">Education</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        user.education || "Not specified"
      )}</p></div></div>
    `;
  } else if (user.role === "COMPANY") {
    document.getElementById("basic-info").innerHTML = ` 
      <div class="row"><div class="col-sm-4"><p class="mb-0">Company Name</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        user.companyName || "Not specified"
      )}</p></div></div><hr>
      <div class="row"><div class="col-sm-4"><p class="mb-0">Email</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        user.email || "Not specified"
      )}</p></div></div><hr>
      <div class="row"><div class="col-sm-4"><p class="mb-0">Location</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        user.location || "Not specified"
      )}</p></div></div><hr>
      <div class="row"><div class="col-sm-4"><p class="mb-0">Website</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        user.website || "Not specified"
      )}</p></div></div>
    `;
  }

  const saveBasicInfoBtn = document.getElementById("save-basic-info-btn");
  if (saveBasicInfoBtn) {
    saveBasicInfoBtn.addEventListener("click", () => {
      saveChangesToBasicInfo(user, URL); // Save the changes when the button is clicked
    });
  }
}

// Function to save the changes to the backend
async function saveChangesToBasicInfo(user, URL) {
  try {
    const updatedEmail = document.getElementById("edit-email").value;
    const updatedLocation = document.getElementById("edit-location").value;
    let body = {
      email: updatedEmail,
      location: updatedLocation,
    };
    // Get the updated values from the input fields in the modal
    if (user.role === "STUDENT") {
      body.firstName = document.getElementById("edit-first-name").value;
      body.lastName = document.getElementById("edit-last-name").value;
      body.education = document.getElementById("edit-education").value;
    } else if (user.role === "COMPANY") {
      body.companyName = document.getElementById("edit-company-name").value;
      body.website = document.getElementById("edit-website").value;
    }

    // Send a PATCH request to update the user info
    const updatedUser = await fetch(
      `${URL}/${user.username}`, // Endpoint for updating user profile
      makeOptions("PATCH", body, true) // Using the helper function for fetch options
    ).then(handleHttpErrors);

    // On success, update the UI with the new values
    if (updatedUser) {
      user = updatedUser;

      // Update the profile UI
      renderBasicInfo(user);
    }
  } catch (error) {
    console.error("Error saving changes:", error);
  }
}

function populateEditModal(user, isStudent) {
  const firstNameField = document.getElementById("edit-first-name");
  const companyNameField = document.getElementById("edit-company-name");
  const lastNameField = document.getElementById("edit-last-name");
  const emailField = document.getElementById("edit-email");
  const locationField = document.getElementById("edit-location");
  const educationField = document.getElementById("edit-education");
  const websiteField = document.getElementById("edit-website");

  // Common fields (always shown for both)
  emailField.value = sanitizeString(user.email || "");
  locationField.value = sanitizeString(user.location || "");

  // Hide all fields initially
  firstNameField.parentElement.classList.add("hidden");
  lastNameField.parentElement.classList.add("hidden");
  educationField.parentElement.classList.add("hidden");
  websiteField.parentElement.classList.add("hidden");
  companyNameField.parentElement.classList.add("hidden");

  if (isStudent) {
    // For students, show student-specific fields
    firstNameField.value = sanitizeString(user.firstName || "");
    lastNameField.value = sanitizeString(user.lastName || "");
    educationField.value = sanitizeString(user.education || "");

    // Show student-related fields
    firstNameField.parentElement.classList.remove("hidden");
    lastNameField.parentElement.classList.remove("hidden");
    educationField.parentElement.classList.remove("hidden");
  } else {
    console.log(isStudent);
    // For companies, show company-specific fields
    companyNameField.value = sanitizeString(user.companyName || "");
    websiteField.value = sanitizeString(user.website || "");

    // Show company-related fields
    companyNameField.parentElement.classList.remove("hidden");
    websiteField.parentElement.classList.remove("hidden");
  }
}

async function renderDescription(user, URL) {
  const descriptionElement = document.getElementById("user-description");
  descriptionElement.value = sanitizeString(
    user.description || "Write your description here..."
  );

  const saveDescriptionBtn = document.getElementById("save-description");
  saveDescriptionBtn.addEventListener("click", () => {
    editDescription(user, URL);
  });
}

async function renderSkills(user) {
  // Check if the skills card already exists
  let skillsCard = document.getElementById("skills-card");

  if (!skillsCard) {
    // Create the skills card if it doesn't exist
    skillsCard = document.createElement("div");
    skillsCard.classList.add("card", "mb-4");
    skillsCard.id = "skills-card";

    const skillsHeaderContainer = document.createElement("div");
    skillsHeaderContainer.classList.add(
      "d-flex",
      "justify-content-between",
      "align-items-center",
      "card-header"
    );

    const skillsHeader = document.createElement("h5");
    skillsHeader.classList.add("card-title");
    skillsHeader.textContent = "Skills";

    const addButton = document.createElement("button");
    addButton.classList.add("btn", "btn-outline-primary", "btn-sm");
    addButton.textContent = "Add";
    addButton.setAttribute("data-bs-toggle", "modal");
    addButton.setAttribute("data-bs-target", "#add-skill-modal");

    skillsHeaderContainer.appendChild(skillsHeader);
    skillsHeaderContainer.appendChild(addButton);

    const skillsCardBody = document.createElement("div");
    skillsCardBody.classList.add("card-body");

    const skillsContainer = document.createElement("div");
    skillsContainer.classList.add("d-flex", "flex-wrap", "gap-2");
    skillsContainer.id = "skills-container";

    skillsCardBody.appendChild(skillsContainer);
    skillsCard.appendChild(skillsHeaderContainer);
    skillsCard.appendChild(skillsCardBody);

    const descriptionCard = document.querySelector(
      "#profile-second-column > .card.mb-4"
    );
    if (descriptionCard && descriptionCard.parentNode) {
      descriptionCard.parentNode.insertBefore(
        skillsCard,
        descriptionCard.nextSibling
      );
    }

    // Add event listener for the save-skill-btn
    const saveSkillBtn = document.getElementById("save-skill-btn");
    if (saveSkillBtn) {
      saveSkillBtn.addEventListener("click", () => saveSkill(user.username));
    }
  }

  // Update the skills (clear and repopulate)
  const skillsContainer = document.getElementById("skills-container");
  skillsContainer.innerHTML = ""; // Clear existing skills

  if (user.skills && user.skills.length > 0) {
    user.skills.forEach((skill) => {
      addSkillToUI(skill);
    });
  }
}

async function renderProjects(user) {
  console.log(user.projects);
  const myProjectsContainer = document.getElementById("my-projects");
  myProjectsContainer.innerHTML = user.projects
    ? user.projects
        .map(
          (project) =>
            `<div class="card mb-2"><div class="card-body">${sanitizeString(
              project.title
            )}</div></div>`
        )
        .join("")
    : "No projects added";
}

function addSkillToUI(skill) {
  const skillsContainer = document.getElementById("skills-container");

  // Create the new skill card element
  const skillCard = document.createElement("div");
  skillCard.classList.add("card", "p-2", "border-primary");
  skillCard.id = `skill-id-${skill.id}`;

  const skillContentWrapper = document.createElement("div");
  skillContentWrapper.classList.add("d-flex", "align-items-center");

  const skillText = document.createElement("span");
  skillText.classList.add("text-primary", "me-2");
  skillText.textContent = sanitizeString(skill.skillName);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.classList.add("btn-close", "ms-auto");
  deleteButton.setAttribute("aria-label", "Close");

  // Append the skill name and delete button to the skill card
  skillContentWrapper.appendChild(skillText);
  skillContentWrapper.appendChild(deleteButton);
  skillCard.appendChild(skillContentWrapper);

  // Append the new skill card to the skills container
  skillsContainer.appendChild(skillCard);

  // Add event listener for deleting the skill
  deleteButton.addEventListener("click", async () => {
    try {
      await deleteSkillFromBackend(skill.id);
      skillCard.remove();
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  });
}

//TODO project handling
async function renderCompanyProfile1(user, URL) {
  try {
    // Posted Projects
    const postedProjectsContainer = document.getElementById("my-projects");
    postedProjectsContainer.innerHTML = user.projects
      ? user.projects
          .map(
            (project) =>
              `<div class="card mb-2"><div class="card-body">${sanitizeString(
                project.title
              )}</div></div>`
          )
          .join("")
      : "No posted projects";

    // Get the existing card header
    const projectsCardHeader = document
      .querySelector("#my-projects")
      .closest(".card")
      .querySelector(".card-header");

    // Add the flexbox layout to the card-header
    projectsCardHeader.classList.add(
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );

    // Create the "Add Project" button
    const addProjectButton = document.createElement("button");
    addProjectButton.id = "add-project";
    addProjectButton.classList.add("btn", "btn-outline-primary", "btn-sm");
    addProjectButton.textContent = "Add Project";

    // Append the "Add Project" button to the card-header
    projectsCardHeader.appendChild(addProjectButton);
  } catch (error) {
    console.error("Error rendering company profile:", error);
  }
}
