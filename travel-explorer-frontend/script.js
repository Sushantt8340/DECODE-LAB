/**
 * BharatSafar - Travel Explorer & Booking Platform
 * Vanilla Javascript Implementation (Upgraded with Authentication, Payments, and Admin Controls)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- API Configuration ---
    const API_BASE = 'https://bharat-safar.onrender.com/api';

    // --- Global Custom Toast Notification Function ---
    const showToast = (message, type = 'success') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.position = 'fixed';
            container.style.bottom = '30px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            container.style.display = 'flex';
            container.style.flexDirection = 'column-reverse';
            container.style.gap = '10px';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `custom-toast toast-${type}`;
        
        toast.style.background = '#fff';
        toast.style.color = 'var(--dark-color)';
        toast.style.padding = '12px 18px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.15)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '12px';
        toast.style.minWidth = '280px';
        toast.style.maxWidth = '400px';
        toast.style.borderLeft = type === 'success' ? '5px solid #10b981' : (type === 'error' ? '5px solid #ef4444' : '5px solid #3b82f6');
        toast.style.fontFamily = "'Inter', sans-serif";
        toast.style.fontWeight = '500';
        toast.style.fontSize = '0.85rem';
        toast.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';

        let iconHtml = '';
        if (type === 'success') {
            iconHtml = '<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.1rem;"></i>';
        } else if (type === 'error') {
            iconHtml = '<i class="fa-solid fa-circle-xmark" style="color: #ef4444; font-size: 1.1rem;"></i>';
        } else {
            iconHtml = '<i class="fa-solid fa-circle-info" style="color: #3b82f6; font-size: 1.1rem;"></i>';
        }

        toast.innerHTML = `
            ${iconHtml}
            <div style="flex: 1; line-height: 1.4;">${message}</div>
            <button style="background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #bbb; padding: 0 0 0 5px; line-height: 1;" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    };
    window.showToast = showToast;

    // --- 1. Mobile Menu Toggle ---
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const closeMobileMenu = () => {
        if (hamburger) hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
    };
    window.closeMobileMenu = closeMobileMenu;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.id === 'nav-username') {
                e.preventDefault();
                return; // Do not close mobile menu when clicking Dashboard username
            }
            closeMobileMenu();
        });
    });

    // --- 2. Sticky Header ---
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 3. Scroll Animations (Intersection Observer) ---
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => scrollObserver.observe(el));

    // --- 4. User Session and Auth Header Management ---
    const navLoginBtn = document.getElementById('nav-login-btn');
    const navUserDropdown = document.getElementById('nav-user-dropdown');
    const navUsername = document.getElementById('nav-username');
    const dropdownMenu = navUserDropdown.querySelector('.dropdown-menu');
    const menuMyBookings = document.getElementById('menu-my-bookings');
    const menuAdminLink = document.getElementById('menu-admin-link');
    const menuAdminDashboard = document.getElementById('menu-admin-dashboard');
    const menuLogout = document.getElementById('menu-logout');

    let currentUser = null;
    let token = localStorage.getItem('token');

    // Get Auth Header
    const getAuthHeader = () => {
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    // Toggle Dropdown Menu
    navUsername.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isShown = dropdownMenu.style.display === 'block';
        dropdownMenu.style.display = isShown ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
        dropdownMenu.style.display = 'none';
    });

    // Close mobile menu when clicking any item inside user dropdown
    if (dropdownMenu) {
        dropdownMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });
    }

    // Update Navigation UI based on Auth State
    const updateWishlistBadges = () => {
        const count = (currentUser && currentUser.wishlist) ? currentUser.wishlist.length : 0;
        const navBadge = document.getElementById('nav-wishlist-count');
        const tabBadge = document.getElementById('tab-wishlist-count');

        [navBadge, tabBadge].forEach(badge => {
            if (!badge) return;
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline-block';
                // Trigger bounce animation
                badge.classList.remove('badge-bounce');
                void badge.offsetWidth; // force reflow
                badge.classList.add('badge-bounce');
            } else {
                badge.style.display = 'none';
            }
        });
    };

    const updateAuthUI = () => {
        if (token && currentUser) {
            navLoginBtn.style.display = 'none';
            navUserDropdown.style.display = 'block';
            navUsername.innerHTML = `<i class="fa-solid fa-circle-user"></i> Hi, ${currentUser.name.split(' ')[0]}`;
            
            // If admin, show Admin Desk link and hide My Bookings option
            if (currentUser.role === 'admin') {
                menuAdminLink.style.display = 'block';
                menuMyBookings.parentElement.style.display = 'none';
            } else {
                menuAdminLink.style.display = 'none';
                menuMyBookings.parentElement.style.display = 'block';
            }
        } else {
            navLoginBtn.style.display = 'block';
            navUserDropdown.style.display = 'none';
            menuAdminLink.style.display = 'none';
            menuMyBookings.parentElement.style.display = 'block';
        }

        // Sync wishlist heart states on cards
        document.querySelectorAll('.wishlist-btn[data-dest-id]').forEach(btn => {
            const destId = btn.getAttribute('data-dest-id');
            const isWishlisted = currentUser && currentUser.wishlist && currentUser.wishlist.includes(destId);
            if (isWishlisted) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
            }
        });

        // Update wishlist badge counters
        updateWishlistBadges();
    };

    // Fetch Profile on load to verify token validity
    const checkUserSession = async () => {
        if (!token) {
            updateAuthUI();
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success && data.data) {
                currentUser = data.data;
                updateAuthUI();
                startNotificationPolling();
                // Auto-redirect admin to Admin Panel on session restore
                if (currentUser.role === 'admin') {
                    // small delay so UI has time to render
                    setTimeout(() => openAdminModal(), 300);
                }
            } else {
                // Token invalid or expired
                logoutUser();
            }
        } catch (err) {
            console.error('Failed session check:', err);
            // Don't log out if network failed, wait for user action
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        token = null;
        currentUser = null;
        stopNotificationPolling();
        userNotificationsList = [];
        updateAuthUI();
        showToast('You have logged out successfully.', 'info');
    };

    menuLogout.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
    });

    // Menu: My Wishlist -> open dashboard wishlist tab
    const menuWishlist = document.getElementById('menu-wishlist');
    if (menuWishlist) {
        menuWishlist.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownMenu.style.display = 'none';
            openDashboardModal('wishlist');
        });
    }

    // --- 5. Auth Modal & Forms Handling ---
    const authModal = document.getElementById('auth-modal');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const linkForgotPassword = document.getElementById('link-forgot-password');
    const linkBackToLogin = document.getElementById('link-back-to-login');
    const authErrorMsg = document.getElementById('auth-error-msg');
    
    // Find the header tabs block inside authModal
    const authTabsContainer = authModal.querySelector('div[style*="display: flex; border-bottom: 1px solid #eee;"]');

    const openAuthModal = () => {
        authModal.style.display = 'flex';
        authErrorMsg.style.display = 'none';
        toggleAuthForm('login');
        if (typeof autofillSavedCredentials === 'function') {
            autofillSavedCredentials();
        }
    };

    const closeAuthModal = () => {
        authModal.style.display = 'none';
        loginForm.reset();
        signupForm.reset();
        if (forgotPasswordForm) forgotPasswordForm.reset();
        if (authTabsContainer) authTabsContainer.style.display = 'flex';
    };

    const toggleAuthForm = (mode) => {
        authErrorMsg.style.display = 'none';
        if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
        if (authTabsContainer) authTabsContainer.style.display = 'flex';
        
        if (mode === 'login') {
            tabLogin.style.borderBottom = '3px solid var(--primary-color)';
            tabLogin.style.color = 'var(--primary-color)';
            tabSignup.style.borderBottom = 'none';
            tabSignup.style.color = '#888';
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else {
            tabSignup.style.borderBottom = '3px solid var(--primary-color)';
            tabSignup.style.color = 'var(--primary-color)';
            tabLogin.style.borderBottom = 'none';
            tabLogin.style.color = '#888';
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
    };

    // Forgot Password navigation handlers
    const showForgotPasswordForm = (e) => {
        if (e) e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
        if (forgotPasswordForm) forgotPasswordForm.style.display = 'block';
        authErrorMsg.style.display = 'none';
        if (authTabsContainer) authTabsContainer.style.display = 'none';
    };

    if (linkForgotPassword) linkForgotPassword.addEventListener('click', showForgotPasswordForm);
    if (linkBackToLogin) linkBackToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthForm('login');
    });

    // Helper for password visibility toggle
    const setupPasswordToggle = (toggleId, inputId) => {
        const toggleIcon = document.getElementById(toggleId);
        const passwordInput = document.getElementById(inputId);
        if (toggleIcon && passwordInput) {
            toggleIcon.onclick = () => {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    toggleIcon.classList.remove('fa-eye');
                    toggleIcon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    toggleIcon.classList.remove('fa-eye-slash');
                    toggleIcon.classList.add('fa-eye');
                }
            };
        }
    };

    // Attach to window for inline onclick handlers in HTML
    window.closeAuthModal = closeAuthModal;
    window.toggleAuthForm = toggleAuthForm;

    navLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal();
    });

    // Login Form Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        authErrorMsg.style.display = 'none';
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                token = data.data.token;
                currentUser = data.data.user;
                localStorage.setItem('token', token);
                
                // Save/remove credentials based on Remember Me checkbox
                const rememberCheckbox = document.getElementById('login-remember');
                if (rememberCheckbox && rememberCheckbox.checked) {
                    localStorage.setItem('savedEmail', email);
                    localStorage.setItem('savedPassword', password);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('savedEmail');
                    localStorage.removeItem('savedPassword');
                    localStorage.setItem('rememberMe', 'false');
                }

                updateAuthUI();
                startNotificationPolling();
                closeAuthModal();
                closeMobileMenu();
                showToast(`Welcome back, ${currentUser.name}!`, 'success');
                
                // Automatically open Admin Dashboard modal immediately upon successful admin login
                if (currentUser.role === 'admin') {
                    openAdminModal();
                }
            } else {
                authErrorMsg.textContent = data.message || 'Login failed.';
                authErrorMsg.style.display = 'block';
            }
        } catch (err) {
            console.error('Login error:', err);
            authErrorMsg.textContent = 'Server communication failed. Please check connection.';
            authErrorMsg.style.display = 'block';
        }
    });

    // Signup Form Submit
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        authErrorMsg.style.display = 'none';
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (data.success) {
                token = data.data.token;
                currentUser = data.data.user;
                localStorage.setItem('token', token);
                updateAuthUI();
                startNotificationPolling();
                closeAuthModal();
                closeMobileMenu();
                showToast(`Account created successfully! Welcome, ${currentUser.name}!`, 'success');
            } else {
                authErrorMsg.textContent = data.message || 'Registration failed.';
                authErrorMsg.style.display = 'block';
            }
        } catch (err) {
            console.error('Signup error:', err);
            authErrorMsg.textContent = 'Server communication failed. Please check connection.';
            authErrorMsg.style.display = 'block';
        }
    });

    // Forgot Password Form Submit
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reset-email').value.trim();
            const newPassword = document.getElementById('reset-password').value;

            authErrorMsg.style.display = 'none';
            try {
                const res = await fetch(`${API_BASE}/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, newPassword })
                });
                const data = await res.json();
                if (data.success) {
                    showToast('Password reset successfully! You can now log in.', 'success');
                    // Return to login form and pre-fill credentials
                    toggleAuthForm('login');
                    document.getElementById('login-email').value = email;
                    document.getElementById('login-password').value = newPassword;
                } else {
                    authErrorMsg.textContent = data.message || 'Password reset failed.';
                    authErrorMsg.style.display = 'block';
                }
            } catch (err) {
                console.error('Password reset error:', err);
                authErrorMsg.textContent = 'Server communication failed. Please check connection.';
                authErrorMsg.style.display = 'block';
            }
        });
    }

    // Initialize password eye toggles
    setupPasswordToggle('toggle-login-password', 'login-password');
    setupPasswordToggle('toggle-signup-password', 'signup-password');
    setupPasswordToggle('toggle-reset-password', 'reset-password');

    // --- 6. Form Validation & API Integration ---
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    const destInput = document.getElementById('destination');
    const dateInput = document.getElementById('travel-date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        // Min date is today
        dateInput.min = `${yyyy}-${mm}-${dd}`;
        
        // Max date is today + 2 months (60 days)
        const maxDate = new Date();
        maxDate.setMonth(today.getMonth() + 2);
        const maxYyyy = maxDate.getFullYear();
        const maxMm = String(maxDate.getMonth() + 1).padStart(2, '0');
        const maxDd = String(maxDate.getDate()).padStart(2, '0');
        dateInput.max = `${maxYyyy}-${maxMm}-${maxDd}`;
    }
    const msgInput = document.getElementById('message');
    const formSuccess = document.getElementById('form-success');

    // New inputs for booking upgrade
    const adultsInput = document.getElementById('adults');
    const kidsInput = document.getElementById('kids');
    const packageInput = document.getElementById('package-type');
    const priceDisplayVal = document.getElementById('total-price-val');
    const paymentOptionsGroup = document.getElementById('payment-options-group');

    const isValidEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const isValidPhone = (phone) => {
        // Must be exactly 10 digits (optionally prefixed by country code)
        const clean = phone.replace(/[^\d]/g, '');
        return clean.length >= 10 && clean.length <= 13;
    };

    const validateInput = (input, validator, errorId) => {
        if (!input) return true;
        const formGroup = input.parentElement;
        if (!validator) {
            formGroup.classList.add('error');
            return false;
        } else {
            formGroup.classList.remove('error');
            return true;
        }
    };

    // --- WEATHER CACHE AND API LOOKUP ---
    const weatherCache = {};
    let currentDestWeather = { temp: '26°C', cond: 'Mild / Clear', rain: '10%', advice: 'Pack comfortable clothes. Check local festival guidelines.' };

    const fetchWeatherForCity = async (city) => {
        if (!city || city === 'other') return currentDestWeather;
        // Normalize city name (e.g. remove "Backwaters", "Ghats", "Valley", "Beach", "Palace", "Fort" etc.)
        let cleanCity = city.replace(/(Backwaters|Ghats|Valley|Beach|Palace|Fort|Mahal)/gi, '').trim();
        
        if (weatherCache[cleanCity]) return weatherCache[cleanCity];
        try {
            const res = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(cleanCity)}`);
            const resData = await res.json();
            if (resData.success && resData.data) {
                weatherCache[cleanCity] = resData.data;
                return resData.data;
            }
        } catch (err) {
            console.error('Error fetching weather:', err);
        }
        return { temp: '26°C', cond: 'Mild / Clear', rain: '10%', advice: 'Pack comfortable clothes. Check local guidelines.' };
    };

    let activePromoCode = '';
    let activeDiscountAmount = 0;

    // Calculate and update total price with itemized budget breakdown
    const updateTotalPrice = () => {
        if (!destInput || !adultsInput || !kidsInput || !packageInput || !priceDisplayVal) return;
        
        const destName = destInput.value;
        if (!destName || destName === 'other') {
            priceDisplayVal.textContent = '₹0';
            return;
        }

        const dest = destinations.find(d => (d.name || d.title || '') === destName);
        if (!dest) {
            priceDisplayVal.textContent = '₹0';
            return;
        }

        const basePrice = parseInt(String(dest.price || '0').replace(/[^\d]/g, ''), 10) || 0;

        // Package premiums
        let packageExtra = 0;
        if (packageInput.value === 'premium') packageExtra = 2000;
        else if (packageInput.value === 'luxury') packageExtra = 3000;

        const adults = parseInt(adultsInput.value, 10) || 1;
        const kids = parseInt(kidsInput.value, 10) || 0;

        // Formula: Base price + package upgrade + GST
        const baseCost = basePrice * adults + 1500 * kids;
        const transportCost = packageExtra * (adults + kids);
        const subtotal = baseCost + transportCost;
        const gst = Math.round(subtotal * 0.18);
        const preDiscountTotal = subtotal + gst;

        // Calculate discount
        activeDiscountAmount = 0;
        if (activePromoCode === 'BHARAT10') {
            activeDiscountAmount = Math.round(preDiscountTotal * 0.10);
        } else if (activePromoCode === 'EXPLORE20') {
            activeDiscountAmount = Math.round(preDiscountTotal * 0.20);
        } else if (activePromoCode === 'FIRSTTRIP') {
            activeDiscountAmount = Math.min(preDiscountTotal, 2000);
        }

        const finalTotal = Math.max(0, preDiscountTotal - activeDiscountAmount);

        // Update Budget Breakdown DOM
        const breakdownBase = document.getElementById('breakdown-base');
        const breakdownTransport = document.getElementById('breakdown-transport');
        const breakdownGst = document.getElementById('breakdown-gst');
        const discountRow = document.getElementById('breakdown-discount-row');
        const breakdownDiscount = document.getElementById('breakdown-discount');

        if (breakdownBase) breakdownBase.textContent = '₹' + baseCost.toLocaleString('en-IN');
        if (breakdownTransport) breakdownTransport.textContent = '₹' + transportCost.toLocaleString('en-IN');
        if (breakdownGst) breakdownGst.textContent = '₹' + gst.toLocaleString('en-IN');
        
        if (activeDiscountAmount > 0) {
            if (discountRow) discountRow.style.display = 'flex';
            if (breakdownDiscount) breakdownDiscount.textContent = '-₹' + activeDiscountAmount.toLocaleString('en-IN');
        } else {
            if (discountRow) discountRow.style.display = 'none';
        }

        priceDisplayVal.textContent = '₹' + finalTotal.toLocaleString('en-IN');

        // Update Live Weather Advisory Widget
        const weatherWidget = document.getElementById('weather-advisory-widget');
        if (weatherWidget) {
            const wTempEl = document.getElementById('weather-temp');
            const wCondEl = document.getElementById('weather-cond');
            const wRainEl = document.getElementById('weather-rain');
            const wAdvEl = document.getElementById('weather-advisory');

            if (wTempEl) wTempEl.textContent = currentDestWeather.temp;
            if (wCondEl) wCondEl.textContent = currentDestWeather.cond;
            if (wRainEl) wRainEl.textContent = 'Rain: ' + currentDestWeather.rain;
            if (wAdvEl) wAdvEl.textContent = currentDestWeather.advice;
            weatherWidget.style.display = 'block';
        }
    };

    const hideBookingFields = () => {
        if (document.getElementById('date-group')) document.getElementById('date-group').style.display = 'none';
        if (document.getElementById('guests-row')) document.getElementById('guests-row').style.display = 'none';
        if (document.getElementById('package-group')) document.getElementById('package-group').style.display = 'none';
        if (document.getElementById('price-display-group')) document.getElementById('price-display-group').style.display = 'none';
        if (document.getElementById('budget-breakdown-group')) document.getElementById('budget-breakdown-group').style.display = 'none';
        if (document.getElementById('promo-group')) document.getElementById('promo-group').style.display = 'none';
        if (document.getElementById('weather-advisory-widget')) document.getElementById('weather-advisory-widget').style.display = 'none';
        if (paymentOptionsGroup) paymentOptionsGroup.style.display = 'none';
        
        // Reset promo codes
        activePromoCode = '';
        activeDiscountAmount = 0;
        const promoInput = document.getElementById('promo-code');
        if (promoInput) promoInput.value = '';
        const promoMsg = document.getElementById('promo-msg');
        if (promoMsg) promoMsg.style.display = 'none';

        if (dateInput) dateInput.value = '';
        if (adultsInput) adultsInput.value = '1';
        if (kidsInput) kidsInput.value = '0';
        if (packageInput) packageInput.value = 'basic';
        if (priceDisplayVal) priceDisplayVal.textContent = '₹0';
    };

    // Toggle fields based on destination selection
    if (destInput) {
        const handleDestChange = () => {
            const isSpecificDest = destInput.value !== '' && destInput.value !== 'other';

            if (isSpecificDest && !token) {
                showToast('Please login to book a destination.', 'info');
                openAuthModal();
                destInput.value = '';
                hideBookingFields();
                return;
            }

            const dateGroup = document.getElementById('date-group');
            const guestsRow = document.getElementById('guests-row');
            const packageGroup = document.getElementById('package-group');
            const priceDisplayGroup = document.getElementById('price-display-group');
            const budgetGroup = document.getElementById('budget-breakdown-group');
            const promoGroup = document.getElementById('promo-group');

            if (isSpecificDest) {
                if (dateGroup) dateGroup.style.display = 'block';
                if (guestsRow) guestsRow.style.display = 'flex';
                if (packageGroup) packageGroup.style.display = 'block';
                if (priceDisplayGroup) priceDisplayGroup.style.display = 'block';
                if (budgetGroup) budgetGroup.style.display = 'block';
                if (promoGroup) promoGroup.style.display = 'block';
                if (paymentOptionsGroup) paymentOptionsGroup.style.display = 'block';
                
                const wTempEl = document.getElementById('weather-temp');
                const wCondEl = document.getElementById('weather-cond');
                const wRainEl = document.getElementById('weather-rain');
                const wAdvEl = document.getElementById('weather-advisory');
                const weatherWidget = document.getElementById('weather-advisory-widget');
                
                if (weatherWidget) {
                    if (wTempEl) wTempEl.textContent = '...';
                    if (wCondEl) wCondEl.textContent = 'Loading...';
                    if (wRainEl) wRainEl.textContent = '';
                    if (wAdvEl) wAdvEl.textContent = '';
                    weatherWidget.style.display = 'block';
                }

                fetchWeatherForCity(destInput.value).then(wData => {
                    currentDestWeather = wData;
                    updateTotalPrice();
                }).catch(err => {
                    console.error('Error in handleDestChange weather fetch:', err);
                    updateTotalPrice();
                });
            } else {
                hideBookingFields();
            }
        };

        destInput.addEventListener('change', handleDestChange);
        
        if (adultsInput) adultsInput.addEventListener('input', updateTotalPrice);
        if (kidsInput) kidsInput.addEventListener('input', updateTotalPrice);
        if (packageInput) packageInput.addEventListener('change', updateTotalPrice);

        handleDestChange();
    }

    // Submit Booking Data helper
    const submitBooking = (bookingPayload) => {
        return fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(bookingPayload)
        })
        .then(res => res.json());
    };

    if(contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const isDestSelected = destInput.value !== '';
            const isOtherSelected = destInput.value === 'other' || destInput.value === '';
            const needsDate = isDestSelected && destInput.value !== 'other';

            if (needsDate && !token) {
                showToast('Please login to book a destination.', 'error');
                openAuthModal();
                return;
            }

            const isNameValid = validateInput(nameInput, nameInput.value.trim() !== '', 'name-error');
            const isEmailValid = validateInput(emailInput, isValidEmail(emailInput.value.trim()), 'email-error');
            const isDestValid = validateInput(destInput, isDestSelected || msgInput.value.trim() !== '', 'dest-error');
            
            let isPhoneValid = true;
            if (needsDate) {
                isPhoneValid = validateInput(phoneInput, phoneInput.value.trim() !== '' && isValidPhone(phoneInput.value.trim()), 'phone-error');
            }

            const isDateValid = needsDate 
                ? validateInput(dateInput, dateInput.value !== '', 'date-error')
                : validateInput(dateInput, true, 'date-error');
            
            const isAdultsValid = needsDate 
                ? validateInput(adultsInput, parseInt(adultsInput.value, 10) >= 1, 'adults-error')
                : validateInput(adultsInput, true, 'adults-error');
            const isKidsValid = needsDate 
                ? validateInput(kidsInput, parseInt(kidsInput.value, 10) >= 0, 'kids-error')
                : validateInput(kidsInput, true, 'kids-error');

            const isMsgValid = !needsDate
                ? validateInput(msgInput, msgInput.value.trim() !== '', 'msg-error')
                : true;

            if (isNameValid && isEmailValid && isDestValid && isPhoneValid && isDateValid && isAdultsValid && isKidsValid && isMsgValid) {
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Processing... <i class="fa-solid fa-spinner fa-spin"></i>';

                try {
                    if (needsDate) {
                        // User is booking a trip
                        const paymentOption = contactForm.querySelector('input[name="paymentOption"]:checked').value;
                        const finalPrice = parseInt(priceDisplayVal.textContent.replace(/[^\d]/g, ''), 10);
                        
                        const basePayload = {
                            fullName: nameInput.value.trim(),
                            email: emailInput.value.trim(),
                            phone: phoneInput.value.trim(),
                            destination: destInput.value,
                            travelDate: dateInput.value,
                            adults: parseInt(adultsInput.value, 10),
                            kids: parseInt(kidsInput.value, 10),
                            packageType: packageInput.value,
                            totalPrice: finalPrice,
                            paymentOption: paymentOption
                        };

                        if (paymentOption === 'pay_online') {
                            // 1. Create Razorpay order on backend
                            const orderRes = await fetch(`${API_BASE}/payments/order`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ amount: finalPrice })
                            });
                            const orderResult = await orderRes.json();

                            if (!orderResult.success) {
                                throw new Error(orderResult.message || 'Razorpay order creation failed.');
                            }

                            const { orderId, keyId, isMock, amount } = orderResult.data;

                            if (isMock) {
                                // Sandbox simulation bypasses real Razorpay widget to avoid invalid Key ID error
                                const confirmPay = confirm(`[DEMO MODE] Confirm Simulated Razorpay Payment of ${priceDisplayVal.textContent}?`);
                                if (confirmPay) {
                                    try {
                                        submitBtn.innerHTML = 'Verifying Mock Payment... <i class="fa-solid fa-spinner fa-spin"></i>';
                                        
                                        const mockPaymentId = `pay_mock_${Date.now()}`;
                                        const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                razorpay_order_id: orderId,
                                                razorpay_payment_id: mockPaymentId,
                                                razorpay_signature: "mock_signature_sig123",
                                                isMock: true
                                            })
                                        });
                                        const verifyResult = await verifyRes.json();

                                        if (!verifyResult.success) {
                                            throw new Error('Mock payment verification failed.');
                                        }

                                        // Save actual booking
                                        const finalPayload = {
                                            ...basePayload,
                                            paymentStatus: 'paid',
                                            razorpayPaymentId: mockPaymentId
                                        };

                                        const bookingResult = await submitBooking(finalPayload);
                                        if (bookingResult.success) {
                                            showSuccessToast('Booking and Simulated Payment Completed Successfully!');
                                            contactForm.reset();
                                            hideBookingFields();
                                        } else {
                                            showToast(`Error saving booking: ${bookingResult.message}`, 'error');
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        showToast(`Mock Verification Error: ${err.message}`, 'error');
                                    } finally {
                                        submitBtn.disabled = false;
                                        submitBtn.innerHTML = originalBtnText;
                                    }
                                } else {
                                    submitBtn.disabled = false;
                                    submitBtn.innerHTML = originalBtnText;
                                }
                            } else {
                                // 2. Setup and open real Razorpay popup
                                const options = {
                                    key: keyId,
                                    amount: amount,
                                    currency: "INR",
                                    name: "Bharat Safar",
                                    description: `Trip Booking for ${destInput.value}`,
                                    order_id: orderId,
                                    handler: async function (response) {
                                        // 3. Verify signature
                                        try {
                                            submitBtn.innerHTML = 'Verifying Payment... <i class="fa-solid fa-spinner fa-spin"></i>';
                                            
                                            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    razorpay_order_id: response.razorpay_order_id,
                                                    razorpay_payment_id: response.razorpay_payment_id,
                                                    razorpay_signature: response.razorpay_signature,
                                                    isMock: isMock
                                                })
                                            });
                                            const verifyResult = await verifyRes.json();

                                            if (!verifyResult.success) {
                                                throw new Error('Payment signature verification failed.');
                                            }

                                            // 4. Save actual booking
                                            const finalPayload = {
                                                ...basePayload,
                                                paymentStatus: 'paid',
                                                razorpayPaymentId: response.razorpay_payment_id
                                            };

                                            const bookingResult = await submitBooking(finalPayload);
                                            if (bookingResult.success) {
                                                showSuccessToast('Booking and Payment Completed Successfully!');
                                                contactForm.reset();
                                                hideBookingFields();
                                            } else {
                                                showToast(`Error saving booking: ${bookingResult.message}`, 'error');
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            showToast(`Verification Error: ${err.message}`, 'error');
                                        } finally {
                                            submitBtn.disabled = false;
                                            submitBtn.innerHTML = originalBtnText;
                                        }
                                    },
                                    prefill: {
                                        name: nameInput.value.trim(),
                                        email: emailInput.value.trim(),
                                        contact: phoneInput.value.trim()
                                    },
                                    theme: {
                                        color: "#ff6f61"
                                    },
                                    modal: {
                                        ondismiss: function () {
                                            console.log('Payment modal dismissed');
                                            submitBtn.disabled = false;
                                            submitBtn.innerHTML = originalBtnText;
                                        }
                                    }
                                };

                                const rzp1 = new Razorpay(options);
                                rzp1.open();
                            }
                        } else {
                            // Pay After Callback Option
                            const finalPayload = {
                                ...basePayload,
                                paymentStatus: 'pending'
                            };

                            const data = await submitBooking(finalPayload);
                            if (data.success) {
                                showSuccessToast('Booking requested successfully! Our travel expert will call you on your phone number within 24 hours to confirm dates and arrange payment.');
                                contactForm.reset();
                                hideBookingFields();
                            } else {
                                showSuccessToast(data.message || 'Error processing request.', false);
                            }
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = originalBtnText;
                        }
                    } else {
                        // General query or generic contact message
                        const res = await fetch(`${API_BASE}/contact`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: nameInput.value.trim(),
                                email: emailInput.value.trim(),
                                message: msgInput.value.trim()
                            })
                        });
                        const data = await res.json();
                        if (data.success) {
                            showSuccessToast('Thank you! Your message has been sent successfully.');
                            contactForm.reset();
                        } else {
                            showSuccessToast(data.message || 'Failed to submit form.', false);
                        }
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                } catch (err) {
                    console.error('Request failed:', err);
                    showSuccessToast('Offline Demo: Action recorded successfully (Test Network Sandbox)!', true);
                    contactForm.reset();
                    hideBookingFields();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    const showSuccessToast = (msg, isSuccess = true) => {
        formSuccess.style.display = 'block';
        formSuccess.textContent = msg;
        if (isSuccess) {
            formSuccess.style.color = '#10b981';
            formSuccess.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            formSuccess.style.border = '1px solid #10b981';
        } else {
            formSuccess.style.color = '#ef4444';
            formSuccess.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            formSuccess.style.border = '1px solid #ef4444';
        }
        setTimeout(() => {
            formSuccess.style.display = 'none';
        }, 6000);
    };

    // --- 7. Famous Indian Destinations Data Loading & Classification ---
    let destinations = [];
    const destGrid = document.getElementById('destinations-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchMsg = document.getElementById('search-result-message');

    // Categorization logic based on ID list or description keywords
    const getDestinationCategory = (dest) => {
        if (!dest) return 'other';
        const id = String(dest.id || dest._id || '').toLowerCase();
        const desc = String(dest.desc || dest.description || '').toLowerCase();
        const name = String(dest.name || dest.title || '').toLowerCase();

        // 1. Exact ID classification
        const beachIds = ['goa', 'alleppey', 'andaman', 'pondicherry', 'kanyakumari'];
        const mountainIds = ['ladakh', 'darjeeling', 'munnar', 'shimla', 'manali', 'srinagar', 'tawang', 'gangtok', 'ooty', 'coorg', 'mahabaleshwar', 'nainital', 'cherrapunji', 'valley'];
        const heritageIds = ['agra', 'jaipur', 'udaipur', 'hampi', 'ranthambore', 'jaisalmer', 'khajuraho', 'ajanta', 'mysore', 'kutch'];
        const spiritualIds = ['varanasi', 'rishikesh', 'amritsar', 'madurai'];

        if (beachIds.includes(id)) return 'beach';
        if (mountainIds.includes(id)) return 'mountain';
        if (heritageIds.includes(id)) return 'heritage';
        if (spiritualIds.includes(id)) return 'spiritual';

        // 2. Keyword fallback (helps with custom admin-added destinations)
        if (desc.includes('beach') || desc.includes('sea') || desc.includes('island') || desc.includes('ocean') || desc.includes('coastal') || name.includes('beach')) {
            return 'beach';
        }
        if (desc.includes('mountain') || desc.includes('hill') || desc.includes('valley') || desc.includes('himalayan') || desc.includes('snow') || desc.includes('trek') || desc.includes('altitude')) {
            return 'mountain';
        }
        if (desc.includes('temple') || desc.includes('spiritual') || desc.includes('holy') || desc.includes('ganga') || desc.includes('sikhism') || desc.includes('shikara') || desc.includes('monastery') || name.includes('temple')) {
            return 'spiritual';
        }
        
        // Default to heritage
        return 'heritage';
    };

    // Filter/Sort State
    let activeCategory = 'all';
    let activeSort = 'default';
    let searchQuery = '';
    let currentCount = 0;
    const itemsPerLoad = 9;

    // Filter tabs click handling
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = tab.getAttribute('data-category');
            renderDestinationsGrid(true);
        });
    });

    // Sort select change handling
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            activeSort = sortSelect.value;
            renderDestinationsGrid(true);
        });
    }

    // Dynamic dropdown options helper
    const populateDestinationDropdown = (list) => {
        if (!destInput) return;
        destInput.innerHTML = '<option value="" disabled selected>Select a destination</option>';
        list.forEach(dest => {
            const opt = document.createElement('option');
            opt.value = dest.name;
            opt.textContent = dest.name;
            destInput.appendChild(opt);
        });
        const otherOpt = document.createElement('option');
        otherOpt.value = 'other';
        otherOpt.textContent = 'Other / General Query';
        destInput.appendChild(otherOpt);
    };

    // Generate HTML for a single destination card
    const createDestCard = (dest, delay) => {
        const destId = dest.id || dest._id || '';
        const destName = dest.name || dest.title || '';
        const destDesc = dest.desc || dest.description || '';
        const destImg = dest.img || dest.image || '';
        const destPrice = dest.price || '';
        const destRating = dest.rating || '4.5';
        
        const isWishlisted = currentUser && currentUser.wishlist && currentUser.wishlist.includes(destId);
        const escapedName = destName.replace(/'/g, "\\'");
        
        return `
            <div class="destination-card animate-on-scroll" style="transition-delay: ${delay}s;">
                <div class="card-img-wrapper">
                    <div class="card-price">From ${destPrice}</div>
                    <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-dest-id="${destId}" onclick="toggleWishlist(event, '${destId}')" title="Save to Wishlist">
                        <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                    <!-- Compare Checkbox Label -->
                    <label style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; z-index: 5;" onclick="event.stopPropagation()">
                        <input type="checkbox" class="compare-checkbox" data-dest-id="${destId}" data-dest-name="${escapedName}" onchange="toggleCompareDestination(this)" style="cursor: pointer;"> Compare
                    </label>
                    <img src="${destImg}" alt="${destName}" loading="lazy" onerror="this.onerror=null;this.style.objectFit='none';this.style.background='linear-gradient(135deg,#1a1a2e,#16213e)';this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'260\' viewBox=\'0 0 400 260\'%3E%3Crect fill=\'%231a1a2e\' width=\'400\' height=\'260\'/%3E%3Ctext fill=\'%23ffffff44\' font-size=\'40\' text-anchor=\'middle\' x=\'200\' y=\'140\'%3E🏛%3C/text%3E%3C/svg%3E';">
                </div>
                <div class="card-content">
                    <div class="card-location"><i class="fa-solid fa-map-pin"></i> India</div>
                    <h3 class="card-title">${destName}</h3>
                    <p class="card-desc">${destDesc}</p>
                    <div class="card-footer">
                        <div class="card-rating" data-dest-id="${destId}" onclick="openReviewsModal('${destId}', '${escapedName}')" title="View Reviews">
                            <i class="fa-solid fa-star"></i>
                            <span class="rating-num">${destRating}</span>
                            <span class="reviews-count">(...)</span>
                        </div>
                        <a href="#contact" onclick="selectDestinationForBooking('${escapedName}')" class="btn btn-primary-outline" style="padding: 6px 15px; font-size: 0.9rem;">Book</a>
                    </div>
                </div>
            </div>
        `;
    };

    // Filter, sort and render list to Grid
    const renderDestinationsGrid = (reset = false) => {
        if (reset) {
            destGrid.innerHTML = '';
            currentCount = 0;
        }

        // Apply filters
        let list = [...destinations];
        
        if (searchQuery) {
            list = list.filter(d => 
                d.name.toLowerCase().includes(searchQuery) || 
                d.desc.toLowerCase().includes(searchQuery)
            );
        }

        if (activeCategory !== 'all') {
            list = list.filter(d => getDestinationCategory(d) === activeCategory);
        }

        // Apply price slider filter
        const priceSlider = document.getElementById('price-range-slider');
        if (priceSlider) {
            const maxPrice = parseInt(priceSlider.value, 10);
            list = list.filter(d => {
                const price = parseInt(d.price.replace(/[^\d]/g, ''), 10) || 0;
                return price <= maxPrice;
            });
        }

        // Apply star rating filter
        const starRatingFilter = document.getElementById('star-rating-filter');
        if (starRatingFilter) {
            const minRating = parseFloat(starRatingFilter.value);
            if (minRating > 0) {
                list = list.filter(d => {
                    const rating = d.dynamicRating !== undefined ? d.dynamicRating : parseFloat(d.rating);
                    return rating >= minRating;
                });
            }
        }

        // Apply sorting
        if (activeSort === 'price-asc') {
            list.sort((a, b) => {
                const pA = parseInt(a.price.replace(/[^\d]/g, ''), 10) || 0;
                const pB = parseInt(b.price.replace(/[^\d]/g, ''), 10) || 0;
                return pA - pB;
            });
        } else if (activeSort === 'price-desc') {
            list.sort((a, b) => {
                const pA = parseInt(a.price.replace(/[^\d]/g, ''), 10) || 0;
                const pB = parseInt(b.price.replace(/[^\d]/g, ''), 10) || 0;
                return pB - pA;
            });
        } else if (activeSort === 'rating') {
            list.sort((a, b) => {
                const rA = a.dynamicRating !== undefined ? a.dynamicRating : parseFloat(a.rating);
                const rB = b.dynamicRating !== undefined ? b.dynamicRating : parseFloat(b.rating);
                return rB - rA;
            });
        }

        // Slice & Render
        const toRender = list.slice(currentCount, currentCount + itemsPerLoad);
        toRender.forEach((dest, index) => {
            const delay = (index % itemsPerLoad) * 0.1;
            destGrid.insertAdjacentHTML('beforeend', createDestCard(dest, delay));
        });

        currentCount += toRender.length;

        // Fetch dynamic reviews statistics and update stars on loaded cards
        updateCardRatings();

        // Sync compare checkboxes
        if (window.syncCompareCheckboxes) window.syncCompareCheckboxes();

        // Animate elements on scroll
        const newElements = destGrid.querySelectorAll('.animate-on-scroll:not(.show)');
        newElements.forEach(el => scrollObserver.observe(el));

        // Manage load more button visibility
        if (currentCount >= list.length) {
            loadMoreBtn.parentElement.style.display = 'none';
        } else {
            loadMoreBtn.parentElement.style.display = 'block';
        }
    };

    // Load More Button
    loadMoreBtn.addEventListener('click', () => {
        renderDestinationsGrid(false);
    });

    // Search Box Form Handler
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        searchQuery = searchInput.value.trim().toLowerCase();
        
        searchMsg.style.display = 'block';
        
        // Find total matching
        let filteredCount = destinations.filter(d => 
            d.name.toLowerCase().includes(searchQuery) || 
            d.desc.toLowerCase().includes(searchQuery)
        ).length;

        if (filteredCount > 0) {
            searchMsg.innerHTML = `Found ${filteredCount} destinations matching "<strong>${searchQuery}</strong>"`;
            searchMsg.style.color = 'var(--dark-color)';
        } else {
            searchMsg.innerHTML = `No destinations found matching "<strong>${searchQuery}</strong>". Try another keyword.`;
            searchMsg.style.color = 'var(--primary-color)';
        }

        renderDestinationsGrid(true);
        document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' });
    });

    // Handle "Book" button clicks on cards
    if (destGrid) {
        destGrid.addEventListener('click', (e) => {
            const bookBtn = e.target.closest('.btn');
            if (bookBtn && bookBtn.textContent.trim().toLowerCase() === 'book') {
                const card = bookBtn.closest('.destination-card');
                if (card) {
                    const destTitle = card.querySelector('.card-title').textContent.trim();
                    if (destInput) {
                        let matchFound = false;
                        for (let i = 0; i < destInput.options.length; i++) {
                            if (destInput.options[i].value === destTitle) {
                                destInput.selectedIndex = i;
                                matchFound = true;
                                break;
                            }
                        }
                        if (!matchFound) {
                            destInput.value = 'other';
                        }
                        destInput.dispatchEvent(new Event('change'));
                        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });
    }

    const setupPriceSlider = () => {
        const priceSlider = document.getElementById('price-range-slider');
        const priceSliderVal = document.getElementById('price-slider-val');
        if (!priceSlider || destinations.length === 0) return;

        const maxVal = destinations.reduce((max, d) => {
            const price = parseInt(d.price.replace(/[^\d]/g, ''), 10) || 0;
            return price > max ? price : max;
        }, 80000);

        priceSlider.max = maxVal;
        priceSlider.value = maxVal;
        if (priceSliderVal) priceSliderVal.textContent = `₹${maxVal.toLocaleString('en-IN')}`;
    };

    // Fetch destinations from backend API
    const loadDestinations = () => {
        fetch(`${API_BASE}/destinations`)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    destinations = data.data;
                    populateDestinationDropdown(destinations);
                    setupPriceSlider();
                    renderDestinationsGrid(true);
                }
            })
            .catch(err => {
                console.error('Error fetching destinations:', err);
                // Failback static array in memory if server is offline
                destinations = [
                    { name: "Taj Mahal, Agra", price: "₹5,000", rating: "4.9", desc: "A symbol of love and a UNESCO World Heritage Site.", id: "agra", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/500px-Taj_Mahal_%28Edited%29.jpeg" },
                    { name: "Jaipur, Rajasthan", price: "₹7,500", rating: "4.7", desc: "The Pink City known for its stunning forts and Hawa Mahal palace.", id: "jaipur", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/500px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg" },
                    { name: "Varanasi, UP", price: "₹4,000", rating: "4.8", desc: "The spiritual capital of India on the banks of river Ganga.", id: "varanasi", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg/500px-Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg" },
                    { name: "Leh Ladakh", price: "₹15,000", rating: "4.9", desc: "Breathtaking landscapes, high passes, and Buddhist monasteries.", id: "ladakh", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Road_Padum_Zanskar_Range_Jun24_A7CR_00818.jpg/500px-Road_Padum_Zanskar_Range_Jun24_A7CR_00818.jpg" },
                    { name: "Goa Beaches", price: "₹10,000", rating: "4.8", desc: "Famous for its pristine beaches, nightlife, and Portuguese heritage.", id: "goa", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/BeachFun.jpg/500px-BeachFun.jpg" },
                    { name: "Alleppey, Kerala", price: "₹8,000", rating: "4.7", desc: "Experience the tranquil backwaters in a traditional houseboat.", id: "alleppey", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Alappuzha_Boat_Beauty_W.jpg/500px-Alappuzha_Boat_Beauty_W.jpg" },
                    { name: "Rishikesh", price: "₹4,500", rating: "4.6", desc: "The Yoga capital of the world and a hub for river rafting.", id: "rishikesh", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Trayambakeshwar_Temple_VK.jpg/500px-Trayambakeshwar_Temple_VK.jpg" },
                    { name: "Darjeeling", price: "₹6,000", rating: "4.7", desc: "Queen of the Hills, famous for tea gardens and toy train.", id: "darjeeling", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/DarjeelingTrainFruitshop_%282%29.jpg/500px-DarjeelingTrainFruitshop_%282%29.jpg" },
                    { name: "Munnar, Kerala", price: "₹7,000", rating: "4.8", desc: "Idyllic hill station with sprawling tea plantations.", id: "munnar", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Munnar_Overview.jpg/500px-Munnar_Overview.jpg" },
                    { name: "Udaipur, Rajasthan", price: "₹9,000", rating: "4.9", desc: "City of Lakes, known for its majestic City Palace and Lake Palace.", id: "udaipur", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Evening_view%2C_City_Palace%2C_Udaipur.jpg/500px-Evening_view%2C_City_Palace%2C_Udaipur.jpg" }
                ];
                populateDestinationDropdown(destinations);
                setupPriceSlider();
                renderDestinationsGrid(true);
            });
    };

    loadDestinations();

    // --- 8. Customer Dashboard (My Bookings Modal & Notification Center) ---
    const dashboardModal = document.getElementById('dashboard-modal');
    const userBookingsContainer = document.getElementById('user-bookings-container');
    const userNotificationsContainer = document.getElementById('user-notifications-container');
    const custTabBookings = document.getElementById('cust-tab-bookings');
    const custTabNotifications = document.getElementById('cust-tab-notifications');
    const menuNotifications = document.getElementById('menu-notifications');

    let activeCustomerTab = 'bookings';
    let userNotificationsList = [];
    let notificationPollInterval = null;

    const switchCustomerTab = (tabName) => {
        activeCustomerTab = tabName;
        
        const tabs = [
            { name: 'bookings', btn: custTabBookings, container: userBookingsContainer },
            { name: 'notifications', btn: custTabNotifications, container: userNotificationsContainer },
            { name: 'wishlist', btn: document.getElementById('cust-tab-wishlist'), container: document.getElementById('user-wishlist-container') },
            { name: 'splitter', btn: document.getElementById('cust-tab-splitter'), container: document.getElementById('user-splitter-container') },
            { name: 'planner', btn: document.getElementById('cust-tab-planner'), container: document.getElementById('user-planner-container') }
        ];

        tabs.forEach(t => {
            if (t.btn) {
                t.btn.style.color = '#888';
                t.btn.style.borderBottom = 'none';
            }
            if (t.container) {
                t.container.style.display = 'none';
            }
        });

        const activeTab = tabs.find(t => t.name === tabName);
        if (activeTab) {
            if (activeTab.btn) {
                activeTab.btn.style.color = 'var(--primary-color)';
                activeTab.btn.style.borderBottom = '3px solid var(--primary-color)';
            }
            if (activeTab.container) {
                activeTab.container.style.display = 'block';
            }
        }

        if (tabName === 'notifications') {
            renderUserNotifications();
        } else if (tabName === 'wishlist') {
            renderWishlist();
        } else if (tabName === 'splitter') {
            if (window.renderSplitterMembers) window.renderSplitterMembers();
            if (window.updateSplitterDropdowns) window.updateSplitterDropdowns();
            if (window.renderSplitterExpenses) window.renderSplitterExpenses();
            if (window.calculateSplitterBalances) window.calculateSplitterBalances();
        } else if (tabName === 'planner') {
            // No action needed as planner loads per booking selection
        }
    };
    window.switchCustomerTab = switchCustomerTab;

    const openDashboardModal = async (defaultTab = 'bookings') => {
        if (!token) {
            showToast('Please login to view your portal.', 'info');
            openAuthModal();
            return;
        }

        dashboardModal.style.display = 'flex';
        switchCustomerTab(defaultTab);
        
        if (userBookingsContainer) {
            userBookingsContainer.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2xl" style="color: var(--primary-color);"></i><p style="margin-top: 10px; font-weight: 500;">Retrieving bookings...</p></div>';
        }

        try {
            const res = await fetch(`${API_BASE}/bookings`, {
                headers: getAuthHeader()
            });
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                renderUserBookings(data.data);
                if (window.updatePlannerBookingSelect) window.updatePlannerBookingSelect(data.data);
                if (window.renderSplitterMembers) window.renderSplitterMembers();
                if (window.updateSplitterDropdowns) window.updateSplitterDropdowns();
                if (window.renderSplitterExpenses) window.renderSplitterExpenses();
                if (window.calculateSplitterBalances) window.calculateSplitterBalances();
            } else {
                if (userBookingsContainer) {
                    userBookingsContainer.innerHTML = `<div style="color: #ef4444; text-align: center; padding: 20px; font-weight: 500;">Failed: ${data.message}</div>`;
                }
            }
        } catch (err) {
            console.error('Fetch bookings error:', err);
            if (userBookingsContainer) {
                userBookingsContainer.innerHTML = '<div style="color: #ef4444; text-align: center; padding: 20px; font-weight: 500;">Server communication error.</div>';
            }
        }

        // Freshly load notifications (non-quiet to update list immediately)
        loadNotifications(false);
    };

    const closeDashboardModal = () => {
        dashboardModal.style.display = 'none';
    };

    const renderUserBookings = (bookings) => {
        if (!userBookingsContainer) return;
        if (bookings.length === 0) {
            userBookingsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;"><i class="fa-solid fa-folder-open fa-3x" style="margin-bottom: 15px; color: #ccc;"></i><p style="font-size: 1.1rem; font-weight: 500;">No bookings found.</p><p style="font-size: 0.9rem;">Submit the form to book your first Incredible India adventure!</p></div>';
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
        bookings.forEach(bk => {
            const dateStr = new Date(bk.travelDate).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            
            const isPaid = bk.paymentStatus === 'paid';
            const isCallback = bk.paymentOption === 'pay_callback';
            
            let statusBadge = '';
            if (isPaid) {
                statusBadge = '<span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Paid</span>';
            } else if (isCallback) {
                statusBadge = '<span style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;"><i class="fa-solid fa-phone"></i> Callback Requested</span>';
            } else {
                statusBadge = '<span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;"><i class="fa-solid fa-circle-xmark"></i> Pending Payment</span>';
            }

            let pdfButton = '';
            if (isPaid) {
                pdfButton = `
                    <div style="margin-top: 10px;">
                        <button class="btn-pdf" onclick="downloadInvoice('${bk.id}')">
                            <i class="fa-solid fa-file-pdf"></i> Ticket PDF
                        </button>
                    </div>
                `;
            }

            html += `
                <div style="background: var(--white); border: 1px solid var(--border-color); border-radius: 8px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; width: 100%;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; font-size: 1.1rem; color: var(--dark-color);">${bk.destination}</h4>
                            <p style="margin: 0 0 5px 0; font-size: 0.9rem; color: var(--text-color);"><i class="fa-solid fa-calendar-days"></i> Travel Date: <strong>${dateStr}</strong></p>
                            <p style="margin: 0 0 5px 0; font-size: 0.85rem; color: var(--text-color);">Guests: ${bk.adults} Adults, ${bk.kids} Kids | Package: <span style="text-transform: capitalize;"><strong>${bk.packageType}</strong></span></p>
                            <p style="margin: 0; font-size: 0.85rem; color: var(--text-color); opacity: 0.7;">Booking ID: ${bk.id}</p>
                        </div>
                        <div style="text-align: right; min-width: 120px; display: flex; flex-direction: column; align-items: flex-end;">
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color); margin-bottom: 8px;">₹${bk.totalPrice.toLocaleString('en-IN')}</div>
                            <div>${statusBadge}</div>
                            ${pdfButton}
                        </div>
                    </div>
                    ${generateTimelineHtml(bk.destination, bk.id)}
                </div>
            `;
        });
        html += '</div>';
        userBookingsContainer.innerHTML = html;
    };

    // Render notifications center list
    const renderUserNotifications = () => {
        if (!userNotificationsContainer) return;
        if (userNotificationsList.length === 0) {
            userNotificationsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;"><i class="fa-solid fa-bell-slash fa-3x" style="margin-bottom: 15px; color: #ccc;"></i><p style="font-size: 1.1rem; font-weight: 500;">No notifications yet.</p><p style="font-size: 0.9rem;">You will receive alerts here when booking status changes or callback events occur.</p></div>';
            return;
        }

        // Sort by date descending
        userNotificationsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
        userNotificationsList.forEach(nt => {
            const dateStr = new Date(nt.createdAt).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const isUnread = !nt.read;
            const bgStyle = isUnread ? 'background: #f0f7ff; border-left: 4px solid var(--primary-color);' : 'background: #fff; border-left: 4px solid #e5e7eb;';
            const badgeHtml = isUnread ? '<span style="background: var(--primary-color); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: bold; margin-left: 8px; vertical-align: middle;">NEW</span>' : '';
            
            let iconHtml = '<i class="fa-solid fa-info-circle" style="color: #3b82f6; font-size: 1.2rem;"></i>';
            if (nt.type === 'success' || nt.title.toLowerCase().includes('confirm')) {
                iconHtml = '<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.2rem;"></i>';
            } else if (nt.title.toLowerCase().includes('callback')) {
                iconHtml = '<i class="fa-solid fa-phone-volume" style="color: #f59e0b; font-size: 1.2rem;"></i>';
            }

            const markReadBtn = isUnread 
                ? `<button onclick="markNotificationRead('${nt.id || nt._id}', event)" style="background: none; border: none; color: var(--primary-color); font-weight: 600; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;"><i class="fa-solid fa-check"></i> Mark read</button>`
                : '';

            html += `
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; transition: all 0.2s; ${bgStyle}">
                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                        <div style="margin-top: 2px;">${iconHtml}</div>
                        <div>
                            <h5 style="margin: 0 0 4px 0; font-size: 0.95rem; color: var(--dark-color); font-weight: 600; display: flex; align-items: center; flex-wrap: wrap;">
                                ${nt.title} ${badgeHtml}
                            </h5>
                            <p style="margin: 0 0 6px 0; font-size: 0.85rem; color: #4b5563; line-height: 1.4;">${nt.message}</p>
                            <span style="font-size: 0.75rem; color: #9ca3af;"><i class="fa-solid fa-clock"></i> ${dateStr}</span>
                        </div>
                    </div>
                    <div>
                        ${markReadBtn}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        userNotificationsContainer.innerHTML = html;
    };

    // Load User Notifications API call
    const loadNotifications = async (quiet = false) => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/notifications`, {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const oldUnreadCount = userNotificationsList.filter(n => !n.read).length;
                const newNotifications = data.data;
                const newUnreadList = newNotifications.filter(n => !n.read);
                
                if (!quiet) {
                    const unreadCount = newUnreadList.length;
                    if (unreadCount > 0) {
                        showToast(`You have ${unreadCount} unread notification(s). Check your Notification Center!`, 'info');
                    }
                } else if (quiet && newUnreadList.length > oldUnreadCount) {
                    const oldIds = userNotificationsList.map(n => n.id || n._id);
                    const newlyArrived = newUnreadList.find(n => !oldIds.includes(n.id || n._id));
                    if (newlyArrived) {
                        showToast(`New Notification: ${newlyArrived.title}`, 'info');
                    }
                }

                userNotificationsList = newNotifications;
                updateNotificationBadges();
                
                if (dashboardModal.style.display === 'flex' && activeCustomerTab === 'notifications') {
                    renderUserNotifications();
                }
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    };

    // Mark as read API handler
    const markNotificationRead = async (id, event) => {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        try {
            const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
                method: 'PUT',
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                const idx = userNotificationsList.findIndex(n => (n.id || n._id) === id);
                if (idx !== -1) {
                    userNotificationsList[idx].read = true;
                }
                updateNotificationBadges();
                renderUserNotifications();
            } else {
                showToast(`Failed: ${data.message}`, 'error');
            }
        } catch (err) {
            console.error('Mark read fail:', err);
            showToast('Failed to contact server.', 'error');
        }
    };
    window.markNotificationRead = markNotificationRead;

    // Update unread count badges in Navbar and Dashboard Tab
    const updateNotificationBadges = () => {
        const unreadCount = userNotificationsList.filter(n => !n.read).length;
        
        const navbarUnreadBadge = document.getElementById('navbar-unread-badge');
        const navUnreadCountBadge = document.getElementById('nav-unread-count');
        const custNotificationsBadge = document.getElementById('cust-notifications-badge');
        
        if (unreadCount > 0) {
            if (navbarUnreadBadge) navbarUnreadBadge.style.display = 'block';
            if (navUnreadCountBadge) {
                navUnreadCountBadge.textContent = unreadCount;
                navUnreadCountBadge.style.display = 'inline-block';
            }
            if (custNotificationsBadge) {
                custNotificationsBadge.textContent = unreadCount;
                custNotificationsBadge.style.display = 'inline-block';
            }
        } else {
            if (navbarUnreadBadge) navbarUnreadBadge.style.display = 'none';
            if (navUnreadCountBadge) navUnreadCountBadge.style.display = 'none';
            if (custNotificationsBadge) custNotificationsBadge.style.display = 'none';
        }
    };

    // Setup polling for live confirmation notifications
    const startNotificationPolling = () => {
        if (notificationPollInterval) clearInterval(notificationPollInterval);
        loadNotifications(false);
        notificationPollInterval = setInterval(() => {
            loadNotifications(true);
        }, 15000); // Poll every 15s for instant updates
    };

    const stopNotificationPolling = () => {
        if (notificationPollInterval) {
            clearInterval(notificationPollInterval);
            notificationPollInterval = null;
        }
    };

    window.closeDashboardModal = closeDashboardModal;

    if (menuMyBookings) {
        menuMyBookings.addEventListener('click', (e) => {
            e.preventDefault();
            openDashboardModal('bookings');
        });
    }
    
    if (menuNotifications) {
        menuNotifications.addEventListener('click', (e) => {
            e.preventDefault();
            openDashboardModal('notifications');
        });
    }

    navUsername.parentElement.addEventListener('click', (e) => {
        if (e.target.id === 'nav-username' || e.target.closest('#nav-username')) {
            e.preventDefault();
        }
    });

    // --- 9. Admin Panel & Controls ---
    const adminModal = document.getElementById('admin-modal');
    const adminTabStats = document.getElementById('admin-tab-stats');
    const adminTabBookings = document.getElementById('admin-tab-bookings');
    const adminTabContacts = document.getElementById('admin-tab-contacts');
    const adminTabDestinations = document.getElementById('admin-tab-destinations');

    const adminSectionStats = document.getElementById('admin-section-stats');
    const adminSectionBookings = document.getElementById('admin-section-bookings');
    const adminSectionContacts = document.getElementById('admin-section-contacts');
    const adminSectionDestinations = document.getElementById('admin-section-destinations');

    const addDestinationForm = document.getElementById('add-destination-form');
    const adminDestinationsList = document.getElementById('admin-destinations-list');

    let currentAdminTab = 'stats';

    const openAdminModal = () => {
        if (!token || !currentUser || currentUser.role !== 'admin') {
            showToast('Access Denied: Admin authorization required.', 'error');
            return;
        }
        adminModal.style.display = 'flex';
        switchAdminTab('bookings'); // Open Client Bookings tab by default!
    };

    const closeAdminModal = () => {
        adminModal.style.display = 'none';
    };

    const switchAdminTab = (tab) => {
        currentAdminTab = tab;
        
        // Update tab buttons style
        const tabs = [
            { id: 'stats', btn: adminTabStats, sec: adminSectionStats },
            { id: 'bookings', btn: adminTabBookings, sec: adminSectionBookings },
            { id: 'contacts', btn: adminTabContacts, sec: adminSectionContacts },
            { id: 'destinations', btn: adminTabDestinations, sec: adminSectionDestinations }
        ];

        tabs.forEach(t => {
            if (t.id === tab) {
                t.btn.style.background = '#fff';
                t.btn.style.borderBottom = '3px solid var(--primary-color)';
                t.btn.style.color = 'var(--primary-color)';
                t.sec.style.display = 'block';
            } else {
                t.btn.style.background = 'none';
                t.btn.style.borderBottom = 'none';
                t.btn.style.color = '#888';
                t.sec.style.display = 'none';
            }
        });

        // Load section data
        if (tab === 'stats') loadAdminStats();
        else if (tab === 'bookings') loadAdminBookings();
        else if (tab === 'contacts') loadAdminContacts();
        else if (tab === 'destinations') loadAdminDestinationsList();
    };

    window.closeAdminModal = closeAdminModal;
    window.switchAdminTab = switchAdminTab;

    menuAdminDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        openAdminModal();
    });

    // Admin Load Statistics
    const loadAdminStats = async () => {
        adminSectionStats.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2xl" style="color: var(--primary-color);"></i></div>';
        try {
            const res = await fetch(`${API_BASE}/admin/stats`, { headers: getAuthHeader() });
            const data = await res.json();
            
            if (data.success && data.data) {
                const s = data.data;
                adminSectionStats.innerHTML = `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
                        <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                            <div style="font-size: 2.2rem; font-weight: 700; color: var(--primary-color);">${s.totalBookings}</div>
                            <div style="color: #666; font-size: 0.9rem; font-weight: 500; margin-top: 5px;">Total Bookings</div>
                        </div>
                        <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                            <div style="font-size: 2.2rem; font-weight: 700; color: #10b981;">₹${s.totalRevenue.toLocaleString('en-IN')}</div>
                            <div style="color: #666; font-size: 0.9rem; font-weight: 500; margin-top: 5px;">Revenue Collected</div>
                        </div>
                        <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                            <div style="font-size: 2.2rem; font-weight: 700; color: #f59e0b;">${s.pendingCallbackCount}</div>
                            <div style="color: #666; font-size: 0.9rem; font-weight: 500; margin-top: 5px;">Callback Requests Pending</div>
                        </div>
                        <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                            <div style="font-size: 2.2rem; font-weight: 700; color: var(--dark-color);">${s.totalUsers}</div>
                            <div style="color: #666; font-size: 0.9rem; font-weight: 500; margin-top: 5px;">Registered Customers</div>
                        </div>
                    </div>
                    <div style="background: #fff; border-radius: 8px; border: 1px solid #eee; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                        <h4 style="margin-top:0; color: var(--dark-color); margin-bottom: 10px;">Quick Diagnostics</h4>
                        <p style="margin: 0; color: #666; font-size: 0.9rem; line-height: 1.5;">BharatSafar admin center connected to the Node Express server. You have ${s.destinationsCount} live active tourist packages. Select <strong>Client Bookings</strong> to verify incoming client forms, view call back numbers, and confirm manual cash/callback payments.</p>
                    </div>
                `;
            } else {
                adminSectionStats.innerHTML = '<div style="color: red; text-align: center;">Error retrieving statistics logs.</div>';
            }
        } catch (e) {
            console.error(e);
            adminSectionStats.innerHTML = '<div style="color: red; text-align: center;">Server communication failed.</div>';
        }
    };

    // Admin Load Client Bookings list
    const loadAdminBookings = async () => {
        adminSectionBookings.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2xl" style="color: var(--primary-color);"></i></div>';
        try {
            const res = await fetch(`${API_BASE}/bookings`, { headers: getAuthHeader() });
            const data = await res.json();
            
            if (data.success && Array.isArray(data.data)) {
                const bookings = data.data;
                if (bookings.length === 0) {
                    adminSectionBookings.innerHTML = '<div style="text-align: center; padding: 40px; color:#888;">No bookings received yet.</div>';
                    return;
                }
                
                // Sort bookings by date descending
                bookings.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

                let rowsHtml = '';
                bookings.forEach(bk => {
                    const isPaid = bk.paymentStatus === 'paid';
                    const isCallback = bk.paymentOption === 'pay_callback';
                    
                    let statusBadgeHtml = '';
                    if (isPaid) {
                        statusBadgeHtml = `<span style="display:inline-block; font-size:0.7rem; font-weight:700; text-transform:uppercase; padding: 2px 6px; border-radius: 4px; background:#d1fae5; color:#065f46; margin-top:4px;"><i class="fa-solid fa-circle-check"></i> Paid</span>`;
                    } else {
                        statusBadgeHtml = `<span style="display:inline-block; font-size:0.7rem; font-weight:700; text-transform:uppercase; padding: 2px 6px; border-radius: 4px; background:#fee2e2; color:#991b1b; margin-top:4px;"><i class="fa-solid fa-clock"></i> Unpaid</span>`;
                    }

                    const actionButton = !isPaid 
                        ? (isCallback 
                            ? `<button class="btn btn-primary" onclick="contactAndConfirmCallback('${bk.id}', '${bk.fullName.replace(/'/g, "\\'")}', '${bk.phone}')" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 4px; font-weight:600; cursor:pointer; background:#d97706; border-color:#d97706; color:#fff;"><i class="fa-solid fa-phone"></i> Call Customer</button>`
                            : `<button class="btn btn-primary" onclick="markBookingAsPaid('${bk.id}')" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 4px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-indian-rupee-sign"></i> Mark Paid</button>`)
                        : `<span style="color: #10b981; font-weight:600; font-size: 0.85rem;"><i class="fa-solid fa-check-double"></i> Confirmed</span>`;

                    const createdDateStr = new Date(bk.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    const payIdHtml = bk.razorpayPaymentId 
                        ? `<div style="font-size:0.7rem; color:#666; margin-top:2px;">Txn ID: <code>${bk.razorpayPaymentId}</code></div>`
                        : '';

                    rowsHtml += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px 10px; vertical-align: top;">
                                <div style="font-weight: 600; color: var(--dark-color); font-size: 0.9rem;">${bk.fullName}</div>
                                <div style="color:#555; font-size:0.75rem;"><i class="fa-solid fa-envelope"></i> ${bk.email}</div>
                                <div style="color:var(--primary-color); font-size:0.8rem; font-weight: 600; margin-top:2px;"><i class="fa-solid fa-phone"></i> ${bk.phone}</div>
                            </td>
                            <td style="padding: 12px 10px; vertical-align: top;">
                                <div style="font-weight: 600; color: var(--dark-color);">${bk.destination}</div>
                                <div style="color:#555; font-size:0.75rem;"><i class="fa-solid fa-calendar-day"></i> Travel: <strong>${bk.travelDate}</strong></div>
                                <div style="color:#888; font-size:0.7rem; margin-top:2px;">Booked: ${createdDateStr}</div>
                            </td>
                            <td style="padding: 12px 10px; vertical-align: top; text-align:center;">
                                <div style="font-weight: 600; color:#333;">${bk.adults} Adults</div>
                                <div style="color:#666; font-size:0.75rem;">${bk.kids} Kids</div>
                                <div style="font-size:0.75rem; text-transform: capitalize; font-weight:700; color:#4f46e5; margin-top:4px;">${bk.packageType} Package</div>
                            </td>
                            <td style="padding: 12px 10px; vertical-align: top;">
                                <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary-color);">₹${bk.totalPrice.toLocaleString('en-IN')}</div>
                                <span style="display:inline-block; font-size:0.7rem; font-weight:700; text-transform:uppercase; padding: 2px 6px; border-radius: 4px; background:${isCallback ? '#fef3c7; color:#d97706;' : '#dbeafe; color:#2563eb;'}">
                                    ${isCallback ? 'Callback' : 'Online Pay'}
                                </span>
                                <br>${statusBadgeHtml}
                                ${payIdHtml}
                            </td>
                            <td style="padding: 12px 10px; vertical-align: middle; text-align:center;">
                                ${actionButton}
                            </td>
                        </tr>
                    `;
                });

                adminSectionBookings.innerHTML = `
                    <div style="background: #fff; border-radius: 8px; border: 1px solid #eee; padding: 15px; overflow-x: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                        <h4 style="margin-top:0; color: var(--dark-color); margin-bottom: 15px;">Bookings Database</h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 2px solid #ddd; background:#f3f4f6; color:#374151;">
                                    <th style="padding: 12px 10px; font-weight: 600;">Customer Details</th>
                                    <th style="padding: 12px 10px; font-weight: 600;">Trip & Travel Date</th>
                                    <th style="padding: 12px 10px; font-weight: 600; text-align:center;">Guests & Package</th>
                                    <th style="padding: 12px 10px; font-weight: 600;">Pricing & Payment</th>
                                    <th style="padding: 12px 10px; font-weight: 600; text-align:center;">Status Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        } catch (e) {
            console.error(e);
            adminSectionBookings.innerHTML = '<div style="color: red; text-align: center;">Failed to load bookings list.</div>';
        }
    };

    // Mark Booking as Paid handler
    const markBookingAsPaid = async (id) => {
        if (!confirm('Mark this booking as paid (Confirm cash collection or successful callback transaction)?')) return;
        
        try {
            const res = await fetch(`${API_BASE}/admin/bookings/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ paymentStatus: 'paid' })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Booking successfully marked as Paid!', 'success');
                loadAdminBookings(); // Refresh bookings log
            } else {
                showToast(`Error: ${data.message}`, 'error');
            }
        } catch (err) {
            console.error('Update status fail:', err);
            showToast('Failed to update status on server.', 'error');
        }
    };
    window.markBookingAsPaid = markBookingAsPaid;

    // Contact Client and Confirm Booking Paid handler
    const contactAndConfirmCallback = async (id, name, phone) => {
        const confirmCall = confirm(`You are initiating a call to ${name} at (+91 ${phone}) to discuss their custom travel itinerary.\n\nPress OK once you have discussed the package and want to confirm payment for this booking.`);
        if (!confirmCall) return;
        
        try {
            const res = await fetch(`${API_BASE}/admin/bookings/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ paymentStatus: 'paid' })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Contacted ${name} and confirmed booking payment successfully!`, 'success');
                loadAdminBookings(); // Refresh bookings log
            } else {
                showToast(`Error: ${data.message}`, 'error');
            }
        } catch (err) {
            console.error('Update status fail:', err);
            showToast('Failed to update status on server.', 'error');
        }
    };
    window.contactAndConfirmCallback = contactAndConfirmCallback;

    // Admin Load Contact messages
    const loadAdminContacts = async () => {
        adminSectionContacts.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2xl" style="color: var(--primary-color);"></i></div>';
        try {
            const res = await fetch(`${API_BASE}/admin/contacts`, { headers: getAuthHeader() });
            const data = await res.json();
            
            if (data.success && Array.isArray(data.data)) {
                const contacts = data.data;
                if (contacts.length === 0) {
                    adminSectionContacts.innerHTML = '<div style="text-align: center; padding: 40px; color:#888;">No contact messages received.</div>';
                    return;
                }

                // Sort by date descending
                contacts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

                let rowsHtml = '';
                contacts.forEach(c => {
                    const dateStr = new Date(c.createdAt || Date.now()).toLocaleString('en-IN');
                    rowsHtml += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight:600;">${c.name}</td>
                            <td style="padding: 10px; color: #1d4ed8;">${c.email}</td>
                            <td style="padding: 10px; font-style:italic;">"${c.message}"</td>
                            <td style="padding: 10px; color:#666; font-size:0.75rem;">${dateStr}</td>
                        </tr>
                    `;
                });

                adminSectionContacts.innerHTML = `
                    <div style="background: #fff; border-radius: 8px; border: 1px solid #eee; padding: 15px; overflow-x: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                        <h4 style="margin-top:0; color: var(--dark-color); margin-bottom: 15px;">Customer Inquiry Messages</h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 2px solid #ddd; background:#fafafa;">
                                    <th style="padding: 10px;">Name</th>
                                    <th style="padding: 10px;">Email</th>
                                    <th style="padding: 10px;">Message Text</th>
                                    <th style="padding: 10px;">Date Received</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        } catch (e) {
            console.error(e);
            adminSectionContacts.innerHTML = '<div style="color: red; text-align: center;">Failed to load contacts list.</div>';
        }
    };

    // Admin Load Current Destinations list & Handle Add/Delete
    const loadAdminDestinationsList = async () => {
        adminDestinationsList.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin fa-lg" style="color:var(--primary-color);"></i></td></tr>';
        try {
            const res = await fetch(`${API_BASE}/destinations`);
            const data = await res.json();
            
            if (data.success && Array.isArray(data.data)) {
                destinations = data.data; // Sync local copy
                let html = '';
                destinations.forEach(d => {
                    html += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 8px; font-weight:500;">${d.name}</td>
                            <td style="padding: 8px; font-family:monospace; color:#888;">${d.id}</td>
                            <td style="padding: 8px; font-weight:600;">${d.price}</td>
                            <td style="padding: 8px; text-align:center;">
                                <button onclick="deleteAdminDestination('${d.id}')" style="background:none; border:none; color:#ef4444; font-size:1.1rem; cursor:pointer; padding: 4px 8px;" title="Delete Destination"><i class="fa-solid fa-trash-can"></i></button>
                            </td>
                        </tr>
                    `;
                });
                adminDestinationsList.innerHTML = html || '<tr><td colspan="4" style="text-align:center; padding:10px;">No destinations available.</td></tr>';
            }
        } catch (err) {
            console.error(err);
            adminDestinationsList.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red; padding:10px;">Fetch failed.</td></tr>';
        }
    };

    // Add Destination submit handler
    addDestinationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('admin-dest-name').value.trim();
        const id = document.getElementById('admin-dest-id').value.trim().toLowerCase();
        const price = document.getElementById('admin-dest-price').value.trim();
        const rating = document.getElementById('admin-dest-rating').value.trim();
        const desc = document.getElementById('admin-dest-desc').value.trim();
        const img = document.getElementById('admin-dest-img').value.trim();
        const successMsg = document.getElementById('admin-dest-success');

        successMsg.style.display = 'none';
        try {
            const res = await fetch(`${API_BASE}/admin/destinations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ name, id, price, rating, desc, img })
            });
            const data = await res.json();
            
            if (data.success) {
                successMsg.textContent = 'Destination added successfully!';
                successMsg.style.color = '#10b981';
                successMsg.style.display = 'block';
                
                addDestinationForm.reset();
                
                // Refresh listings
                loadDestinations(); // Reload grid & dropdowns
                setTimeout(() => {
                    loadAdminDestinationsList(); // Reload admin management table
                }, 200);
            } else {
                successMsg.textContent = `Error: ${data.message}`;
                successMsg.style.color = '#ef4444';
                successMsg.style.display = 'block';
            }
        } catch (err) {
            console.error(err);
            successMsg.textContent = 'Server communications failed.';
            successMsg.style.color = '#ef4444';
            successMsg.style.display = 'block';
        }
    });

    // Delete Destination handler
    const deleteAdminDestination = async (id) => {
        if (!confirm(`Are you absolutely sure you want to delete destination ID "${id}"? This will remove it from the homepage.`)) return;

        try {
            const res = await fetch(`${API_BASE}/admin/destinations/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Destination deleted successfully.`, 'success');
                loadDestinations(); // Reload grid & dropdowns
                setTimeout(() => {
                    loadAdminDestinationsList(); // Reload admin management table
                }, 200);
            } else {
                showToast(`Failed: ${data.message}`, 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Server request failed.', 'error');
        }
    };
    window.deleteAdminDestination = deleteAdminDestination;

    // --- 10. Active Nav Links on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);
            
            if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
                navLink.classList.add('active');
            }
        });
    });

    // =========================================================================
    // NEW PREMIUM FEATURES SCRIPTS
    // =========================================================================

    // --- A. Dynamic Ratings Lookup ---
    const updateCardRatings = () => {
        document.querySelectorAll('.card-rating[data-dest-id]').forEach(elem => {
            const destId = elem.getAttribute('data-dest-id');
            if (elem.classList.contains('rating-loaded')) return;
            
            fetch(`${API_BASE}/reviews/${destId}`)
                .then(res => res.json())
                .then(res => {
                    if (res.success) {
                        const avg = res.data.averageRating;
                        const total = res.data.totalReviews;
                        
                        // Update in-memory destination object if found
                        const dest = destinations.find(d => d.id === destId);
                        if (dest) {
                            dest.dynamicRating = avg > 0 ? avg : parseFloat(dest.rating);
                            dest.reviewsCount = total;
                        }

                        const numNode = elem.querySelector('.rating-num');
                        const countNode = elem.querySelector('.reviews-count');
                        
                        if (numNode) numNode.textContent = avg > 0 ? avg.toFixed(1) : (dest ? parseFloat(dest.rating).toFixed(1) : '4.7');
                        if (countNode) countNode.textContent = `(${total} Review${total !== 1 ? 's' : ''})`;
                        elem.classList.add('rating-loaded');
                    }
                })
                .catch(err => console.error('Error fetching rating:', err));
        });
    };
    window.updateCardRatings = updateCardRatings;

    // --- B. Wishlist Toggle ---
    const toggleWishlist = (event, destId) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!currentUser) {
            showToast('Please login to add destinations to your wishlist', 'error');
            openAuthModal();
            return;
        }

        fetch(`${API_BASE}/auth/wishlist`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ destinationId: destId })
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                // Update local user wishlist state
                currentUser.wishlist = res.data.wishlist;
                
                // Toggle heart class on all cards representing this destination
                document.querySelectorAll(`.wishlist-btn[data-dest-id="${destId}"]`).forEach(btn => {
                    const isNowWishlisted = currentUser.wishlist.includes(destId);
                    if (isNowWishlisted) {
                        btn.classList.add('active');
                        btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
                    } else {
                        btn.classList.remove('active');
                        btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
                    }
                });

                showToast(res.message, 'success');
                
                // Update wishlist badge counters with bounce animation
                updateWishlistBadges();

                // If currently viewing wishlist tab, re-render it
                if (activeCustomerTab === 'wishlist') {
                    renderWishlist();
                }
            } else {
                showToast(res.message || 'Failed to update wishlist', 'error');
            }
        })
        .catch(err => {
            console.error('Error toggling wishlist:', err);
            showToast('Failed to toggle wishlist', 'error');
        });
    };
    window.toggleWishlist = toggleWishlist;

    // --- C. Render Wishlist Container ---
    const renderWishlist = () => {
        const container = document.getElementById('user-wishlist-container');
        if (!container) return;

        if (!currentUser || !currentUser.wishlist || currentUser.wishlist.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-color);">
                    <i class="fa-regular fa-heart" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Your wishlist is empty. Start exploring and bookmarking your favorite destinations!</p>
                </div>
            `;
            return;
        }

        // Filter destinations array to only those in the wishlist
        const wishlistedDests = destinations.filter(d => currentUser.wishlist.includes(d.id));

        if (wishlistedDests.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-color);">
                    <p>No matching destinations found. Start searching!</p>
                </div>
            `;
            return;
        }

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">';
        wishlistedDests.forEach(dest => {
            const escapedName = dest.name.replace(/'/g, "\\'");
            html += `
                <div class="destination-card" style="box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--white);">
                    <div class="card-img-wrapper" style="height: 180px; position: relative;">
                        <div class="card-price">From ${dest.price}</div>
                        <button class="wishlist-btn active" data-dest-id="${dest.id}" onclick="toggleWishlist(event, '${dest.id}')" style="top: 10px; left: 10px; width: 30px; height: 30px; font-size: 0.95rem;">
                            <i class="fa-solid fa-heart"></i>
                        </button>
                        <img src="${dest.img}" alt="${dest.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="card-content" style="padding: 15px;">
                        <h4 style="margin: 0 0 8px 0; color: var(--dark-color); font-size: 1.1rem;">${dest.name}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-color); margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${dest.desc}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="card-rating" data-dest-id="${dest.id}" onclick="closeDashboardModal(); openReviewsModal('${dest.id}', '${escapedName}')" style="cursor: pointer;">
                                <i class="fa-solid fa-star" style="color: #ffc107;"></i>
                                <span class="rating-num">${dest.rating}</span>
                                <span class="reviews-count" style="font-size: 0.75rem;">(...)</span>
                            </div>
                            <a href="#contact" onclick="closeDashboardModal(); selectDestinationForBooking('${escapedName}')" class="btn btn-primary-outline" style="padding: 5px 12px; font-size: 0.8rem;">Book Now</a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
        
        // Update ratings for wishlist cards as well
        updateCardRatings();
    };
    window.renderWishlist = renderWishlist;

    // --- D. Reusable Destination Pre-selector ---
    const selectDestinationForBooking = (destTitle) => {
        if (!token) {
            showToast('Please login to book a destination.', 'info');
            openAuthModal();
            return;
        }
        if (destInput) {
            let matchFound = false;
            for (let i = 0; i < destInput.options.length; i++) {
                if (destInput.options[i].value === destTitle) {
                    destInput.selectedIndex = i;
                    matchFound = true;
                    break;
                }
            }
            if (!matchFound) {
                destInput.value = 'other';
            }
            destInput.dispatchEvent(new Event('change'));
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        }
    };
    window.selectDestinationForBooking = selectDestinationForBooking;

    const selectPackageTier = (tier) => {
        if (!token) {
            showToast('Please login to book a package.', 'info');
            openAuthModal();
            return;
        }
        const packageInput = document.getElementById('package-type');
        if (packageInput) {
            packageInput.value = tier;
            packageInput.dispatchEvent(new Event('change'));
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        }
    };
    window.selectPackageTier = selectPackageTier;

    // --- E. Theme Toggle / Dark Mode ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleFloatBtn = document.getElementById('theme-toggle-float');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    function updateThemeToggleIcon(theme) {
        const sunIcon = '<i class="fa-solid fa-sun" style="color: #ffc107;"></i>';
        const moonIcon = '<i class="fa-solid fa-moon"></i>';
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
        }
        if (themeToggleFloatBtn) {
            themeToggleFloatBtn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
        }
    }
    
    updateThemeToggleIcon(currentTheme);

    const applyThemeToggle = () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeToggleIcon(theme);
        showToast(`${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode Enabled`, 'info');
    };

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', applyThemeToggle);
    }
    if (themeToggleFloatBtn) {
        themeToggleFloatBtn.addEventListener('click', applyThemeToggle);
    }

    // --- F. Collapsible Filter Bindings ---
    const advancedFiltersBtn = document.getElementById('advanced-filters-toggle-btn');
    const advancedFiltersPanel = document.getElementById('advanced-filters-panel');
    const priceSlider = document.getElementById('price-range-slider');
    const priceSliderVal = document.getElementById('price-slider-val');
    const starRatingFilter = document.getElementById('star-rating-filter');

    if (advancedFiltersBtn && advancedFiltersPanel) {
        advancedFiltersBtn.addEventListener('click', () => {
            advancedFiltersBtn.classList.toggle('active');
            advancedFiltersPanel.classList.toggle('active');
        });
    }

    if (priceSlider && priceSliderVal) {
        priceSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            priceSliderVal.textContent = `₹${val.toLocaleString('en-IN')}`;
            renderDestinationsGrid(true);
        });
    }

    if (starRatingFilter) {
        starRatingFilter.addEventListener('change', () => {
            renderDestinationsGrid(true);
        });
    }

    // --- G. PDF Ticket/Invoice Downloader ---
    const downloadInvoice = async (bookingId) => {
        try {
            showToast('Generating ticket PDF...', 'info');
            
            const res = await fetch(`${API_BASE}/bookings`, {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (!data.success) {
                showToast('Failed to fetch booking info', 'error');
                return;
            }
            
            const booking = data.data.find(b => b.id === bookingId);
            if (!booking) {
                showToast('Booking not found', 'error');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Draw colored brand header
            doc.setFillColor(255, 90, 95); // primary #ff5a5f
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(24);
            doc.text("BHARAT SAFAR", 20, 25);
            
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(10);
            doc.text("Official Travel Ticket & Invoice", 20, 32);
            doc.text("Support: sushant8809045@gmail.com | +91 8340538106", 110, 25);
            
            doc.setTextColor(34, 34, 34);
            
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(16);
            doc.text("TRAVEL RESERVATION CONFIRMED", 20, 55);
            
            doc.setDrawColor(228, 228, 228);
            doc.setLineWidth(0.5);
            doc.line(20, 60, 190, 60);
            
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Booking Reference ID: ${booking.id}`, 20, 68);
            doc.text(`Issued Date: ${new Date().toLocaleDateString('en-IN')}`, 140, 68);
            
            doc.setFont('Helvetica', 'bold');
            doc.text("Traveler Details", 20, 80);
            doc.text("Itinerary Summary", 110, 80);
            
            doc.setFont('Helvetica', 'normal');
            doc.text(`Name: ${booking.fullName}`, 20, 88);
            doc.text(`Email: ${booking.email}`, 20, 94);
            doc.text(`Phone: ${booking.phone}`, 20, 100);
            
            const travelDateFormatted = new Date(booking.travelDate).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            doc.text(`Destination: ${booking.destination}`, 110, 88);
            doc.text(`Travel Date: ${travelDateFormatted}`, 110, 94);
            doc.text(`Package Tier: ${booking.packageType.toUpperCase()}`, 110, 100);
            doc.text(`Guests: ${booking.adults} Adults, ${booking.kids} Kids`, 110, 106);
            
            doc.line(20, 115, 190, 115);
            
            doc.setFillColor(247, 247, 247);
            doc.rect(20, 122, 170, 10, 'F');
            doc.setFont('Helvetica', 'bold');
            doc.text("Description", 25, 128);
            doc.text("Total", 160, 128);
            
            doc.setFont('Helvetica', 'normal');
            doc.text(`Tour Package: ${booking.destination} (${booking.packageType} Package)`, 25, 140);
            doc.text(`₹${booking.totalPrice.toLocaleString('en-IN')}`, 160, 140);
            
            doc.line(20, 147, 190, 147);
            
            doc.setFont('Helvetica', 'bold');
            doc.text("Grand Total (INR):", 120, 157);
            doc.setTextColor(255, 90, 95);
            doc.setFontSize(14);
            doc.text(`₹${booking.totalPrice.toLocaleString('en-IN')}`, 165, 157);
            
            // Status Stamp
            doc.setDrawColor(16, 185, 129);
            doc.setFillColor(240, 253, 250);
            doc.rect(20, 170, 60, 20, 'F');
            doc.rect(20, 170, 60, 20);
            doc.setFontSize(12);
            doc.setTextColor(16, 185, 129);
            doc.text("PAYMENT: SECURE PAID", 25, 182);
            
            // Terms
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text("Terms & Conditions:", 20, 210);
            doc.text("1. Please carry a printout of this ticket along with a valid Government Photo ID card.", 20, 215);
            doc.text("2. Cancellation requests must be submitted at least 72 hours before the travel date.", 20, 220);
            doc.text("3. Hotel check-in timings depend on hotel policies.", 20, 225);
            
            doc.line(20, 240, 190, 240);
            
            doc.setFontSize(9);
            doc.text("Thank you for choosing BharatSafar. Have a safe and happy journey!", 60, 250);
            
            doc.save(`Ticket_BharatSafar_${booking.id}.pdf`);
            showToast('Ticket downloaded successfully!', 'success');
        } catch (err) {
            console.error('PDF Generation Error:', err);
            showToast('Could not generate PDF. Please try again.', 'error');
        }
    };
    window.downloadInvoice = downloadInvoice;

    // --- H. Reviews Modal Operations ---
    let activeReviewDestId = null;

    const openReviewsModal = (destId, destName) => {
        activeReviewDestId = destId;
        const reviewsModal = document.getElementById('reviews-modal');
        if (!reviewsModal) return;

        document.getElementById('reviews-title').innerHTML = `<i class="fa-solid fa-star" style="color: #ffc107;"></i> Reviews for ${destName}`;
        reviewsModal.style.display = 'flex';

        resetReviewForm();
        loadDestinationReviews(destId);

        const formContainer = document.getElementById('review-form-container');
        const loginNotice = document.getElementById('review-login-notice');

        if (currentUser) {
            formContainer.style.display = 'block';
            loginNotice.style.display = 'none';
        } else {
            formContainer.style.display = 'none';
            loginNotice.style.display = 'block';
        }
    };
    window.openReviewsModal = openReviewsModal;

    const closeReviewsModal = () => {
        const reviewsModal = document.getElementById('reviews-modal');
        if (reviewsModal) reviewsModal.style.display = 'none';
        activeReviewDestId = null;
    };
    window.closeReviewsModal = closeReviewsModal;

    const loadDestinationReviews = (destId) => {
        const listContainer = document.getElementById('reviews-list-container');
        const avgNum = document.getElementById('reviews-avg-num');
        const avgStars = document.getElementById('reviews-avg-stars');
        const countText = document.getElementById('reviews-count-text');

        if (!listContainer) return;

        listContainer.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin" style="color: var(--primary-color);"></i> Loading reviews...</div>';

        fetch(`${API_BASE}/reviews/${destId}`)
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    const avg = res.data.averageRating;
                    const total = res.data.totalReviews;
                    const reviews = res.data.reviews;

                    avgNum.textContent = avg > 0 ? avg.toFixed(1) : '0.0';
                    countText.textContent = `Based on ${total} review${total !== 1 ? 's' : ''}`;

                    let starsHtml = '';
                    const fullStars = Math.floor(avg);
                    const halfStar = avg % 1 >= 0.5 ? 1 : 0;
                    const emptyStars = 5 - fullStars - halfStar;

                    for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fa-solid fa-star"></i>';
                    if (halfStar) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
                    for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="fa-regular fa-star"></i>';
                    avgStars.innerHTML = starsHtml;

                    if (reviews.length === 0) {
                        listContainer.innerHTML = `
                            <div style="text-align: center; padding: 20px 0; color: var(--text-color); opacity: 0.7;">
                                <p>No reviews yet for this destination. Be the first to write one!</p>
                            </div>
                        `;
                    } else {
                        let reviewsHtml = '';
                        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        
                        reviews.forEach(rev => {
                            const dateStr = new Date(rev.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'short', day: 'numeric'
                            });

                            let starIcons = '';
                            for (let i = 1; i <= 5; i++) {
                                if (i <= rev.rating) {
                                    starIcons += '<i class="fa-solid fa-star"></i>';
                                } else {
                                    starIcons += '<i class="fa-regular fa-star"></i>';
                                }
                            }

                            const photoHtml = rev.photo ? `
                                <div class="review-photos-grid">
                                    <img src="${rev.photo}" class="review-photo-item" onclick="window.open(this.src, '_blank')" alt="Traveler Photo">
                                </div>
                            ` : '';

                            reviewsHtml += `
                                <div class="review-item">
                                    <div class="review-header">
                                        <div class="review-user-info">
                                            <h5>${rev.userName}</h5>
                                            <span class="review-date">${dateStr}</span>
                                        </div>
                                        <div class="review-stars">
                                            ${starIcons}
                                        </div>
                                    </div>
                                    <p class="review-comment">${rev.comment || 'No comment left.'}</p>
                                    ${photoHtml}
                                </div>
                            `;
                        });
                        listContainer.innerHTML = reviewsHtml;
                    }
                }
            })
            .catch(err => {
                console.error('Error fetching reviews:', err);
                listContainer.innerHTML = '<div style="color: #ef4444; text-align: center; padding: 20px;">Could not retrieve reviews.</div>';
            });
    };

    const ratingInputContainer = document.getElementById('star-rating-input');
    const ratingValueInput = document.getElementById('review-rating-value');
    if (ratingInputContainer && ratingValueInput) {
        const stars = ratingInputContainer.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.getAttribute('data-value'), 10);
                ratingValueInput.value = val;
                
                stars.forEach((s, idx) => {
                    if (idx < val) {
                        s.classList.remove('fa-regular');
                        s.classList.add('fa-solid', 'active');
                    } else {
                        s.classList.remove('fa-solid', 'active');
                        s.classList.add('fa-regular');
                    }
                });
            });
        });
    }

    const resetReviewForm = () => {
        const form = document.getElementById('destination-review-form');
        if (form) form.reset();
        clearReviewPhotoPreview();
        if (ratingInputContainer) {
            ratingInputContainer.querySelectorAll('i').forEach(s => {
                s.classList.remove('fa-solid', 'active');
                s.classList.add('fa-regular');
            });
        }
        if (ratingValueInput) ratingValueInput.value = '';
    };

    let reviewPhotoBase64 = '';
    const reviewPhotoInput = document.getElementById('review-photo-file');
    const reviewPhotoPreview = document.getElementById('review-photo-preview');

    if (reviewPhotoInput) {
        reviewPhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 1 * 1024 * 1024) { // 1MB limit
                    showToast('Photo size must be less than 1MB', 'error');
                    reviewPhotoInput.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    reviewPhotoBase64 = event.target.result;
                    if (reviewPhotoPreview) {
                        reviewPhotoPreview.style.backgroundImage = `url(${reviewPhotoBase64})`;
                        reviewPhotoPreview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const clearReviewPhotoPreview = (event) => {
        if (event) event.stopPropagation();
        reviewPhotoBase64 = '';
        if (reviewPhotoInput) reviewPhotoInput.value = '';
        if (reviewPhotoPreview) {
            reviewPhotoPreview.style.backgroundImage = '';
            reviewPhotoPreview.style.display = 'none';
        }
    };
    window.clearReviewPhotoPreview = clearReviewPhotoPreview;

    const reviewForm = document.getElementById('destination-review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ratingVal = ratingValueInput.value;
            const commentVal = document.getElementById('review-comment-text').value;

            if (!ratingVal) {
                showToast('Please select a star rating', 'error');
                return;
            }

            fetch(`${API_BASE}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    destinationId: activeReviewDestId,
                    rating: ratingVal,
                    comment: commentVal,
                    photo: reviewPhotoBase64
                })
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    showToast(res.message, 'success');
                    resetReviewForm();
                    loadDestinationReviews(activeReviewDestId);
                    
                    document.querySelectorAll(`.card-rating[data-dest-id="${activeReviewDestId}"]`).forEach(elem => {
                        elem.classList.remove('rating-loaded');
                    });
                    updateCardRatings();
                } else {
                    showToast(res.message || 'Failed to submit review', 'error');
                }
            })
            .catch(err => {
                console.error('Error submitting review:', err);
                showToast('Server communication error', 'error');
            });
        });
    }

    const reviewsLoginLink = document.getElementById('reviews-login-link');
    if (reviewsLoginLink) {
        reviewsLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeReviewsModal();
            openAuthModal();
        });
    }

    // Check user session on application boot
    checkUserSession();

    // Autofill saved credentials on boot if rememberMe is enabled
    function autofillSavedCredentials() {
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        if (rememberMe) {
            const savedEmail = localStorage.getItem('savedEmail');
            const savedPassword = localStorage.getItem('savedPassword');
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const rememberCheckbox = document.getElementById('login-remember');
            if (emailInput && savedEmail) emailInput.value = savedEmail;
            if (passwordInput && savedPassword) passwordInput.value = savedPassword;
        }
    }
    autofillSavedCredentials();

    // --- G. CONFETTI ANIMATION ---
    const startConfetti = () => {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        let particles = [];
        const colors = ['#ff6f61', '#ffb3a7', '#48dbfb', '#1dd1a1', '#feca57'];

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                r: Math.random() * 6 + 4,
                d: Math.random() * canvas.height,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 5,
                tiltAngleIncremental: Math.random() * 0.07 + 0.02,
                tiltAngle: 0
            });
        }

        let animationId;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, index) => {
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.x += Math.sin(p.tiltAngle);
                p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();
            });

            const active = particles.some(p => p.y < canvas.height);
            if (active) {
                animationId = requestAnimationFrame(draw);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                cancelAnimationFrame(animationId);
            }
        };
        draw();
    };

    // --- H. Promo Code Apply Event ---
    const promoCodeBtn = document.getElementById('apply-promo-btn');
    if (promoCodeBtn) {
        promoCodeBtn.addEventListener('click', () => {
            const promoInput = document.getElementById('promo-code');
            const promoMsg = document.getElementById('promo-msg');
            if (!promoInput || !promoMsg) return;

            const code = promoInput.value.trim().toUpperCase();
            if (!code) {
                promoMsg.style.color = '#ef4444';
                promoMsg.textContent = 'Please enter a coupon code.';
                promoMsg.style.display = 'block';
                return;
            }

            const validCodes = ['BHARAT10', 'EXPLORE20', 'FIRSTTRIP'];
            if (validCodes.includes(code)) {
                activePromoCode = code;
                updateTotalPrice();
                promoMsg.style.color = '#10b981';
                let discountText = '';
                if (code === 'BHARAT10') discountText = '10% discount applied!';
                else if (code === 'EXPLORE20') discountText = '20% discount applied!';
                else if (code === 'FIRSTTRIP') discountText = '₹2,000 discount applied!';
                
                promoMsg.textContent = `Success! ${discountText}`;
                promoMsg.style.display = 'block';
                startConfetti();
                showToast('Promo code applied successfully!', 'success');
            } else {
                promoMsg.style.color = '#ef4444';
                promoMsg.textContent = 'Invalid promo code. Try BHARAT10 or FIRSTTRIP.';
                promoMsg.style.display = 'block';
                activePromoCode = '';
                updateTotalPrice();
            }
        });
    }

    // --- I. Destination Comparison Logic ---
    let compareDestinations = [];
    const compareBar = document.getElementById('compare-bar');
    const compareCount = document.getElementById('compare-count');

    const toggleCompareDestination = (checkbox) => {
        const id = checkbox.getAttribute('data-dest-id');
        const name = checkbox.getAttribute('data-dest-name');

        if (checkbox.checked) {
            if (compareDestinations.length >= 3) {
                showToast('You can compare up to 3 destinations only.', 'error');
                checkbox.checked = false;
                return;
            }
            const dest = destinations.find(d => d.id === id || d._id === id);
            if (dest) {
                compareDestinations.push(dest);
            }
        } else {
            compareDestinations = compareDestinations.filter(d => d.id !== id && d._id !== id);
        }

        updateCompareBar();
    };

    const updateCompareBar = () => {
        if (!compareBar || !compareCount) return;
        if (compareDestinations.length > 0) {
            compareCount.textContent = compareDestinations.length;
            compareBar.style.display = 'flex';
        } else {
            compareBar.style.display = 'none';
        }
        syncCompareCheckboxes();
    };

    const clearComparison = () => {
        compareDestinations = [];
        updateCompareBar();
    };

    const openCompareModal = async () => {
        if (compareDestinations.length < 2) {
            showToast('Please select at least 2 destinations to compare.', 'info');
            return;
        }

        const modal = document.getElementById('comparison-modal');
        const headers = document.getElementById('compare-table-headers');
        const body = document.getElementById('compare-table-body');

        if (!modal || !headers || !body) return;

        // Reset headers and show loading state
        headers.innerHTML = '<th style="padding: 12px; font-weight: 700; width: 25%;">Feature</th>';
        body.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2xl" style="color: var(--primary-color);"></i><p style="margin-top: 15px; font-weight: 600;">Fetching live weather data...</p></td></tr>';
        modal.style.display = 'flex';

        try {
            // Fetch live weather data in parallel for all compared destinations
            const weatherPromises = compareDestinations.map(d => fetchWeatherForCity(d.name || d.title));
            const weatherDataList = await Promise.all(weatherPromises);

            // Re-render headers
            headers.innerHTML = '<th style="padding: 12px; font-weight: 700; width: 25%;">Feature</th>';
            compareDestinations.forEach(dest => {
                headers.innerHTML += `
                    <th style="padding: 12px; font-weight: 700; text-align: center; width: ${75 / compareDestinations.length}%;">
                        <div style="font-weight: 800; color: var(--primary-color); font-size: 1rem;">${dest.name || dest.title}</div>
                        <div style="font-size: 0.8rem; color: #888; margin-top: 4px;">From ${dest.price}</div>
                        <button onclick="selectDestinationForBooking('${dest.name || dest.title}'); closeCompareModal();" class="btn btn-primary" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; margin-top: 8px;">Book This</button>
                    </th>
                `;
            });

            // Build features rows
            const features = [
                { label: 'Estimated Cost', key: 'price' },
                { label: 'Rating Stars', key: 'rating' },
                { label: 'Weather Zone', key: 'name', transform: (name, idx) => weatherDataList[idx].cond },
                { label: 'Live Temperature', key: 'name', transform: (name, idx) => weatherDataList[idx].temp },
                { label: 'Key Travel Advice', key: 'name', transform: (name, idx) => weatherDataList[idx].advice },
                { label: 'Short Description', key: 'desc' }
            ];

            body.innerHTML = '';
            features.forEach(feat => {
                let rowHtml = `<tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 12px; font-weight: 700; background: var(--light-color);">${feat.label}</td>`;
                compareDestinations.forEach((dest, idx) => {
                    let val = dest[feat.key] || dest.title || '';
                    if (feat.transform) {
                        val = feat.transform(dest.name || dest.title, idx);
                    }
                    rowHtml += `<td style="padding: 12px; text-align: center; vertical-align: top; line-height: 1.4;">${val}</td>`;
                });
                rowHtml += '</tr>';
                body.innerHTML += rowHtml;
            });
        } catch (err) {
            console.error('Comparison load error:', err);
            body.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red; padding: 20px;">Failed to load comparison data.</td></tr>';
        }
    };

    const closeCompareModal = () => {
        const modal = document.getElementById('comparison-modal');
        if (modal) modal.style.display = 'none';
    };

    window.toggleCompareDestination = toggleCompareDestination;
    window.clearComparison = clearComparison;
    window.openCompareModal = openCompareModal;
    window.closeCompareModal = closeCompareModal;



    // --- K. Day Itinerary Timeline Data ---
    const ITINERARY_POOL = {
        'Taj Mahal': [
            { id: 'att-1', title: 'Taj Mahal Sunrise Visit' },
            { id: 'att-2', title: 'Agra Fort Guided Tour' },
            { id: 'att-3', title: 'Tomb of Itmad-ud-Daulah' },
            { id: 'att-4', title: 'Mehtab Bagh Sunset Views' },
            { id: 'att-5', title: 'Fatehpur Sikri Excursion' },
            { id: 'att-6', title: 'Sadar Bazaar Shopping Tour' }
        ],
        'Kerala Backwaters': [
            { id: 'att-1', title: 'Houseboat Cruise Check-in' },
            { id: 'att-2', title: 'Kumarakom Bird Sanctuary' },
            { id: 'att-3', title: 'Vembanad Lake Canoeing' },
            { id: 'att-4', title: 'Fort Kochi Kathakali Center' },
            { id: 'att-5', title: 'Marari Beach Relaxation' },
            { id: 'att-6', title: 'Spices Market Shopping' }
        ],
        'Nubra Valley': [
            { id: 'att-1', title: 'Bactrian Camel Safari' },
            { id: 'att-2', title: 'Diskit Monastery Visit' },
            { id: 'att-3', title: 'Khardung La Pass Scenic Drive' },
            { id: 'att-4', title: 'Hunder Sand Dunes Walk' },
            { id: 'att-5', title: 'Panamik Hot Springs Dip' },
            { id: 'att-6', title: 'Stargazing in Nubra' }
        ],
        'Hawa Mahal': [
            { id: 'att-1', title: 'Hawa Mahal Palace Tour' },
            { id: 'att-2', title: 'Amer Fort Elephant Ride' },
            { id: 'att-3', title: 'City Palace Museum Walk' },
            { id: 'att-4', title: 'Jantar Mantar Observatory' },
            { id: 'att-5', title: 'Chokhi Dhani Dinner Event' },
            { id: 'att-6', title: 'Johari Bazaar Shopping' }
        ],
        'Calangute Beach': [
            { id: 'att-1', title: 'Water Sports at Calangute' },
            { id: 'att-2', title: 'Aguada Fort Exploration' },
            { id: 'att-3', title: 'Dudhsagar Waterfalls Trek' },
            { id: 'att-4', title: 'Anjuna Flea Market Stroll' },
            { id: 'att-5', title: 'Baga Beach Shacks Dinner' },
            { id: 'att-6', title: 'Mandovi River Sunset Cruise' }
        ],
        'Varanasi Ghats': [
            { id: 'att-1', title: 'Subah-e-Banaras Boat Ride' },
            { id: 'att-2', title: 'Kashi Vishwanath Temple' },
            { id: 'att-3', title: 'Ganga Aarti Dashashwamedh' },
            { id: 'att-4', title: 'Sarnath Buddhist Stupas' },
            { id: 'att-5', title: 'Banarasi Weaving Center' },
            { id: 'att-6', title: 'Ghats Walks & Street Food' }
        ]
    };

    const generateTimelineHtml = (destName, bookingId) => {
        const pool = ITINERARY_POOL[destName] || [
            { title: 'Welcome & Hotel Check-in' },
            { title: 'Local Sightseeing & Market Walking Tour' },
            { title: 'Scenic Excursion to Nearby Viewpoints' },
            { title: 'Leisure Activity & Local Cuisines Tasting' },
            { title: 'Museum & Historical Landmarks visit' },
            { title: 'Souvenir Shopping & Farewell Check-out' }
        ];

        const savedNote = localStorage.getItem(`note-bk-${bookingId}`) || '';

        let timelineHtml = `
            <div style="margin-top: 15px; border-top: 1px dashed var(--border-color); padding-top: 15px; width: 100%;">
                <h5 style="margin: 0 0 10px 0; font-size: 0.9rem; color: var(--dark-color); display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-map-location-dot" style="color: var(--primary-color);"></i> Planned Daily Itinerary
                </h5>
                <div class="itinerary-timeline">
                    <div class="timeline-day">
                        <div class="timeline-day-title">Day 1: Arrival & Exploration</div>
                        <div class="timeline-day-desc">• ${pool[0].title}<br>• ${pool[1].title}</div>
                    </div>
                    <div class="timeline-day">
                        <div class="timeline-day-title">Day 2: Core Sightseeing & Adventure</div>
                        <div class="timeline-day-desc">• ${pool[2].title}<br>• ${pool[3].title}</div>
                    </div>
                    <div class="timeline-day" style="margin-bottom: 0;">
                        <div class="timeline-day-title">Day 3: Cultural Experiences & Departure</div>
                        <div class="timeline-day-desc">• ${pool[4].title}<br>• ${pool[5].title}</div>
                    </div>
                </div>
                <div style="margin-top: 12px;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 4px; color: var(--text-color);">My Trip Notes:</label>
                    <textarea placeholder="Write packing reminders, travel notes..." oninput="saveBookingNote('${bookingId}', this.value)" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); background: var(--light-color); color: var(--text-color); border-radius: 6px; font-size: 0.8rem; outline: none; resize: vertical; min-height: 50px;">${savedNote}</textarea>
                </div>
            </div>
        `;
        return timelineHtml;
    };

    const saveBookingNote = (bookingId, value) => {
        localStorage.setItem(`note-bk-${bookingId}`, value);
    };
    window.saveBookingNote = saveBookingNote;

    // --- L. Group Expense Splitter Logic ---
    let groupMembers = JSON.parse(localStorage.getItem('splitter-members') || '[]');
    let groupExpenses = JSON.parse(localStorage.getItem('splitter-expenses') || '[]');

    const addSplitterMember = () => {
        const input = document.getElementById('splitter-member-name');
        if (!input) return;
        const name = input.value.trim();
        if (!name) {
            showToast('Please enter a name.', 'error');
            return;
        }
        if (groupMembers.includes(name)) {
            showToast('Member already exists.', 'error');
            return;
        }
        groupMembers.push(name);
        localStorage.setItem('splitter-members', JSON.stringify(groupMembers));
        input.value = '';
        renderSplitterMembers();
        updateSplitterDropdowns();
        showToast(`Added ${name} to group`, 'success');
    };

    const renderSplitterMembers = () => {
        const list = document.getElementById('splitter-members-list');
        if (!list) return;
        list.innerHTML = '';
        groupMembers.forEach((name, idx) => {
            list.innerHTML += `
                <span style="background: var(--light-color); border: 1px solid var(--border-color); padding: 4px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 8px;">
                    ${name}
                    <i class="fa-solid fa-xmark" onclick="removeSplitterMember(${idx})" style="cursor: pointer; color: #ef4444;"></i>
                </span>
            `;
        });
    };

    const removeSplitterMember = (idx) => {
        const name = groupMembers[idx];
        groupMembers.splice(idx, 1);
        localStorage.setItem('splitter-members', JSON.stringify(groupMembers));
        groupExpenses = groupExpenses.filter(exp => exp.paidBy !== name);
        localStorage.setItem('splitter-expenses', JSON.stringify(groupExpenses));
        renderSplitterMembers();
        updateSplitterDropdowns();
        renderSplitterExpenses();
        calculateSplitterBalances();
    };

    const updateSplitterDropdowns = () => {
        const select = document.getElementById('splitter-expense-paid-by');
        if (!select) return;
        select.innerHTML = '<option value="" disabled selected>Who paid?</option>';
        groupMembers.forEach(name => {
            select.innerHTML += `<option value="${name}">${name}</option>`;
        });
    };

    const addSplitterExpense = (e) => {
        e.preventDefault();
        const paidBy = document.getElementById('splitter-expense-paid-by').value;
        const amount = parseFloat(document.getElementById('splitter-expense-amount').value);
        const desc = document.getElementById('splitter-expense-desc').value.trim();

        if (!paidBy || isNaN(amount) || amount <= 0 || !desc) {
            showToast('Please fill out all fields.', 'error');
            return;
        }

        const expense = {
            id: 'exp_' + Date.now(),
            paidBy,
            amount,
            desc,
            date: new Date().toLocaleDateString('en-IN')
        };

        groupExpenses.push(expense);
        localStorage.setItem('splitter-expenses', JSON.stringify(groupExpenses));

        document.getElementById('splitter-expense-amount').value = '';
        document.getElementById('splitter-expense-desc').value = '';
        document.getElementById('splitter-expense-paid-by').selectedIndex = 0;

        renderSplitterExpenses();
        calculateSplitterBalances();
        showToast('Expense logged successfully', 'success');
    };

    const renderSplitterExpenses = () => {
        const log = document.getElementById('splitter-expenses-log');
        if (!log) return;
        if (groupExpenses.length === 0) {
            log.innerHTML = '<p style="color: #888; text-align: center; padding: 20px; margin: 0;">No expenses logged yet.</p>';
            return;
        }
        log.innerHTML = '';
        groupExpenses.forEach((exp, idx) => {
            log.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid var(--border-color);">
                    <div>
                        <span style="font-weight: 700; color: var(--dark-color);">${exp.desc}</span>
                        <div style="font-size: 0.75rem; color: #888; margin-top: 2px;">Paid by ${exp.paidBy} on ${exp.date}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-weight: 700; color: var(--primary-color);">₹${exp.amount.toLocaleString('en-IN')}</span>
                        <i class="fa-solid fa-trash" onclick="removeSplitterExpense(${idx})" style="cursor: pointer; color: #ef4444; font-size: 0.85rem;"></i>
                    </div>
                </div>
            `;
        });
    };

    const removeSplitterExpense = (idx) => {
        groupExpenses.splice(idx, 1);
        localStorage.setItem('splitter-expenses', JSON.stringify(groupExpenses));
        renderSplitterExpenses();
        calculateSplitterBalances();
    };

    const calculateSplitterBalances = () => {
        const settlements = document.getElementById('splitter-settlements');
        if (!settlements) return;

        if (groupMembers.length < 2 || groupExpenses.length === 0) {
            settlements.innerHTML = '<p style="color: #888; text-align: center; margin: 0;">No balances to settle.</p>';
            return;
        }

        const balances = {};
        groupMembers.forEach(name => balances[name] = 0);

        const totalExpenses = groupExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const perPersonShare = totalExpenses / groupMembers.length;

        groupExpenses.forEach(exp => {
            if (balances[exp.paidBy] !== undefined) {
                balances[exp.paidBy] += exp.amount;
            }
        });

        groupMembers.forEach(name => {
            balances[name] -= perPersonShare;
        });

        const debtors = [];
        const creditors = [];

        groupMembers.forEach(name => {
            const bal = Math.round(balances[name] * 100) / 100;
            if (bal < -0.1) {
                debtors.push({ name, amount: -bal });
            } else if (bal > 0.1) {
                creditors.push({ name, amount: bal });
            }
        });

        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const transactions = [];
        let i = 0, j = 0;

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            const settledAmount = Math.min(debtor.amount, creditor.amount);
            transactions.push({
                from: debtor.name,
                to: creditor.name,
                amount: Math.round(settledAmount)
            });

            debtor.amount -= settledAmount;
            creditor.amount -= settledAmount;

            if (debtor.amount < 0.1) i++;
            if (creditor.amount < 0.1) j++;
        }

        if (transactions.length === 0) {
            settlements.innerHTML = '<p style="color: #10b981; font-weight: 600; text-align: center; margin: 0;"><i class="fa-solid fa-circle-check"></i> All balances are settled!</p>';
            return;
        }

        settlements.innerHTML = '<div style="display: flex; flex-direction: column; gap: 8px;">';
        transactions.forEach(tx => {
            settlements.innerHTML += `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 4px;">
                    <span><strong>${tx.from}</strong> owes <strong>${tx.to}</strong></span>
                    <span style="color: #ef4444; font-weight: 700;">₹${tx.amount.toLocaleString('en-IN')}</span>
                </div>
            `;
        });
        settlements.innerHTML += '</div>';
    };

    window.addSplitterMember = addSplitterMember;
    window.removeSplitterMember = removeSplitterMember;
    window.addSplitterExpense = addSplitterExpense;
    window.removeSplitterExpense = removeSplitterExpense;
    window.renderSplitterMembers = renderSplitterMembers;
    window.updateSplitterDropdowns = updateSplitterDropdowns;
    window.renderSplitterExpenses = renderSplitterExpenses;
    window.calculateSplitterBalances = calculateSplitterBalances;

    // --- M. Drag-and-Drop Day Planner Logic ---
    let activePlannerBookingId = '';
    let plannerDailyPlans = {};

    const updatePlannerBookingSelect = (bookings) => {
        const select = document.getElementById('planner-booking-select');
        if (!select) return;
        select.innerHTML = '<option value="" disabled selected>Select an active booking...</option>';
        bookings.forEach(bk => {
            select.innerHTML += `<option value="${bk.id}">${bk.destination} (Booking: ${bk.id})</option>`;
        });
    };

    const loadPlannerItinerary = (bookingId) => {
        activePlannerBookingId = bookingId;
        const select = document.getElementById('planner-booking-select');
        const option = select.options[select.selectedIndex];
        const destText = option.text.split(' (Booking:')[0];

        const grid = document.getElementById('planner-grid');
        const placeholder = document.getElementById('planner-placeholder');

        if (!grid || !placeholder) return;

        placeholder.style.display = 'none';
        grid.style.display = 'grid';

        const saved = localStorage.getItem(`planner-plan-${bookingId}`);
        if (saved) {
            plannerDailyPlans[bookingId] = JSON.parse(saved);
        } else {
            const attractions = ITINERARY_POOL[destText] || [
                { id: 'att-1', title: 'Arrival & Welcome' },
                { id: 'att-2', title: 'Local Sightseeing' },
                { id: 'att-3', title: 'Scenic Excursion' },
                { id: 'att-4', title: 'Leisure Activity' },
                { id: 'att-5', title: 'Cultural Landmarks' },
                { id: 'att-6', title: 'Farewell Checkout' }
            ];
            plannerDailyPlans[bookingId] = {
                day1: [],
                day2: [],
                day3: [],
                pool: [...attractions]
            };
        }

        renderPlannerGrid();
    };

    const renderPlannerGrid = () => {
        const plan = plannerDailyPlans[activePlannerBookingId];
        if (!plan) return;

        const poolContainer = document.getElementById('planner-attractions-pool');
        if (poolContainer) {
            poolContainer.innerHTML = '';
            if (plan.pool.length === 0) {
                poolContainer.innerHTML = '<span style="color: #888; font-size: 0.75rem; text-align: center; margin: 20px 0; display: block; width: 100%;">All items placed!</span>';
            } else {
                plan.pool.forEach(item => {
                    poolContainer.innerHTML += `
                        <div class="planner-attraction-card" draggable="true" ondragstart="handlePlannerDragStart(event, '${item.id}', 'pool')" id="card-${item.id}">
                            <span>${item.title}</span> <i class="fa-solid fa-grip-lines" style="color: #ccc; font-size: 0.8rem;"></i>
                        </div>
                    `;
                });
            }
        }

        for (let dayNum = 1; dayNum <= 3; dayNum++) {
            const col = document.querySelector(`.planner-day-col[data-day="${dayNum}"]`);
            if (col) {
                const dropzone = col.querySelector('.day-dropzone');
                dropzone.innerHTML = '';
                const items = plan[`day${dayNum}`] || [];
                
                items.forEach(item => {
                    dropzone.innerHTML += `
                        <div class="planner-attraction-card" draggable="true" ondragstart="handlePlannerDragStart(event, '${item.id}', 'day${dayNum}')" id="card-${item.id}" style="border-left: 3px solid var(--primary-color);">
                            <span>${item.title}</span>
                            <i class="fa-solid fa-xmark" onclick="removePlannerItem('${item.id}', ${dayNum})" style="cursor: pointer; color: #ef4444; font-size: 0.8rem; margin-left: 10px;"></i>
                        </div>
                    `;
                });
            }
        }
    };

    const handlePlannerDragStart = (e, itemId, sourceCol) => {
        e.dataTransfer.setData('text/plain', itemId);
        e.dataTransfer.setData('source-col', sourceCol);
    };

    const allowPlannerDrop = (e) => {
        e.preventDefault();
        const col = e.currentTarget;
        col.classList.add('drag-hover');
    };

    const handlePlannerDrop = (e, targetDayNum) => {
        e.preventDefault();
        const col = e.currentTarget;
        col.classList.remove('drag-hover');

        const itemId = e.dataTransfer.getData('text/plain');
        const sourceCol = e.dataTransfer.getData('source-col');
        const targetCol = `day${targetDayNum}`;

        if (sourceCol === targetCol) return;

        const plan = plannerDailyPlans[activePlannerBookingId];
        if (!plan) return;

        let itemToMove = null;
        if (sourceCol === 'pool') {
            itemToMove = plan.pool.find(i => i.id === itemId);
            plan.pool = plan.pool.filter(i => i.id !== itemId);
        } else {
            itemToMove = plan[sourceCol].find(i => i.id === itemId);
            plan[sourceCol] = plan[sourceCol].filter(i => i.id !== itemId);
        }

        if (itemToMove) {
            plan[targetCol].push(itemToMove);
            localStorage.setItem(`planner-plan-${activePlannerBookingId}`, JSON.stringify(plan));
            renderPlannerGrid();
        }
    };

    const removePlannerItem = (itemId, dayNum) => {
        const plan = plannerDailyPlans[activePlannerBookingId];
        if (!plan) return;

        const sourceCol = `day${dayNum}`;
        const itemToMove = plan[sourceCol].find(i => i.id === itemId);
        
        if (itemToMove) {
            plan[sourceCol] = plan[sourceCol].filter(i => i.id !== itemId);
            plan.pool.push(itemToMove);
            localStorage.setItem(`planner-plan-${activePlannerBookingId}`, JSON.stringify(plan));
            renderPlannerGrid();
        }
    };

    document.querySelectorAll('.planner-day-col').forEach(col => {
        col.addEventListener('dragleave', () => {
            col.classList.remove('drag-hover');
        });
    });

    window.loadPlannerItinerary = loadPlannerItinerary;
    window.allowPlannerDrop = allowPlannerDrop;
    window.handlePlannerDrop = handlePlannerDrop;
    window.handlePlannerDragStart = handlePlannerDragStart;
    window.removePlannerItem = removePlannerItem;
    window.updatePlannerBookingSelect = updatePlannerBookingSelect;

    autofillSavedCredentials();

    // --- F. Legal Policies & FAQs Accordions / Tabs ---
    const openLegalModal = (tabName = 'terms') => {
        const modal = document.getElementById('legal-modal');
        if (modal) modal.style.display = 'flex';
        switchLegalTab(tabName);
    };

    const closeLegalModal = () => {
        const modal = document.getElementById('legal-modal');
        if (modal) modal.style.display = 'none';
    };

    const switchLegalTab = (tabName) => {
        const tabs = ['terms', 'privacy', 'cancellation', 'faqs'];
        tabs.forEach(t => {
            const btn = document.getElementById(`legal-tab-${t}`);
            const pane = document.getElementById(`legal-content-${t}`);
            if (btn) {
                if (t === tabName) {
                    btn.style.color = 'var(--primary-color)';
                    btn.style.borderBottom = '3px solid var(--primary-color)';
                } else {
                    btn.style.color = '#888';
                    btn.style.borderBottom = 'none';
                }
            }
            if (pane) {
                pane.style.display = t === tabName ? 'block' : 'none';
            }
        });
    };

    const toggleFaqAccordion = (heading) => {
        const p = heading.nextElementSibling;
        const icon = heading.querySelector('i');
        if (p) {
            const isHidden = p.style.display === 'none' || p.style.display === '';
            if (isHidden) {
                p.style.display = 'block';
                if (icon) {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                }
            } else {
                p.style.display = 'none';
                if (icon) {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            }
        }
    };

    window.openLegalModal = openLegalModal;
    window.closeLegalModal = closeLegalModal;
    window.switchLegalTab = switchLegalTab;
    window.toggleFaqAccordion = toggleFaqAccordion;
});
