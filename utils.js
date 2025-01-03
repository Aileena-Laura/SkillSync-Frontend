const API_KEY = "98a4991d3d1d4c39809827c7c0e15766"; // Your Geoapify API key

/**
 * Fetches geolocation suggestions from Geoapify and updates the suggestions list.
 * @param {string} query - The input text to search for.
 * @param {HTMLElement} locationInput - The input element where the query is entered.
 * @param {HTMLElement} suggestionsList - The element to display the suggestions.
 */
export async function fetchGeoapifyAutocomplete(
  query,
  locationInput,
  suggestionsList
) {
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
    query
  )}&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    // Clear the previous suggestions
    suggestionsList.innerHTML = "";

    // Check if there are any features (suggestions)
    if (result.features && result.features.length > 0) {
      result.features.forEach((feature) => {
        const suggestionItem = document.createElement("li");
        suggestionItem.classList.add(
          "list-group-item",
          "list-group-item-action"
        ); // Bootstrap styles for clickable items
        suggestionItem.textContent = feature.properties.formatted; // Display the location
        suggestionItem.style.cursor = "pointer"; // Makes it clear that it's clickable

        suggestionItem.addEventListener("click", () => {
          locationInput.value = feature.properties.formatted; // Set input to selected location
          suggestionsList.innerHTML = ""; // Clear suggestions
        });
        suggestionsList.appendChild(suggestionItem);
      });
    } else {
      const noResultsItem = document.createElement("li");
      noResultsItem.classList.add("list-group-item", "text-muted"); // Add a muted style for "No Results"
      noResultsItem.textContent = "No suggestions found";
      suggestionsList.appendChild(noResultsItem);
    }
  } catch (error) {
    console.error("Error fetching data from Geoapify:", error);
  }
}

/**
 * Appends the provided template to the node with the id contentId
 * @param {*} templ The HTML-Template to render
 * @param {string} contentId
 */
export function renderTemplate(templ, contentId) {
  const clone = templ.content.cloneNode(true);
  const content = document.getElementById(contentId);
  content.innerHTML = "";
  content.appendChild(clone);
}

/**
 * Loads an external file with an html-template, adds it to the body of your page, and returns the template
 * The file to be loaded can contain more than one template, but the one that will be returned must
 * be the first one in the file and this does not require an id
 * @param {string} page - Path to the file containing the template ('/templates/template.html')
 * @return {Promise<*>} On succesfull resolvement, the HtmlTemplate found in the file
 */
export async function loadTemplate(page) {
  const resHtml = await fetch(page).then((r) => {
    if (!r.ok) {
      throw new Error(`Failed to load the page: '${page}' `);
    }
    return r.text();
  });
  //const body = document.getElementsByTagName("BODY")[0];
  const div = document.createElement("div");
  div.innerHTML = resHtml;
  //body.appendChild(div)
  //return div.querySelector("template")
  return div.querySelector("template");
}

export function makeOptions(method, body, addToken) {
  const opts = {
    method: method,
    headers: {},
  };

  // Check if the request includes a file (formData)
  if (body instanceof FormData) {
    opts.body = body;
  } else if (body) {
    // For non-file requests, use JSON content type
    opts.headers["Content-Type"] = "application/json";
    opts.headers["Accept"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  if (addToken && localStorage.getItem("token")) {
    opts.headers.Authorization = "Bearer " + localStorage.getItem("token");
  }

  return opts;
}

/**
 * Only meant for when Navigo is set to use Hash based routing (Always this semester)
 * If users try to enter your site with only "/", it will change this to "/#/" as required
 * for Hash based routing
 * Call it before you start using the router (add the specific routes)
 */
export function adjustForMissingHash() {
  let path = window.location.hash;
  if (path == "") {
    //Do this only for hash
    path = "#/";
    window.history.pushState({}, path, window.location.href + path);
  }
}

/**
 * Sets active element on a div (or similar) containing a-tags (with data-navigo attributes ) used as a "menu"
 * Meant to be called in a before-hook with Navigo
 * @param topnav - Id for the element that contains the "navigation structure"
 * @param activeUrl - The URL which are the "active" one
 */
export function setActiveLink(topnav, activeUrl) {
  const links = document.getElementById(topnav).querySelectorAll("a");
  links.forEach((child) => {
    child.classList.remove("active");
    //remove leading '/' if any
    if (child.getAttribute("href").replace(/\//, "") === activeUrl) {
      child.classList.add("active");
    }
  });
}

/**
 * Small utility function to use in the first "then()" when fetching data from a REST API that supplies error-responses
 * as JSON
 * Use like this--> const responseData = await fetch(URL,{..}).then(handleHttpErrors)
 */
export async function handleHttpErrors(res) {
  if (!res.ok) {
    const errorResponse = await res.json();
    const error = new Error(errorResponse.message);
    //@ts-ignore
    error.apiError = errorResponse;
    throw error;
  }
  return res.json();
}

/**
 * Table-rows are required to be inside a table tag, so use this small utility function to santitize a string with TableRows only
 * (made from data with map)
 * SEE Here for info related to how to use DomPurify and the function below this semester here:
 * https://docs.google.com/document/d/14aC77ITi9sLCMruYUchu4L93dBqKnoja3I7TwR0lXw8/edit#heading=h.jj4ss771miw5
 */
export function sanitizeStringWithTableRows(tableRows) {
  let secureRows = DOMPurify.sanitize("<table>" + tableRows + "</table>");
  secureRows = secureRows.replace("<table>", "").replace("</table>", "");
  return secureRows;
}
export function sanitizeString(input) {
  return DOMPurify.sanitize(input);
}

export function updateNavbarLink() {
  const navbarLink = document.getElementById("nav-link-discover");
  const role = localStorage.getItem("role");

  if (role === "STUDENT") {
    navbarLink.href = "/discover";
  } else if (role === "COMPANY") {
    navbarLink.href = "/dashboard";
  } else {
    navbarLink.href = "/"; // Fallback for unknown roles
  }
}

export async function fetchUser(URL) {
  try {
    const username = localStorage.getItem("user");

    const user = await fetch(
      `${URL}/${username}`,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);

    return user;
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
}

export async function fetchCompany(URL, companyId) {
  try {
    const user = await fetch(
      `${URL}/${companyId}`,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);

    return user;
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
}

export function formatEnumName(value) {
  // Replace underscores with spaces and capitalize each word
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function renderProjects(projects, containerId) {
  const projectsContainer = document.getElementById(containerId);
  projectsContainer.innerHTML = projects
    .map((project) => generateProjectCard(project))
    .join("");
}

export function generateProjectCard(project) {
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
        <div id="project_${project.id}" class="card project-card-info mb-2">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">${sanitizeString(
              project.title
            )}</h5>           
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
}
