const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('#accountData');

const loginCheck = (user) => {
    if(user){
        fs.collection('users').doc(user.uid).get().then(doc=>{
            const html = `
                <h1>Welcome ${doc.data().name}</h1>
                <p>Logged in as ${user.email}</p>
            `;
            accountDetails.innerHTML = html;
        }).catch(err=>{console.log(err)})        
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
    const signupName = document.querySelector('#signupName').value

    auth
        .createUserWithEmailAndPassword(signupEmail, signupPassword)
        .then(cred => {
            return fs.collection('users').doc(cred.user.uid).set({
                email: signupEmail,
                name: signupName
            });
            
        }).then(()=>{
            //clear form
            signupForm.reset();
            signupModal.hide();
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
        .then(cred => {
            return fs.collection('users').doc(cred.user.uid).set({
                email: cred.user.email,
                name: cred.user.displayName
            });
            
        })
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
        .then(cred => {
            return fs.collection('users').doc(cred.user.uid).set({
                email: cred.user.email,
                name: cred.user.displayName
            });
            
        })
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
        .then(cred => {
            return fs.collection('users').doc(cred.user.uid).set({
                email: cred.user.email,
                name: cred.user.displayName
            });
            
        })
        .then(result => {
            loginForm.reset();
            signinModal.hide();
        })
        .catch(err => {
            console.log(err)
        })
})

//Publicaciones publicas
const postPublicList = document.querySelector('.postsPublicos');
const setUpPublicPosts = (data) =>{
    if(data.length){
        let html = '';
        data.forEach(doc =>{
            const postData = doc.data();
            if(postData.visibility == "public"){
                const li = `
                <li class="list-group-item list-group-item-action">
                    <h5>${postData.title}</h5>
                    <p>${postData.description}</p>
                    <p class="text-end">Author: ${postData.author_name}</p>
                </li>`
                html += li;
            }
        });
        postPublicList.innerHTML = html;
    }else{
        postPublicList.innerHTML = `<p class="text-center">There are no posts yet, you can start writing them in the form below.</p>`
    }
}

//Publicaciones Privadas
const postList = document.querySelector('.posts');
const setUpPosts = (data, userId) =>{
    if(data.length){
        let html = '';
        data.forEach(doc =>{
            const postData = doc.data();
            if(postData.author == userId && postData.visibility != "public"){
                const li = `
                <li class="list-group-item list-group-item-action">
                    <h5>${postData.title}</h5>
                    <p>${postData.description}</p>
                </li>`
                html += li;
            }            
        });
        postList.innerHTML = html;
    }else{
        postList.innerHTML = `<p class="text-center">There are no posts yet, you can start writing them in the form below.</p>`
    }
}

//add Docs
const addPostForm = document.querySelector('#addForm');

addPostForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const addTitle = document.querySelector('#addTitle').value
    const addDescription = document.querySelector('#addDescription').value
    let x = document.querySelector('#addVisibility').selectedIndex;
    let visibilityOption = document.getElementsByTagName('option')[x].value;
    var user = firebase.auth().currentUser;
    fs.collection('posts').add({
        title: addTitle,
        description: addDescription,
        author: user.uid,
        author_name: user.displayName,
        visibility: visibilityOption
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        addPostForm.reset();
    })
    .catch((error)=>{
        console.error("Error adding document: ", error);
    })
})



// Eventos
// list for auth state change
auth.onAuthStateChanged(user => {
    
    if(user){
        fs.collection('posts')
            .get()
            .then((snapshot)=>{
                setUpPublicPosts(snapshot.docs)
                setUpPosts(snapshot.docs, user.uid);
                loginCheck(user);
            })
    }else{
        setUpPublicPosts([])
        setUpPosts([]);
        loginCheck(user);
    }
})

