import { init, redirect } from "../js/firebase.js";
import { wylogujUzytkownika } from "../js/auth.js";
import { getProjectsList, getThumbnails } from "../js/storage.js";

function setPID(pid) { 
    localStorage.setItem("pid", pid);
}


const onAuth = {
    cb: async () => {
        const user = firebase.auth().currentUser;
        avatarImgs.forEach(avatar => {if(user.photoURL) return avatar.src = user.photoURL });
        usernameEls.forEach(username => username.textContent = user.displayName);
        const projects = await getProjectsList(user.uid);
        const thumbs = await getThumbnails(projects);
        DOM.createThumbs(thumbsParent, thumbs);
    },
    once: false,
};
const onNonAuth = {
    cb: () => {
        redirect('/');
    },
    once: false,
};

init(onAuth, onNonAuth);

//App props
const APP = {
    logOut: () => { wylogujUzytkownika(); },
    createProject: () => {
        localStorage.removeItem("pid");
        window.location.assign("/editor");
    },
}

//DOM Hooks
const thumbsParent = document.querySelector("div#thumbs");
const logoutBtn = document.querySelector("#logout");
const createProjectBtn = document.querySelector("#createProject");
const avatarImgs = document.querySelectorAll(".avatar");
const usernameEls = document.querySelectorAll(".username");

//DOM Props
const DOM = {
    createThumbs: (parent, thumbs) => {
        let results = [];
        thumbs.forEach(thumb => {
            const thumbElement = document.createElement("div");
            //Maybe we will change that in a future
            thumbElement.id = thumb.pid;
            thumbElement.dataset.pid = thumb.pid;
            thumbElement.classList.add("thumbs-item");
            const thumbImg = document.createElement("img");
            thumbImg.src = thumb.url;
            thumbElement.append(thumbImg);
            const thumbName = document.createElement("p");
            thumbName.textContent = thumb.pid;
            thumbElement.addEventListener("click", e => {
                setPID(thumb.pid);
                location.assign("/editor/");
            });
            thumbElement.append(thumbName);
            results.push(thumbElement);
        });
        parent.prepend(...results);
    },
}

//DOM Actions
logoutBtn.addEventListener("click", APP.logOut);
createProjectBtn.addEventListener("click", APP.createProject);


