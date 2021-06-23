const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');

const loginCheck = user => {
    if(user){
        loggedInLinks.forEach(link => link.style.display = 'block')
        loggedOutLinks.forEach(link => link.style.display = 'none')
    } else {
        loggedInLinks.forEach(link => link.style.display = 'none')
        loggedOutLinks.forEach(link => link.style.display = 'block')
    }
}

//Sign up
const signupForm = document.querySelector('#signupForm');
const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
const signinModal = new bootstrap.Modal(document.getElementById('loginModal'));

signupForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const signupEmail = document.querySelector('#signupEmail').value
    const signupPassword = document.querySelector('#signupPassword').value

    auth
        .createUserWithEmailAndPassword(signupEmail, signupPassword)
        .then(userCredential => {
            //clear form
            signupForm.reset();
            myModal.hide();
            console.log('Registrado de forma exitosa')
        })
})

//Login
const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const loginEmail = document.querySelector('#loginEmail').value
    const loginPassword = document.querySelector('#loginPassword').value

    auth
        .signInWithEmailAndPassword(loginEmail, loginPassword)
        .then(userCredential => {
            //clear form
            loginForm.reset();
            signinModal.hide();
            console.log('Inicio de sesión exitoso')
        })
})

//Logout
const logoutButton = document.querySelector('#logout');

logoutButton.addEventListener('click', (e)=>{
    e.preventDefault();
    auth.signOut().then(()=>{
        console.log('Cerraste sesión de forma exitosa')
    })
})

// Google Login
const googleButton = document.querySelector('#googleButton');
googleButton.addEventListener('click', (e)=>{
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            loginForm.reset();
            signinModal.hide();
        })
        .catch(err => {
            console.log(err)
        })
})

// Facebook Login
const facebookButton = document.querySelector('#facebookButton');
facebookButton.addEventListener('click', (e)=>{
    e.preventDefault();
    const provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            loginForm.reset();
            signinModal.hide();
        })
        .catch(err => {
            console.log(err)
        })
})

// Github Login
const githubButton = document.querySelector('#githubButton');
githubButton.addEventListener('click', (e)=>{
    e.preventDefault();
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            loginForm.reset();
            signinModal.hide();
        })
        .catch(err => {
            console.log(err)
        })
})

//Publicaciones
const postList = document.querySelector('.posts');
const setUpPosts = data =>{
    if(data.length){
        let html = '';
        data.forEach(doc =>{
            const postData = doc.data();
            const li = `
            <li class="list-group-item list-group-item-action">
                <h5>${postData.title}</h5>
                <p>${postData.description}</p>
            </li>`
            html += li;
        });
        postList.innerHTML = html;
    }else{
        postList.innerHTML = `<p class="text-center">Login to see Posts</p>`
    }
}


// Eventos
// list for auth state change
auth.onAuthStateChanged(user => {
    if(user){
        fs.collection('posts')
            .get()
            .then((snapshot)=>{
                setUpPosts(snapshot.docs);
                loginCheck(user);
            })
    }else{
        setUpPosts([]);
        loginCheck(user);
    }
})

