// Instant login with admin detection
document.addEventListener('DOMContentLoaded', function() {
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            
            // Check for admin emails
            const isAdmin = email === 'admin@rabbitcall.com' || 
                          email === 'dallisairedddy1141@gmail.com';
            
            // Store user data
            localStorage.setItem('user', JSON.stringify({
                email: email,
                isAdmin: isAdmin,
                timestamp: Date.now()
            }));

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
            return false;
        };
    }

    // On dashboard, check login
    if (window.location.pathname.includes('dashboard.html')) {
        const userData = localStorage.getItem('user');
        if (!userData) {
            window.location.href = 'login.html';
        } else {
            // Show admin controls if admin
            const user = JSON.parse(userData);
            if (user.isAdmin) {
                document.querySelectorAll('.admin-control').forEach(el => {
                    el.style.display = 'block';
                });
            }
        }
    }
});