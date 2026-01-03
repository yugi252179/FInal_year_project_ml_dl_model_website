document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    
    // Sections
    const credsSection = document.getElementById('credentials-section');
    const otpSection = document.getElementById('otp-section');
    const displayEmail = document.getElementById('display-email');
    const otpInput = document.getElementById('otp-input');

    // Logic State
    let step = 1; // 1: Email/Pass, 2: OTP
    let generatedOTP = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (step === 1) {
            // --- STEP 1: VERIFY EMAIL & PASSWORD ---
            const email = emailInput.value;
            const password = passwordInput.value;

            // Simple validation
            if (password.length < 6) {
                alert("Password must be at least 6 characters.");
                return;
            }

            // Optional: Check against registered user in localStorage (from register.js)
            const registeredUser = JSON.parse(localStorage.getItem('registeredUser'));
            if (registeredUser) {
                if (registeredUser.email !== email || registeredUser.pass !== password) {
                    // For demo purposes, we will allow it but warn, or you can return; to block
                    console.warn("Credentials do not match registered user (Demo Mode Active)");
                }
            }

            // Simulate Network Request
            setLoading(true, "Authenticating...");
            await new Promise(r => setTimeout(r, 1200)); // 1.2s fake delay

            // Success -> Move to OTP
            step = 2;
            credsSection.classList.add('hidden');
            otpSection.classList.remove('hidden');
            displayEmail.innerText = email;
            
            // Generate Random 4-Digit OTP
            generatedOTP = Math.floor(1000 + Math.random() * 9000); 
            
            // Simulate Sending OTP (Alert Box)
            alert(`[PROGNOSYS SECURITY]\n\nYour One-Time Password (OTP) is: ${generatedOTP}`);
            
            setLoading(false, "Verify & Login");
            otpInput.focus();

        } else {
            // --- STEP 2: VERIFY OTP ---
            const userEnteredOTP = otpInput.value;

            if (userEnteredOTP == generatedOTP) {
                setLoading(true, "Redirecting...");
                
                // Save Session
                const userData = {
                    email: emailInput.value,
                    isLoggedIn: true,
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                // Ensure Profile Data exists (create default if missing)
                let existingProfile = JSON.parse(localStorage.getItem('userHealthProfile')) || {};
                if(!existingProfile.name) {
                    existingProfile.name = emailInput.value.split('@')[0]; // Default name from email
                    localStorage.setItem('userHealthProfile', JSON.stringify(existingProfile));
                }

                // Redirect to Dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);

            } else {
                alert("Incorrect OTP. Please try again.");
                otpInput.value = '';
                otpInput.classList.add('border-red-500'); // Red border error
                setTimeout(() => otpInput.classList.remove('border-red-500'), 2000);
            }
        }
    });

    // Helper: Button Loading Animation
    function setLoading(isLoading, text) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            // Insert Spinner Icon
            btnText.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg> ${text}`;
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            btnText.innerText = text;
        }
    }
});