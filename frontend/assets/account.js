// Account Page JavaScript
class AccountManager {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.apiBaseUrl = 'http://localhost:8081/api/v1'; // MuleSoft API
        this.init();
    }

    init() {
        this.checkLoginStatus();
        this.setupEventListeners();
        this.loadUserData();
    }

    checkLoginStatus() {
        // Check if user is logged in (check localStorage, session, etc.)
        const userData = localStorage.getItem('userData');
        const authToken = localStorage.getItem('authToken');
        
        if (userData && authToken) {
            this.isLoggedIn = true;
            this.currentUser = JSON.parse(userData);
            this.showDashboard();
        } else {
            this.isLoggedIn = false;
            this.showAuthForms();
        }
    }

    setupEventListeners() {
        // Password strength checker for registration
        const registerPassword = document.getElementById('register-password');
        if (registerPassword) {
            registerPassword.addEventListener('input', this.checkPasswordStrength);
        }

        // Form validation
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => e.preventDefault());
        });
    }

    showAuthForms() {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('account-dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('account-dashboard').style.display = 'block';
        this.loadDashboardData();
    }

    async loadUserData() {
        if (!this.isLoggedIn) return;

        try {
            // Load user profile from API
            const profile = await this.makeApiCall('/user/profile');
            this.updateUserProfile(profile);
        } catch (error) {
            console.error('Error loading user data:', error);
            // Use mock data if API fails
            this.loadMockUserData();
        }
    }

    loadMockUserData() {
        this.currentUser = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@email.com',
            phone: '+1 (555) 123-4567',
            birthday: '1990-01-15',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            memberSince: '2024-10-01',
            stats: {
                totalOrders: 12,
                totalSpent: 486.50,
                loyaltyPoints: 2430
            }
        };
        this.updateUserProfile(this.currentUser);
    }

    updateUserProfile(userData) {
        document.getElementById('user-name').textContent = `${userData.firstName} ${userData.lastName}`;
        document.getElementById('user-avatar').src = userData.avatar;
        document.getElementById('member-since').textContent = new Date(userData.memberSince).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
        
        if (userData.stats) {
            document.getElementById('total-orders').textContent = userData.stats.totalOrders;
            document.getElementById('total-spent').textContent = `$${userData.stats.totalSpent.toFixed(2)}`;
            document.getElementById('loyalty-points').textContent = userData.stats.loyaltyPoints.toLocaleString();
        }

        // Update profile form
        if (document.getElementById('profile-firstname')) {
            document.getElementById('profile-firstname').value = userData.firstName;
            document.getElementById('profile-lastname').value = userData.lastName;
            document.getElementById('profile-email').value = userData.email;
            document.getElementById('profile-phone').value = userData.phone || '';
            document.getElementById('profile-birthday').value = userData.birthday || '';
        }
    }

    async loadDashboardData() {
        await Promise.all([
            this.loadRecentOrders(),
            this.loadWishlist(),
            this.loadAddresses(),
            this.loadPaymentMethods(),
            this.loadRecommendations()
        ]);
    }

    async loadRecentOrders() {
        try {
            const orders = await this.makeApiCall('/user/orders?limit=3');
            this.renderRecentOrders(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
            this.loadMockOrders();
        }
    }

    loadMockOrders() {
        const mockOrders = [
            {
                id: 'ORD-2024-001',
                date: '2024-10-15',
                status: 'delivered',
                total: 89.99,
                items: [
                    { name: 'Deluxe Vampire Costume', price: 89.99, image: 'https://images.unsplash.com/photo-1509557965350-b0c0d8c56b2f?w=100' }
                ]
            },
            {
                id: 'ORD-2024-002',
                date: '2024-10-12',
                status: 'shipped',
                total: 156.47,
                items: [
                    { name: 'Witch Hat Set', price: 24.99, image: 'https://images.unsplash.com/photo-1544473244-47f9d28a8e2f?w=100' },
                    { name: 'Spooky Decorations Pack', price: 131.48, image: 'https://images.unsplash.com/photo-1572478200520-6d5b14d6ac11?w=100' }
                ]
            },
            {
                id: 'ORD-2024-003',
                date: '2024-10-08',
                status: 'pending',
                total: 74.99,
                items: [
                    { name: 'Zombie Pirate Costume', price: 74.99, image: 'https://images.unsplash.com/photo-1576073734374-b6b6b73b8d36?w=100' }
                ]
            }
        ];
        
        this.renderRecentOrders(mockOrders);
        this.renderAllOrders(mockOrders);
    }

    renderRecentOrders(orders) {
        const container = document.getElementById('recent-orders');
        if (!container) return;

        container.innerHTML = orders.slice(0, 3).map(order => `
            <div class="recent-order-item">
                <div class="order-info">
                    <strong>${order.id}</strong>
                    <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div class="order-status ${order.status}">${this.capitalizeFirst(order.status)}</div>
                <div class="order-total">$${order.total.toFixed(2)}</div>
            </div>
        `).join('');
    }

    renderAllOrders(orders) {
        const container = document.getElementById('orders-list');
        if (!container) return;

        container.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-number">Order ${order.id}</div>
                    <div class="order-status ${order.status}">${this.capitalizeFirst(order.status)}</div>
                </div>
                <div class="order-details">
                    <div class="order-meta">
                        <span>Date: ${new Date(order.date).toLocaleDateString()}</span>
                        <span>Total: $${order.total.toFixed(2)}</span>
                        <span>Items: ${order.items.length}</span>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item-detail">
                                <img src="${item.image}" alt="${item.name}" class="item-image">
                                <div class="item-info">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-price">$${item.price.toFixed(2)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-actions">
                        <button class="order-btn view-details" onclick="viewOrderDetails('${order.id}')">
                            View Details
                        </button>
                        ${order.status === 'delivered' ? `
                            <button class="order-btn reorder" onclick="reorderItems('${order.id}')">
                                Reorder
                            </button>
                        ` : ''}
                        ${order.status === 'pending' ? `
                            <button class="order-btn cancel" onclick="cancelOrder('${order.id}')">
                                Cancel
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadWishlist() {
        try {
            const wishlist = await this.makeApiCall('/user/wishlist');
            this.renderWishlist(wishlist);
        } catch (error) {
            console.error('Error loading wishlist:', error);
            this.loadMockWishlist();
        }
    }

    loadMockWishlist() {
        const mockWishlist = [
            {
                id: 1,
                name: 'Classic Witch Costume',
                price: 59.99,
                image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=300'
            },
            {
                id: 2,
                name: 'Spooky Skull Mask',
                price: 24.99,
                image: 'https://images.unsplash.com/photo-1576073734374-b6b6b73b8d36?w=300'
            },
            {
                id: 3,
                name: 'Gothic Victorian Dress',
                price: 99.99,
                image: 'https://images.unsplash.com/photo-1544473244-47f9d28a8e2f?w=300'
            }
        ];
        
        this.renderWishlist(mockWishlist);
    }

    renderWishlist(items) {
        const container = document.getElementById('wishlist-grid');
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart" style="font-size: 3rem; color: #dee2e6; margin-bottom: 1rem;"></i>
                    <h3>Your wishlist is empty</h3>
                    <p>Start adding items you love!</p>
                    <a href="products.html" class="action-btn">Browse Products</a>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="wishlist-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="wishlist-item-info">
                    <div class="wishlist-item-title">${item.name}</div>
                    <div class="wishlist-item-price">$${item.price.toFixed(2)}</div>
                    <div class="wishlist-actions">
                        <button class="wishlist-btn add-to-cart" onclick="addWishlistToCart(${item.id})">
                            Add to Cart
                        </button>
                        <button class="wishlist-btn remove-wishlist" onclick="removeFromWishlist(${item.id})">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadAddresses() {
        try {
            const addresses = await this.makeApiCall('/user/addresses');
            this.renderAddresses(addresses);
        } catch (error) {
            console.error('Error loading addresses:', error);
            this.loadMockAddresses();
        }
    }

    loadMockAddresses() {
        const mockAddresses = [
            {
                id: 1,
                name: 'Home',
                isDefault: true,
                fullName: 'John Doe',
                address: '123 Spooky Lane',
                city: 'Halloween City',
                state: 'PA',
                zipCode: '12345',
                country: 'USA'
            },
            {
                id: 2,
                name: 'Work',
                isDefault: false,
                fullName: 'John Doe',
                address: '456 Business Ave',
                city: 'Corporate Town',
                state: 'PA',
                zipCode: '54321',
                country: 'USA'
            }
        ];
        
        this.renderAddresses(mockAddresses);
    }

    renderAddresses(addresses) {
        const container = document.getElementById('addresses-grid');
        if (!container) return;

        if (addresses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-map-marker-alt" style="font-size: 3rem; color: #dee2e6; margin-bottom: 1rem;"></i>
                    <h3>No addresses saved</h3>
                    <p>Add an address for faster checkout</p>
                    <button class="action-btn" onclick="showAddAddressForm()">Add Address</button>
                </div>
            `;
            return;
        }

        container.innerHTML = addresses.map(address => `
            <div class="address-card ${address.isDefault ? 'default' : ''}">
                <div class="address-info">
                    <div class="address-name">${address.name}</div>
                    <div class="address-details">
                        ${address.fullName}<br>
                        ${address.address}<br>
                        ${address.city}, ${address.state} ${address.zipCode}<br>
                        ${address.country}
                    </div>
                </div>
                <div class="address-actions">
                    <button class="address-btn edit-address" onclick="editAddress(${address.id})">
                        Edit
                    </button>
                    ${!address.isDefault ? `
                        <button class="address-btn set-default" onclick="setDefaultAddress(${address.id})">
                            Set Default
                        </button>
                        <button class="address-btn delete-address" onclick="deleteAddress(${address.id})">
                            Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    async loadPaymentMethods() {
        try {
            const methods = await this.makeApiCall('/user/payment-methods');
            this.renderPaymentMethods(methods);
        } catch (error) {
            console.error('Error loading payment methods:', error);
            this.loadMockPaymentMethods();
        }
    }

    loadMockPaymentMethods() {
        const mockMethods = [
            {
                id: 1,
                type: 'visa',
                lastFour: '4242',
                expiryMonth: 12,
                expiryYear: 2027,
                isDefault: true
            },
            {
                id: 2,
                type: 'mastercard',
                lastFour: '8888',
                expiryMonth: 8,
                expiryYear: 2026,
                isDefault: false
            }
        ];
        
        this.renderPaymentMethods(mockMethods);
    }

    renderPaymentMethods(methods) {
        const container = document.getElementById('payment-methods');
        if (!container) return;

        if (methods.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-credit-card" style="font-size: 3rem; color: #dee2e6; margin-bottom: 1rem;"></i>
                    <h3>No payment methods saved</h3>
                    <p>Add a payment method for faster checkout</p>
                    <button class="action-btn" onclick="showAddPaymentForm()">Add Payment Method</button>
                </div>
            `;
            return;
        }

        container.innerHTML = methods.map(method => `
            <div class="payment-card ${method.isDefault ? 'default' : ''}">
                <div class="payment-info">
                    <div class="payment-icon">
                        <i class="fab fa-cc-${method.type}"></i>
                    </div>
                    <div class="payment-details">
                        <div class="payment-number">**** **** **** ${method.lastFour}</div>
                        <div class="payment-expiry">Expires ${method.expiryMonth}/${method.expiryYear}</div>
                    </div>
                </div>
                <div class="payment-actions">
                    ${!method.isDefault ? `
                        <button class="address-btn set-default" onclick="setDefaultPayment(${method.id})">
                            Set Default
                        </button>
                    ` : ''}
                    <button class="address-btn delete-address" onclick="deletePaymentMethod(${method.id})">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadRecommendations() {
        try {
            const recommendations = await this.makeApiCall('/user/recommendations');
            this.renderRecommendations(recommendations);
        } catch (error) {
            console.error('Error loading recommendations:', error);
            this.loadMockRecommendations();
        }
    }

    loadMockRecommendations() {
        const mockRecommendations = [
            {
                id: 1,
                name: 'Vampire Cape',
                price: 29.99,
                image: 'https://images.unsplash.com/photo-1509557965350-b0c0d8c56b2f?w=150',
                reason: 'Perfect with your recent vampire costume'
            },
            {
                id: 2,
                name: 'Spooky Candles',
                price: 19.99,
                image: 'https://images.unsplash.com/photo-1572478200520-6d5b14d6ac11?w=150',
                reason: 'Complete your Halloween decor'
            }
        ];
        
        this.renderRecommendations(mockRecommendations);
    }

    renderRecommendations(items) {
        const container = document.getElementById('recommendations');
        if (!container) return;

        container.innerHTML = items.map(item => `
            <div class="recommendation-item">
                <img src="${item.image}" alt="${item.name}" class="rec-image">
                <div class="rec-info">
                    <div class="rec-name">${item.name}</div>
                    <div class="rec-price">${item.price.toFixed(2)}</div>
                    <div class="rec-reason">${item.reason}</div>
                </div>
                <button class="rec-btn" onclick="window.location.href='product-detail.html?id=${item.id}'">
                    View
                </button>
            </div>
        `).join('');
    }

    checkPasswordStrength(event) {
        const password = event.target.value;
        const strengthDiv = document.getElementById('password-strength');
        
        if (!strengthDiv) return;

        let strength = 0;
        let feedback = '';

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        switch (strength) {
            case 0:
            case 1:
                feedback = 'Very weak password';
                strengthDiv.className = 'password-strength weak';
                break;
            case 2:
            case 3:
                feedback = 'Medium strength password';
                strengthDiv.className = 'password-strength medium';
                break;
            case 4:
            case 5:
                feedback = 'Strong password';
                strengthDiv.className = 'password-strength strong';
                break;
        }

        strengthDiv.textContent = password.length > 0 ? feedback : '';
    }

    async makeApiCall(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            },
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }

        return response.json();
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Global functions for HTML event handlers
function toggleAuthForm(formType) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authButtons = document.querySelectorAll('.auth-btn');

    // Toggle form visibility
    if (formType === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }

    // Update button states
    authButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.form === formType);
    });
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    const icon = toggle.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        // Simulate login API call
        const loginData = {
            email: email,
            password: password,
            rememberMe: rememberMe
        };

        // For demo purposes, simulate successful login
        const userData = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: email,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            memberSince: '2024-10-01'
        };

        const authToken = 'demo-token-' + Date.now();

        // Store user data
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('authToken', authToken);

        // Update account manager
        window.accountManager.isLoggedIn = true;
        window.accountManager.currentUser = userData;
        window.accountManager.showDashboard();

        showNotification('Login successful! Welcome back!', 'success');

    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please check your credentials.', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('register-firstname').value;
    const lastName = document.getElementById('register-lastname').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const termsAgreed = document.getElementById('terms-agreement').checked;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }

    if (!termsAgreed) {
        showNotification('Please agree to the Terms of Service', 'error');
        return;
    }

    try {
        // Simulate registration API call
        const registerData = {
            firstName,
            lastName,
            email,
            password,
            newsletter: document.getElementById('newsletter-signup').checked
        };

        // For demo purposes, simulate successful registration
        const userData = {
            id: 1,
            firstName,
            lastName,
            email,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            memberSince: new Date().toISOString().split('T')[0]
        };

        const authToken = 'demo-token-' + Date.now();

        // Store user data
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('authToken', authToken);

        // Update account manager
        window.accountManager.isLoggedIn = true;
        window.accountManager.currentUser = userData;
        window.accountManager.showDashboard();

        showNotification('Account created successfully! Welcome to Spencer\'s Halloween!', 'success');

    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

function showForgotPassword() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>Reset Password</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        <form onsubmit="handleForgotPassword(event)">
            <div class="form-group">
                <label for="reset-email">Email Address</label>
                <div class="input-wrapper">
                    <i class="fas fa-envelope"></i>
                    <input type="email" id="reset-email" required>
                </div>
            </div>
            <button type="submit" class="auth-submit-btn">
                <i class="fas fa-paper-plane"></i>
                Send Reset Link
            </button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';
}

function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('reset-email').value;
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }

    // Simulate API call
    showNotification('Password reset link sent to your email!', 'success');
    closeModal();
}

function socialLogin(provider) {
    showNotification(`${provider} login will be implemented soon!`, 'info');
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Add active class to selected nav item
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
}

function uploadAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('user-avatar').src = e.target.result;
                showNotification('Avatar updated successfully!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function saveProfile(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const profileData = Object.fromEntries(formData);

    // Simulate API call to save profile
    setTimeout(() => {
        showNotification('Profile updated successfully!', 'success');
        
        // Update displayed name
        document.getElementById('user-name').textContent = `${profileData.firstName} ${profileData.lastName}`;
    }, 500);
}

function showChangePassword() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>Change Password</h2>
        <form onsubmit="handleChangePassword(event)">
            <div class="form-group">
                <label for="current-password">Current Password</label>
                <div class="input-wrapper">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="current-password" required>
                </div>
            </div>
            <div class="form-group">
                <label for="new-password">New Password</label>
                <div class="input-wrapper">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="new-password" required>
                </div>
            </div>
            <div class="form-group">
                <label for="confirm-new-password">Confirm New Password</label>
                <div class="input-wrapper">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="confirm-new-password" required>
                </div>
            </div>
            <button type="submit" class="auth-submit-btn">
                <i class="fas fa-save"></i>
                Update Password
            </button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';
}

function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }

    // Simulate API call
    showNotification('Password changed successfully!', 'success');
    closeModal();
}

function enableTwoFactor() {
    showNotification('Two-factor authentication setup will be implemented soon!', 'info');
}

function saveNotificationPreferences() {
    const preferences = {};
    
    document.querySelectorAll('.notification-option input[type="checkbox"]').forEach(checkbox => {
        const label = checkbox.closest('.notification-option').querySelector('strong').textContent;
        preferences[label] = checkbox.checked;
    });

    // Simulate API call
    showNotification('Notification preferences saved!', 'success');
}

function filterOrders() {
    const filter = document.getElementById('orders-filter-select').value;
    showNotification(`Filtering orders by: ${filter}`, 'info');
    // Implementation would filter the orders list
}

function viewOrderDetails(orderId) {
    showNotification(`Viewing details for order ${orderId}`, 'info');
    // Implementation would show order details modal
}

function reorderItems(orderId) {
    showNotification(`Items from order ${orderId} added to cart!`, 'success');
    // Implementation would add order items to cart
}

function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        showNotification(`Order ${orderId} cancelled successfully`, 'success');
        // Implementation would cancel the order via API
    }
}

function addWishlistToCart(itemId) {
    showNotification('Item added to cart!', 'success');
    // Implementation would add item to cart
}

function removeFromWishlist(itemId) {
    if (confirm('Remove this item from your wishlist?')) {
        showNotification('Item removed from wishlist', 'success');
        // Implementation would remove from wishlist
    }
}

function showAddAddressForm() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>Add New Address</h2>
        <form onsubmit="handleAddAddress(event)">
            <div class="form-group">
                <label for="address-name">Address Name</label>
                <input type="text" id="address-name" placeholder="e.g., Home, Work" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="address-firstname">First Name</label>
                    <input type="text" id="address-firstname" required>
                </div>
                <div class="form-group">
                    <label for="address-lastname">Last Name</label>
                    <input type="text" id="address-lastname" required>
                </div>
            </div>
            <div class="form-group">
                <label for="address-street">Street Address</label>
                <input type="text" id="address-street" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="address-city">City</label>
                    <input type="text" id="address-city" required>
                </div>
                <div class="form-group">
                    <label for="address-state">State</label>
                    <input type="text" id="address-state" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="address-zip">ZIP Code</label>
                    <input type="text" id="address-zip" required>
                </div>
                <div class="form-group">
                    <label for="address-country">Country</label>
                    <select id="address-country" required>
                        <option value="USA">United States</option>
                        <option value="CA">Canada</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="address-default">
                    <span class="checkmark"></span>
                    Set as default address
                </label>
            </div>
            <button type="submit" class="auth-submit-btn">
                <i class="fas fa-save"></i>
                Save Address
            </button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';
}

function handleAddAddress(event) {
    event.preventDefault();
    showNotification('Address added successfully!', 'success');
    closeModal();
    // Implementation would save address via API
}

function editAddress(addressId) {
    showNotification(`Editing address ${addressId}`, 'info');
    // Implementation would show edit form
}

function setDefaultAddress(addressId) {
    showNotification('Default address updated!', 'success');
    // Implementation would update default address
}

function deleteAddress(addressId) {
    if (confirm('Are you sure you want to delete this address?')) {
        showNotification('Address deleted successfully', 'success');
        // Implementation would delete address
    }
}

function showAddPaymentForm() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>Add Payment Method</h2>
        <form onsubmit="handleAddPayment(event)">
            <div class="form-group">
                <label for="card-number">Card Number</label>
                <input type="text" id="card-number" placeholder="1234 5678 9012 3456" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="card-expiry">Expiry Date</label>
                    <input type="text" id="card-expiry" placeholder="MM/YY" required>
                </div>
                <div class="form-group">
                    <label for="card-cvv">CVV</label>
                    <input type="text" id="card-cvv" placeholder="123" required>
                </div>
            </div>
            <div class="form-group">
                <label for="card-name">Name on Card</label>
                <input type="text" id="card-name" required>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="payment-default">
                    <span class="checkmark"></span>
                    Set as default payment method
                </label>
            </div>
            <button type="submit" class="auth-submit-btn">
                <i class="fas fa-save"></i>
                Save Payment Method
            </button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';
}

function handleAddPayment(event) {
    event.preventDefault();
    showNotification('Payment method added successfully!', 'success');
    closeModal();
    // Implementation would save payment method via API
}

function setDefaultPayment(paymentId) {
    showNotification('Default payment method updated!', 'success');
    // Implementation would update default payment
}

function deletePaymentMethod(paymentId) {
    if (confirm('Are you sure you want to remove this payment method?')) {
        showNotification('Payment method removed successfully', 'success');
        // Implementation would delete payment method
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        
        window.accountManager.isLoggedIn = false;
        window.accountManager.currentUser = null;
        window.accountManager.showAuthForms();
        
        showNotification('Logged out successfully!', 'success');
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
            break;
        case 'info':
            notification.style.background = 'linear-gradient(135deg, #17a2b8, #138496)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #6c757d, #5a6268)';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Initialize account manager when page loads
let accountManager;
document.addEventListener('DOMContentLoaded', () => {
    window.accountManager = new AccountManager();
    updateCartCount();

    // Close modal when clicking outside
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            closeModal();
        }
    });
});