document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const homeButton = document.getElementById('homeButton');

    const valid_email = 'a@a.com';
    const valid_password = '123456';

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
                window.location.href = "home.html";
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
});
