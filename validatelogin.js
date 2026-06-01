const form = document.getElementById('form')
const usernameInput = document.getElementById('usernameInput')
const passwordInput = document.getElementById('passwordInput')
const errorMsg = document.getElementById('errorMsg')

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let errors = []

    errors = getLoginFormErrors(usernameInput.value, passwordInput.value)

    if(errors.length > 0){
        errorMsg.innerText = errors.join('. ')
    }
});

function getLoginFormErrors(username, password){
    let errors = []
    if(username === '' || username === null){
        errors.push('Username is required')
        usernameInput.parentElement.classList.add('incorrect')
    }
    
    if(password === '' || password === null){
        errors.push('Password is required')
        passwordInput.parentElement.classList.add('incorrect')
    }
    return errors;
}

const allInpt = [usernameInput, passwordInput].filter(input => input !== null);
allInpt.forEach(input => {
    input.addEventListener('input', () => {
        if(input.parentElement.classList.contains('incorrect')){
            input.parentElement.classList.remove('incorrect');
            errorMsg.innerText = '';
        }
    })
})

document.getElementById("login").addEventListener("click", async (e) => {
    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("passwordInput").value;
    if (!username || !password) return;

    await Login();

    document.getElementById("usernameInput").value = "";
    document.getElementById("passwordInput").value = "";
});

async function Login() {
    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorMsg.innerText = data.message;
            return;
        }

        errorMsg.innerText = 'Login successful!';
        form.reset();
        window.location.href = HOME_PAGE_URL;

    } catch (err) {
        console.error("Network / fetch error:", err);
        errorMsg.innerText = "An error occurred. Please try again later.";
    }
}