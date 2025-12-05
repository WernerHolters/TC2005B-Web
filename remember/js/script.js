// ========================================
// Remember - Login Script
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const homeButton = document.getElementById('homeButton');

    let valid_email = '';
    let valid_password = '';

    // Cargar credenciales desde JSON
    fetch('data/credentials.json')
        .then(response => response.json())
        .then(data => {
            valid_email = data.valid_email;
            valid_password = data.valid_password;
            console.log("Credentials loaded successfully");
        })
        .catch(error => {
            console.error("Error loading credentials:", error);
        });

    // Manejador del botón de login
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log("Login attempt with email:", email);

            if (!email || !password) {
                console.error("Error: Email and password are required.");
                return;
            }

            if (email === valid_email && password === valid_password) {
                console.log("Login successful!");
                console.log("Redirecting to home page...");
                window.location.href = "pages/home.html";
            } else {
                if (email !== valid_email) {
                    console.error("Error: User not found.");
                } else {
                    console.error("Error: Incorrect password.");
                }
            }
        });
    } else {
        console.error("Error: Login button not found in the document.");
    }

    // Manejador del botón de home
    if (homeButton) {
        homeButton.addEventListener('click', () => {
            console.log("Redirecting to home page...");
            window.location.href = "../index.html";
        });
    } else {
        console.error("Error: Home button not found in the document.");
    }
});
