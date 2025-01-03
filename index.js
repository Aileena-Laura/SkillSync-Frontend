import "./navigo_EditedByLars.js"; //Will create the global Navigo, with a few changes, object used below

import {
  setActiveLink,
  adjustForMissingHash,
  renderTemplate,
  loadTemplate,
} from "./utils.js";

import { initLogin, toggleLoginStatus, logout } from "./pages/login/login.js";
import { initSignupStudent } from "./pages/signup/signup-student.js";
import { initSignupCompany } from "./pages/signup/signup-company.js";
import { initProfile } from "./pages/profile/profile.js";
import { initDashboard } from "./pages/dashboard/dashboard.js";
import { initDiscover } from "./pages/discover/discover.js";
import { initCompanyInfo } from "./pages/companyInfo/company-info.js";
import { initHome } from "./pages/home/home.js";

//If token existed, for example after a refresh, set UI accordingly
const token = localStorage.getItem("token");
toggleLoginStatus(token);

window.addEventListener("load", async () => {
  const templateSignupStudent = await loadTemplate(
    "./pages/signup/signup-student.html"
  );
  const templateProfile = await loadTemplate("./pages/profile/profile.html");
  const templateSignupCompany = await loadTemplate(
    "./pages/signup/signup-company.html"
  );
  const templateLogin = await loadTemplate("./pages/login/login.html");
  const templateNotFound = await loadTemplate("./pages/notFound/notFound.html");
  const templateHome = await loadTemplate("./pages/home/home.html");
  const templateDashboard = await loadTemplate(
    "./pages/dashboard/dashboard.html"
  );
  const templateDiscover = await loadTemplate("./pages/discover/discover.html");
  const templateCompanyInfo = await loadTemplate(
    "./pages/companyInfo/company-info.html"
  );

  adjustForMissingHash();

  const router = new Navigo("/", { hash: true });
  //Not especially nice, BUT MEANT to simplify things. Make the router global so it can be accessed from all js-files
  window.router = router;

  router
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url);
        done();
      },
    })
    .on({
      "/": () => {
        renderTemplate(templateHome, "content");
        //initHome();
      },
      "/dropdown-0": () => {
        alert(0);
      },
      "/dropdown-1": () => {
        alert(1);
      },
      "/dashboard": () => {
        renderTemplate(templateDashboard, "content");
        initDashboard();
      },
      "/discover": () => {
        renderTemplate(templateDiscover, "content");
        initDiscover();
      },
      "/company-info": (match) => {
        renderTemplate(templateCompanyInfo, "content");
        initCompanyInfo(match);
      },
      "/signup/student": () => {
        renderTemplate(templateSignupStudent, "content");
        initSignupStudent();
      },
      "/signup/company": () => {
        renderTemplate(templateSignupCompany, "content");
        initSignupCompany();
      },
      "/login": (match) => {
        renderTemplate(templateLogin, "content");
        initLogin(match);
      },
      "/profile": () => {
        renderTemplate(templateProfile, "content");
        initProfile();
      },
      "/logout": () => {
        router.navigate("/");
        logout();
      },
    })
    .notFound(() => {
      renderTemplate(templateNotFound, "content");
    })
    .resolve();
});

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert(
    "Error: " +
      errorMsg +
      " Script: " +
      url +
      " Line: " +
      lineNumber +
      " Column: " +
      column +
      " StackTrace: " +
      errorObj
  );
};
