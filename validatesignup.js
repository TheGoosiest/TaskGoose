const form = document.getElementById('form')
const usernameInput = document.getElementById('usernameInput')
const emailInput = document.getElementById('emailInput')
const passwordInput = document.getElementById('passwordInput')
const errorMsg = document.getElementById('errorMsg')

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let errors = []

    if(usernameInput){
        errors = getSignUpFormErrors(usernameInput.value, emailInput.value, passwordInput.value)
    }
    else{
        errors = getLoginFormErrors(emailInput.value, passwordInput.value)
    }

    if(errors.length > 0){
        errorMsg.innerText = errors.join('. ')
    }
});

function getSignUpFormErrors(username, email, password){
    let errors = []

    if(username === '' || username === null){
        errors.push('Username is required')
        usernameInput.parentElement.classList.add('incorrect')
    }

    if(email === '' || email === null){
        errors.push('Email is required')
        emailInput.parentElement.classList.add('incorrect')
    }
    
    if(password === '' || password === null){
        errors.push('Password is required')
        passwordInput.parentElement.classList.add('incorrect')
    }
    return errors;
}

const allInpt = [usernameInput, emailInput, passwordInput].filter(input => input !== null);
allInpt.forEach(input => {
    input.addEventListener('input', () => {
        if(input.parentElement.classList.contains('incorrect')){
            input.parentElement.classList.remove('incorrect');
            errorMsg.innerText = '';
        }
    })
})

document.getElementById("signup").addEventListener("click", async (e) => {

  const username = document.getElementById("usernameInput").value;
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  if (!username || !email || !password) return;

  await addUser();

  document.getElementById("usernameInput").value = "";
  document.getElementById("emailInput").value = "";
  document.getElementById("passwordInput").value = "";
});

async function addUser() {
    const username = document.getElementById("usernameInput").value;
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
        const response = await fetch("http://localhost:5000/add_user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        // ALWAYS try to read JSON
        const data = await response.json();

        if (!response.ok) {
            // ❌ backend rejected (409, 400, etc.)
            if (data.message === 'Invalid email') {
                emailInput.parentElement.classList.add('incorrect');
            }
            if (data.message === 'Password must be at least 8 characters long') {
                passwordInput.parentElement.classList.add('incorrect');
            }
            if (data.message === 'Username already exists') {
                usernameInput.parentElement.classList.add('incorrect');
            }
            errorMsg.innerText = data.message; // e.g., "User already exists."
            return;
        }

        errorMsg.innerText = 'User added successfully!';
        form.reset();
        window.location.href = HOME_PAGE_URL;

    } catch (err) {
        console.error("Network / fetch error:", err);
        errorMsg.innerText = "An error occurred. Please try again later.";
    }
}