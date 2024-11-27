import { API_URL } from "../../settings.js";
import {
  handleHttpErrors,
  makeOptions,
  sanitizeString,
  sanitizeStringWithTableRows,
} from "../../utils.js";

const URLStudent = API_URL + "/student";
const URLCompany = API_URL + "/company";
let user;

export function initProfile() {
  fetchUserAndRenderPage();
}

async function fetchUserAndRenderPage() {
  try {
    const username = localStorage.getItem("user");
    let URL =
      localStorage.getItem("roles") == "STUDENT" ? URLStudent : URLCompany;
    user = await fetch(
      `${URL}/${username}`,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);

    if (user.role == "STUDENT") {
      renderStudentProfile(user);
    } else if (user.role == "COMPANY") {
      renderCompanyProfile(user);
    }
  } catch (err) {
    if (err.apiError) {
      console.error(
        "Something went wrong: " + err.apiError.message || "Unknown error"
      );
    }
  }
}

async function renderCompanyProfile(company) {
  try {
    // Profile Picture and Company Name
    document.getElementById("profile-picture").src = sanitizeString(
      company.image || "/images/user.png"
    ); // Sanitize image URL
    document.getElementById("user-name").textContent = sanitizeString(
      company.companyName || "Company Name"
    ); // Sanitize company name

    // Basic Info (Name, Email, Location, Sector)
    document.getElementById("basic-info").innerHTML = ` 
      <div class="row"><div class="col-sm-4"><p class="mb-0">Company Name</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        company.companyName || "Not specified"
      )}</p></div></div><hr>
      <div class="row"><div class="col-sm-4"><p class="mb-0">Email</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        company.email || "Not specified"
      )}</p></div></div><hr>
      <div class="row"><div class="col-sm-4"><p class="mb-0">Location</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        company.location || "Not specified"
      )}</p></div></div><hr>
      <div class="row"><div class="col-sm-4"><p class="mb-0">Website</p></div><div class="col-sm-8"><p class="text-muted mb-0">${sanitizeString(
        company.website || "Not specified"
      )}</p></div></div>
    `;

    // Sanitize and Set Description
    document.getElementById("user-description").value = sanitizeString(
      company.description || "Write your company description here..."
    );

    // Posted Projects
    const postedProjectsContainer = document.getElementById("my-projects");
    postedProjectsContainer.innerHTML = company.projects
      ? company.projects
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

async function renderStudentProfile(user) {
  try {
    // Profile Picture and Student Name
    document.getElementById("profile-picture").src = sanitizeString(
      user.image || "/images/user.png"
    ); // Sanitize image URL
    document.getElementById("user-name").textContent = sanitizeString(
      user.firstName + " " + user.lastName
    );

    // Basic Info (Full Name, Email, Location, Education)
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

    // Sanitize and Set Description
    document.getElementById("user-description").value = sanitizeString(
      user.description || "Write your description here..."
    );

    // Dynamically Add Skills Section for Student Profile (only if skills are available)
    if (user.skills && user.skills.length > 0) {
      const skillsCard = document.createElement("div");
      skillsCard.classList.add("card", "mb-4");

      // Create the header for the skills section
      const skillsHeaderContainer = document.createElement("div");
      skillsHeaderContainer.classList.add(
        "d-flex",
        "justify-content-between",
        "align-items-center",
        "card-header" // Placed outside the card-body for proper placement
      );

      // Create the header for skills (no need for card-header here)
      const skillsHeader = document.createElement("h5");
      skillsHeader.classList.add("card-title"); // Added for consistent styling
      skillsHeader.textContent = "Skills";

      // Create the "Add" button
      const addButton = document.createElement("button");
      addButton.classList.add("btn", "btn-outline-primary", "btn-sm");
      addButton.textContent = "Add";

      // Append the header and add button to the container
      skillsHeaderContainer.appendChild(skillsHeader);
      skillsHeaderContainer.appendChild(addButton);

      // Create the card body for skills content
      const skillsCardBody = document.createElement("div");
      skillsCardBody.classList.add("card-body");

      // Create the container for the skills list
      const skillsContainer = document.createElement("div");
      skillsContainer.classList.add("d-flex", "flex-wrap", "gap-2");

      user.skills.forEach((skill) => {
        const sanitizedSkill = sanitizeString(skill); // Sanitize skill

        // Create the skill card container
        const skillCard = document.createElement("div");
        skillCard.classList.add("card", "p-2", "border-primary");
        skillCard.style.minWidth = "auto";
        skillCard.style.maxWidth = "fit-content";
        skillCard.style.position = "relative";

        // Create a flexbox wrapper for skill text and close button
        const skillContentWrapper = document.createElement("div");
        skillContentWrapper.classList.add("d-flex", "align-items-center");

        // Add skill text
        const skillText = document.createElement("span");
        skillText.classList.add("text-primary", "me-2"); // Add margin to the right for spacing
        skillText.textContent = sanitizedSkill;

        // Add close button
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.classList.add("btn-close", "ms-auto"); // Added margin-left-auto to push to right
        closeButton.setAttribute("aria-label", "Close");

        // Append text and button to the wrapper
        skillContentWrapper.appendChild(skillText);
        skillContentWrapper.appendChild(closeButton);

        // Append wrapper to skill card
        skillCard.appendChild(skillContentWrapper);

        // Append skill card to container
        skillsContainer.appendChild(skillCard);
      });

      // Append the header container to the skills card before the body
      skillsCard.appendChild(skillsHeaderContainer);
      skillsCard.appendChild(skillsCardBody);

      // Append the skills container to the card body
      skillsCardBody.appendChild(skillsContainer);

      // Append the skills card to the DOM
      const descriptionCard = document.querySelector(
        "#profile-second-column > .card.mb-4"
      );

      if (descriptionCard && descriptionCard.parentNode) {
        descriptionCard.parentNode.insertBefore(
          skillsCard,
          descriptionCard.nextSibling
        );
      }
    }

    // Projects (Student's Projects)
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
  } catch (error) {
    console.error("Error rendering student profile:", error);
  }
}
