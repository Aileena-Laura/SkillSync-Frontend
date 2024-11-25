import { API_URL } from "../../settings.js";
import { handleHttpErrors, makeOptions } from "../../utils.js";

const URL = API_URL + "/student";
let user1;

export function initProfile() {
  fetchAndRenderProfile();
}

async function fetchAndRenderProfile() {
  try {
    const username = localStorage.getItem("user");
    const role = localStorage.getItem("roles");
    user1 = await fetch(
      `${URL}/${username}`,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);

    const user = {
      image: "/images/user.png",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      location: "New York, USA",
      education: "Harvard University",
      description: "Experienced software engineer.",
      skills: ["JavaScript", "Python", "React"],
      likedPosts: [{ title: "Cool Project" }, { title: "Inspiring Design" }],
      projects: [{ title: "Portfolio Website" }, { title: "E-commerce App" }],
    };

    if (role == "STUDENT") {
      // Profile Picture and Name
      document.getElementById("profile-picture").src =
        user.image || "/images/user.png";
      document.getElementById("user-name").textContent =
        user.firstName + " " + user.lastName;

      // Basic Info
      document.getElementById("basic-info").innerHTML = `
    <div class="row"><div class="col-sm-4"><p class="mb-0">Full Name</p></div><div class="col-sm-8"><p class="text-muted mb-0">${
      user.firstName + " " + user.lastName || "Not specified"
    }</p></div></div><hr>
    <div class="row"><div class="col-sm-4"><p class="mb-0">Email</p></div><div class="col-sm-8"><p class="text-muted mb-0">${
      user.email || "Not specified"
    }</p></div></div><hr>
    <div class="row"><div class="col-sm-4"><p class="mb-0">Location</p></div><div class="col-sm-8"><p class="text-muted mb-0">${
      user.location || "Not specified"
    }</p></div></div><hr>
    <div class="row"><div class="col-sm-4"><p class="mb-0">Education</p></div><div class="col-sm-8"><p class="text-muted mb-0">${
      user.education || "Not specified"
    }</p></div></div>
  `;

      // Description
      document.getElementById("user-description").value =
        user.description || "Write your description here...";

      // Skills
      const skillsContainer = document.getElementById("skills-container");
      skillsContainer.innerHTML = user.skills
        ? user.skills
            .map(
              (skill) =>
                `<div class="card p-2 border-primary" style="min-width: auto; max-width: fit-content;"><span class="text-primary">${skill}</span></div>`
            )
            .join("")
        : "No skills added";

      // Liked Posts
      const likedPosts = document.getElementById("liked-posts");
      likedPosts.innerHTML = user.likedPosts
        ? user.likedPosts
            .map(
              (post) =>
                `<div class="card mb-2"><div class="card-body">${post.title}</div></div>`
            )
            .join("")
        : "No liked posts";

      // Projects
      const myProjects = document.getElementById("my-projects");
      myProjects.innerHTML = user.projects
        ? user.projects
            .map(
              (project) =>
                `<div class="card mb-2"><div class="card-body">${project.title}</div></div>`
            )
            .join("")
        : "No projects added";
    }

    // Render the HTML into the page
    //document.getElementById("content").innerHTML = profileHTML;
  } catch (err) {
    if (err.apiError) {
      "Login failed: " + err.apiError.message || "Unknown error";
    } else {
    }
  }
}
