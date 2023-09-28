const studentButton = document.querySelector(".student");
const administrationButton = document.querySelector(".administration");

const tabPanel1 = document.querySelector(".tp1");
const tabPanel2 = document.querySelector(".tp2");

const showStudentPanel = () => {
    administrationButton.style.backgroundColor = "#FFF";
    administrationButton.style.color = "#000";
    tabPanel2.style.display = "none";
    tabPanel1.style.display = "block";
    tabPanel1.style.display = "flex";
    studentButton.style.backgroundColor = "#FBA1B7";
    studentButton.style.color = "#fff";
};

const showAdministerPanel = () => {
    studentButton.style.backgroundColor = "#FFF";
    studentButton.style.color = "#000";
    tabPanel1.style.display = "none";
    tabPanel2.style.display = "block";
    tabPanel2.style.display = "flex";
    administrationButton.style.backgroundColor = "#FBA1B7";
    administrationButton.style.color = "#fff";
};

studentButton.addEventListener("click", showStudentPanel);
administrationButton.addEventListener("click", showAdministerPanel);
