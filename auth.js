// Enhanced Admin System with Full Access Control
document.addEventListener('DOMContentLoaded', function() {
    // Admin configuration (case-sensitive)
    const ADMIN_CONFIG = {
        emails: [
            'admin@rabbitcall.com', 
            'dallisairedddy1141@gmail.com'
        ],
        permissions: {
            manageUsers: true,
            configureSystem: true,
            accessAllRooms: true,
            modifySettings: true
        }
    };
    const USER_KEY = 'rabbitcall_user';

    // 1. Gmail Verification
    const verifyForm = document.getElementById('verifyForm');
    if (verifyForm) {
        verifyForm.onsubmit = function(e) {
            e.preventDefault();
            const email = document.getElementById('gmailInput').value.trim();
            
            // Allow both @gmail.com and @rabbitcall.com domains
            const emailDomain = email.toLowerCase().split('@')[1];
            if (!['gmail.com', 'rabbitcall.com'].includes(emailDomain)) {
                alert('Please enter a valid Rabbit Call or Gmail address');
                return;
            }

            // Check for admin
            const isAdmin = ADMIN_CONFIG.emails.includes(email);
            
            // Store session with admin permissions
            localStorage.setItem(USER_KEY, JSON.stringify({
                email: email,
                isVerified: true,
                isAdmin: isAdmin,
                permissions: isAdmin ? ADMIN_CONFIG.permissions : null,
                timestamp: Date.now()
            }));

            window.location.href = isAdmin ? 'admin-dashboard.html' : 'dashboard.html';
        };
    }

    // 2. Dashboard Protection and Admin Controls
    if (window.location.pathname.includes('dashboard.html')) {
        const userData = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        
        if (!userData || !userData.isVerified) {
            window.location.href = 'index.html';
            return;
        }

        // Set admin privileges
        if (userData.isAdmin) {
            // Show all admin controls
            document.querySelectorAll('.admin-control').forEach(el => {
                el.style.display = 'block';
            });
            
            // Enable all admin features
            document.body.classList.add('admin-mode');
        }
    }
});