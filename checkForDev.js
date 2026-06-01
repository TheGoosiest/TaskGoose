function devModeCheck() {
    var username = document.forms["niceForm"]["usernameInput"].value;
    var password = document.forms["niceForm"]["passwordInput"].value;
    if (username === "admin" && password === "admin") {
        window.location.href = DEV_PAGE_URL; // Redirect to dev page
        return false; // Prevent form submission
    }  
}