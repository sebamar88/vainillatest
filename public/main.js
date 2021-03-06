const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('#accountData');

const deleteButton = (idDoc) => {
    let html = '';
    //Boton Borrar
    const deleteOpenModal =     
    `
    <!-- Button trigger modal -->
    <button type="button" class="btn btn-danger d-block w-50" data-bs-toggle="modal" data-bs-target="#${idDoc}">
    Delete Post
    </button>

    <!-- Modal -->
    <div class="modal fade" id="${idDoc}" tabindex="-1" aria-labelledby="${idDoc}Label" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="${idDoc}Label">Confirm the operation(Delete)</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <h3>Are you sure you want to delete this post?</h3>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" id="${idDoc}Confirm" class="btn btn-danger">Confirm Delete</button>
        </div>
        </div>
    </div>
    </div>
    `
    
    html += deleteOpenModal

    return html;
}

const updateButton = (idDoc, doc) => {
    //Boton Borrar
    let html = '';

    const updateOpenModal = `
        <button type="button" class="btn btn-warning d-block w-50" data-bs-toggle="modal" data-bs-target="#${idDoc}Update">
            Update Post
        </button>
    
        <!-- Modal -->
        <div class="modal fade" id="${idDoc}Update" tabindex="-1" aria-labelledby="${idDoc}UpdateLabel" aria-hidden="true">
            <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="${idDoc}UpdateLabel">Confirm the operation(Update)</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <h4 style="color: black;">Are you sure you want to update this post?</h4>
                    <form id="${idDoc}Form">
                        <input type="text" value="${doc.title}" id="updateTitle${idDoc}" class="form-control my-3">
                        <textarea class="form-control my-3" id="updateDescription${idDoc}">${doc.description}</textarea>
                        <select class="form-control my-3" id="updateVisibility${idDoc}">
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <button type="submit" id="${idDoc}ConfirmUpdate" class="btn btn-success">Confirm Update</button>
                    </form>
                </div>
                <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
            </div>
        </div>
    `;
    html += updateOpenModal;

    return html;
}
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
            console.log('Inicio de sesi??n exitoso')
        })
        .catch((error) => { // Error
            switch (error.code) {
                case 'auth/invalid-email':
                    errorToast.classList.toggle("show")
                    errorMsg.innerHTML = 'El formato del correo ingresado no es valido, verifica e intente de nuevo';
                break;
                case 'auth/user-not-found':
                    errorToast.classList.toggle("show")
                    errorMsg.innerHTML = 'No hay usuario registrado con ese correo, verifica e intente de nuevo';
                break;
                case 'auth/wrong-password':
                    errorToast.classList.toggle("show")
                    errorMsg.innerHTML = 'La contrase??a no es v??lida, verifica e intente de nuevo';
                break;
                default:
                break;
            }
        });
})

//Logout
const logoutButton = document.querySelector('#logout');

logoutButton.addEventListener('click', (e)=>{
    e.preventDefault();
    auth.signOut().then(()=>{
        console.log('Cerraste sesi??n de forma exitosa')
        location.reload();
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
//Publicaciones Publicas
const postPublicList = document.querySelector('.postsPublicos');
const renderPublicData = (doc, uid) => {
    const data = doc.data();
    const docId = doc.id;

    if(data.visibility == 'public'){
        let li = document.createElement('li')
    let title = document.createElement('h5')
    let description = document.createElement('p')
    let author = document.createElement('p')

    

    li.setAttribute('data-id', doc.id)
    title.textContent = data.title;
    description.textContent = data.description;
    author.textContent = "Author: " + data.author_name;
    

    li.className = "list-group-item list-group-item-success";
    author.className = "text-end";

    
        li.appendChild(title)
        li.appendChild(description)
        li.appendChild(author)
        if(data.author == uid){
            const ButtonContainer = document.createElement('div')
            ButtonContainer.className = 'd-flex justify-content-between my-2'
            const deleteOpenModal = deleteButton(docId);
            const updateOpenModal = updateButton(docId, data);
            
            ButtonContainer.insertAdjacentHTML("beforeend", deleteOpenModal)
            ButtonContainer.insertAdjacentHTML("beforeend", updateOpenModal)
            li.appendChild(ButtonContainer)
            
        }
        

        postPublicList.appendChild(li)

        if(data.author == uid){
            const buttonConfirm = document.querySelector(`#${docId}Confirm`)
            buttonConfirm.addEventListener('click', e => {
                e.stopPropagation();
                
                fs.collection('posts').doc(docId).delete().then((docRef) => {
                    console.log("Document successfully Deleted");
                    location.reload();
                })
                
            })
            const updateForm = document.querySelector(`#${docId}Form`);
            updateForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                const addTitle = document.querySelector(`#updateTitle${docId}`).value
                const addDescription = document.querySelector(`#updateDescription${docId}`).value
                let x = document.querySelector(`#updateVisibility${docId}`).selectedIndex;
                let visibilityOption = document.getElementsByTagName('option')[x].value;
                var user = firebase.auth().currentUser;
                if(addTitle.trim() != '' && addDescription.trim() != ''){
                    fs.collection('posts').doc(docId).set({
                    title: addTitle,
                    description: addDescription,
                    author: user.uid,
                    author_name: user.displayName,
                    visibility: visibilityOption
                    })
                    .then((docRef) => {
                        console.log("Document updated");
                        updateForm.reset();
                        location.reload();
                    })
                    .catch((error)=>{
                        console.error("Error updating document: ", error);
                    })
                }
            })
        }
        
    }
}

//Publicaciones Privadas
const postList = document.querySelector('.posts');
const renderPrivateData = (doc, uid) =>{
    const data = doc.data();
    const docId = doc.id;
    if(data.author == uid && data.visibility != "public"){
    let li = document.createElement('li')
    let title = document.createElement('h5')
    let description = document.createElement('p')


    li.setAttribute('data-id', doc.id)
    title.textContent = data.title;
    description.textContent = data.description;

    li.className = "list-group-item list-group-item-dark";

    //Boton Borrar    
    
    
    li.appendChild(title)
    li.appendChild(description)
    const ButtonContainer = document.createElement('div')
    ButtonContainer.className = 'd-flex justify-content-between my-2'
    const deleteOpenModal = deleteButton(docId);
    const updateOpenModal = updateButton(docId, data);
    
    ButtonContainer.insertAdjacentHTML("beforeend", deleteOpenModal)
    ButtonContainer.insertAdjacentHTML("beforeend", updateOpenModal)
    li.appendChild(ButtonContainer)

    
        

        postList.appendChild(li)

        
        const buttonConfirm = document.querySelector(`#${docId}Confirm`)
        buttonConfirm.addEventListener('click', e => {
            e.stopPropagation();
            let id = li.getAttribute('data-id');
            fs.collection('posts').doc(id).delete().then((docRef) => {
                console.log("Document successfully Deleted");
                location.reload();
            })
            
        })
        const updateForm = document.querySelector(`#${docId}Form`);
        updateForm.addEventListener('submit', (e)=>{
            e.preventDefault();
            const addTitle = document.querySelector(`#updateTitle${docId}`).value
            const addDescription = document.querySelector(`#updateDescription${docId}`).value
            let x = document.querySelector(`#updateVisibility${docId}`).selectedIndex;
            let visibilityOption = document.getElementsByTagName('option')[x].value;
            var user = firebase.auth().currentUser;
            if(addTitle.trim() != '' && addDescription.trim() != ''){
                fs.collection('posts').doc(docId).set({
                title: addTitle,
                description: addDescription,
                author: user.uid,
                author_name: user.displayName,
                visibility: visibilityOption
                })
                .then((docRef) => {
                    console.log("Document updated");
                    updateForm.reset();
                    location.reload();
                })
                .catch((error)=>{
                    console.error("Error updating document: ", error);
                })
            }
        })
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
    if(addTitle.trim() != '' && addDescription.trim() != ''){
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
            location.reload();
        })
        .catch((error)=>{
            console.error("Error adding document: ", error);
        })
    }
})



// Eventos
// list for auth state change
auth.onAuthStateChanged(user => {
    
    if(user){
        fs.collection('posts')
            .get()
            .then((snapshot)=>{
                snapshot.docs.forEach(doc =>{
                    renderPublicData(doc, user.uid)
                    renderPrivateData(doc, user.uid)
                })
                loginCheck(user);
            })
    }else{
        loginCheck(user);
    }
})

