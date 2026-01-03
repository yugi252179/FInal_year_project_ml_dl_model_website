document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('register-form');
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passInput = document.getElementById('reg-pass');
    const confirmInput = document.getElementById('reg-confirm');
    const regBtn = document.getElementById('reg-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const pass = passInput.value;
        const confirm = confirmInput.value;

        // 1. Validation
        if (pass.length < 6) {
            alert("Password must be at least 6 characters long.");
            passInput.focus();
            return;
        }

        if (pass !== confirm) {
            alert("Passwords do not match.");
            confirmInput.value = "";
            confirmInput.focus();
            return;
        }

        // 2. Button Loading State
        const originalBtnText = regBtn.innerText;
        regBtn.innerText = "Creating Account...";
        regBtn.disabled = true;
        regBtn.classList.add('opacity-75', 'cursor-not-allowed');

        // 3. Simulate API Call / Save Data
        setTimeout(() => {
            
            // Save User Credentials (In a real app, this goes to a database)
            // We save it here so the Login page *could* technically check it, 
            // or just to prepopulate the dashboard.
            const userProfile = {
                name: name,
                email: email,
                joined: new Date().toLocaleDateString()
            };

            // This ensures when they log in next, the Dashboard knows their name
            localStorage.setItem('userHealthProfile', JSON.stringify(userProfile));
            
            // Optional: You could save 'registeredUser' to strictly check password in login.js
            localStorage.setItem('registeredUser', JSON.stringify({ email, pass }));

            alert("Account created successfully! Redirecting to Login...");
            
            // 4. Redirect to Login Page
            window.location.href = 'index.html';

        }, 1500); // 1.5 second delay to simulate processing
    });
});