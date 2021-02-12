import { init, redirect } from "../js/firebase.js";
import { wylogujUzytkownika } from "../js/auth.js";
import { getProjectsList, getProject, updateProject } from "../js/storage.js";

const state = {
    pid: localStorage.getItem("pid"),
    pidTemp: "",
}

const onAuth = { 
    cb: async () => {
        DOM.setUserName();
        avatarImgs.forEach(avatar => { if(firebase.auth().currentUser.photoURL) return avatar.src = firebase.auth().currentUser.photoURL });
        const {pid} = state;
        if(pid){
            const projectJSON = await getProject(pid);
            c.loadFromJSON(projectJSON, c.renderAll.bind(c));
            pidInput.value = pid;
            pidInput.disabled = true;
        } else {
            //New project
            const circle = new fabric.Circle({radius: 20});
            c.add(circle);
        }
    },
    once: false,
};
const onNonAuth = {
    cb: () => {
        redirect("/");
    },
    once: false,
}

init(onAuth, onNonAuth);

//DOM Hooks

const workSpace = document.querySelector("#workSpace");

const canvasElement = document.querySelector("canvas#cnv");
canvasElement.width = 60;
canvasElement.height = 60;
const saveBtn = document.querySelector("button#save");
const pidInput = document.querySelector("input#projectID");
const errorText = document.querySelector("span#error");
const exportBtn = document.querySelector("#export");
const avatarImgs = document.querySelectorAll(".avatar");
const usernameElement = document.querySelector("#username");


//DOM Props
const DOM = {
    handleSave: async (e) => {
        const {pid} = state;
        if(!pid){
            await APP.createProject(state.pidTemp, c);
        } else {
            await updateProject(state.pid, c);
        }
    },
    handlePidInput: (e) => {
        const val = e.target.value;
        state.pidTemp = val;
    },
    handleExport: e => {
        const data = c.toDataURL();
        e.target.href = data;
        e.target.download = state.pid || state.pidTemp;
    },
    setError: (err) => {
        errorText.textContent = err;
     },
     setUserName: () => {
         const user = firebase.auth().currentUser
         if(user.displayName){
            usernameElement.textContent = user.displayName;
         }
     }
};

//DOM Actions
saveBtn.addEventListener("click", e => DOM.handleSave(e));
pidInput.addEventListener("change", e => DOM.handlePidInput(e));
exportBtn.addEventListener("click", e => DOM.handleExport(e));

//APP Hooks
const c = new fabric.Canvas("cnv");

//APP Props 
const APP = {
    createProject: async (pid, canvas) => {
        if(pid === "") {
            DOM.setError("Please enter project name");
            return;
        }
        const uid = firebase.auth().currentUser.uid;
        const projects = await getProjectsList(uid);
        if(projects.some(({name}) => { name === pid})) {
            DOM.setError("Project name is already in use");
            return;
        }
        DOM.setError("");
        updateProject(pid, canvas);
    },
    saveProject: (pid, canvas) => {
        updateProject(pid, canvas);
    }
};

//Accordion 
// const accordion = document.querySelectorAll("#accordion .contentBox");
// console.log(accordion)

// for(let i = 0; i<accordion.length; i++){
//     accordion[i].addEventListener('click', function(){
//         this.classList.add('active')
//     })
// }



//Logout - sprawdzic czy to jest poprawnie zrobi - Gitarka zrobione :)
const loBtn = document.querySelector("#logout");
loBtn.addEventListener("click", wylogujUzytkownika);