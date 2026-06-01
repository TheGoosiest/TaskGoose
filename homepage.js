function loadPage(url) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById("maincontent").innerHTML = html;

      if (url === "/profile") {
        updateProfile();
      }
    });
}

loadPage("/profile")

async function updateProfile() {
  try {
    const res = await fetch("/me");
    const data = await res.json();

    const display = document.getElementById("profilename");
    if (!display) return;

    display.textContent = data.logged_in ? data.username : "who are u???";
  } catch (err) {
    console.error("Failed to fetch user status:", err);
  }

  try {
    const res = await fetch("/me");
    const data = await res.json();

    const display = document.getElementById("profileemail");
    if (!display) return;

    display.textContent = data.logged_in ? data.email : "who are u???";
  } catch (err) {
    console.error("Failed to fetch user status:", err);
  }
}