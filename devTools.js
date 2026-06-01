const errorMessage = document.getElementById("errorMessage");
console.log("errorMessage:",  document.getElementById("errorMessage"));


async function deleteUser(userId) {
  const response = await fetch(`http://localhost:5000/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
  });

  const data = await response.json();
  errorMessage.innerText = data.message;

  refreshUsers(); // re-fetch list
}