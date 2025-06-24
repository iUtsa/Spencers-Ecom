// Main Application Controller for Spencer's Halloween Store

class SpencersApp {
    constructor() {
        this.isLoaded = false;
        this.currentSection = 'home';
        this.products = [];
        this.apiBaseUrl = '/api'; // Will connect to your MuleSoft APIs
        this.init();
    }

    async init() {
        this.bindEvents();
        this.initializeNavigation();
        this.loadProducts();
        this.initializeNewsletter();
        this.handleScrollEffects();
        this.preloadAssets();
        
        // Mark app as loaded
        this.isLoaded = true;
        this.hideLoadingScreen();
    }

    // Initialize navigation and smooth scrolling
    initializeNavigation() {
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update current section
                    this.currentSection = targetId.substring(1);
                    this.updateActiveNavLink();
                }
            });
        });

        // Update active nav link based on scroll position
        window.addEventListener('scroll', () => {
            this.updateActiveNavLink();
        });
    }

    // Update active navigation link
    updateActiveNavLink() {
        const sections = ['home', 'categories', 'featured'];
        const navLinks = document.querySelectorAll('.nav-links a');
        
        let currentSection = 'home';
        
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    currentSection = section;
                }
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentSection}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Load products from API
    async loadProducts() {
        try {
            // Show loading state
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                productsGrid.innerHTML = this.createLoadingGrid();
            }

            // Future API integration:
            /*
            const response = await fetch(`${this.apiBaseUrl}/products/featured`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load products');
            }

            this.products = await response.json();
            */

            // Demo products for now
            this.products = this.generateDemoProducts();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.renderProducts();

        } catch (error) {
            console.error('Error loading products:', error);
            this.showProductError();
        }
    }

    // Generate demo products
    generateDemoProducts() {
        const categories = ['costume', 'decoration', 'accessory', 'makeup'];
        const adjectives = ['Spooky', 'Deluxe', 'Professional', 'Ultimate', 'Classic', 'Premium'];
        const nouns = {
            costume: ['Vampire', 'Witch', 'Zombie', 'Ghost', 'Skeleton', 'Demon'],
            decoration: ['Pumpkin', 'Spider', 'Skull', 'Lantern', 'Garland', 'Wreath'],
            accessory: ['Mask', 'Hat', 'Cape', 'Gloves', 'Jewelry', 'Prop'],
            makeup: ['Face Paint', 'Fake Blood', 'Scar Kit', 'Fangs', 'Contact Lenses', 'Prosthetics']
        };

        const products = [];
        
        for (let i = 0; i < 12; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[category][Math.floor(Math.random() * nouns[category].length)];
            
            products.push({
                id: `product_${i + 1}`,
                name: `${adjective} ${noun} ${category === 'costume' ? 'Costume' : category === 'decoration' ? 'Decoration' : category === 'accessory' ? 'Set' : 'Kit'}`,
                price: Math.round((Math.random() * 80 + 10) * 100) / 100,
                originalPrice: Math.round((Math.random() * 20 + 80) * 100) / 100,
                category: category,
                rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
                reviews: Math.floor(Math.random() * 500 + 50),
                image: `https://via.placeholder.com/300x250/1a0d2e/ff4500?text=${encodeURIComponent(noun)}`,
                inStock: Math.random() > 0.1,
                featured: Math.random() > 0.7,
                discount: Math.random() > 0.6 ? Math.floor(Math.random() * 30 + 10) : 0
            });
        }

        return products;
    }

    // Render products in grid
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        productsGrid.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
        
        // Add entrance animations
        this.animateProductCards();
    }

    // Create individual product card
    createProductCard(product) {
        const discountBadge = product.discount > 0 ? 
            `<div class="discount-badge">-${product.discount}%</div>` : '';
        
        const stockStatus = !product.inStock ? 
            `<div class="out-of-stock">Out of Stock</div>` : '';

        return `
            <div class="product-card" data-product-id="${product.id}" data-category="${product.category}">
                ${discountBadge}
                ${stockStatus}
                <div class="product-image">
                    <div class="product-3d" data-product="${JSON.stringify(product).replace(/"/g, '&quot;')}"></div>
                    <div class="product-overlay">
                        <button class="quick-view-btn" data-product='${JSON.stringify(product)}'>Quick View</button>
                        <button class="view-3d-btn" data-product='${JSON.stringify(product)}'>View 3D</button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-rating">
                        <div class="stars">${this.generateStars(product.rating)}</div>
                        <span class="rating-text">(${product.reviews} reviews)</span>
                    </div>
                    <div class="product-pricing">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        ${product.originalPrice > product.price ? 
                            `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                    </div>
                    <button class="add-to-cart ${!product.inStock ? 'disabled' : ''}" 
                            ${!product.inStock ? 'disabled' : ''}>
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        `;
    }

    // Generate star rating display
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (halfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }

    // Create loading grid
    createLoadingGrid() {
        return Array(8).fill(0).map(() => `
            <div class="product-card loading skeleton">
                <div class="product-image skeleton"></div>
                <div class="product-info">
                    <div class="skeleton" style="height: 20px; margin-bottom: 10px;"></div>
                    <div class="skeleton" style="height: 15px; margin-bottom: 10px; width: 60%;"></div>
                    <div class="skeleton" style="height: 18px; margin-bottom: 10px; width: 40%;"></div>
                    <div class="skeleton" style="height: 40px;"></div>
                </div>
            </div>
        `).join('');
    }

    // Show product loading error
    showProductError() {
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">💀</div>
                    <h3>Oops! Something spooky happened</h3>
                    <p>We couldn't load the products right now. Please try again later.</p>
                    <button class="retry-btn" onclick="window.spencersApp.loadProducts()">Try Again</button>
                </div>
            `;
        }
    }

    // Animate product cards entrance
    animateProductCards() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Initialize newsletter popup
    initializeNewsletter() {
        // Show newsletter popup after 5 seconds
        setTimeout(() => {
            const popup = document.getElementById('newsletterPopup');
            if (popup && !localStorage.getItem('newsletter_shown')) {
                popup.classList.add('active');
                localStorage.setItem('newsletter_shown', 'true');
            }
        }, 5000);

        // Handle newsletter form submission
        const form = document.getElementById('newsletterForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = form.querySelector('input[type="email"]').value;
                await this.subscribeNewsletter(email);
            });
        }

        // Close newsletter popup
        document.getElementById('closeNewsletter')?.addEventListener('click', () => {
            document.getElementById('newsletterPopup')?.classList.remove('active');
        });
    }

    // Subscribe to newsletter
    async subscribeNewsletter(email) {
        try {
            // Future API integration:
            /*
            const response = await fetch(`${this.apiBaseUrl}/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error('Subscription failed');
            }
            */

            // Demo success
            this.showNotification('Successfully subscribed to our newsletter! 🎃', 'success');
            document.getElementById('newsletterPopup')?.classList.remove('active');

        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showNotification('Failed to subscribe. Please try again.', 'error');
        }
    }

    // Handle scroll effects and animations
    handleScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe sections for animations
        document.querySelectorAll('.categories, .featured-products, .footer').forEach(section => {
            observer.observe(section);
        });
    }

    // Search functionality
    async performSearch(query) {
        try {
            if (!query.trim()) return;

            // Future API integration:
            /*
            const response = await fetch(`${this.apiBaseUrl}/products/search?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const results = await response.json();
            */

            // Demo search logic
            const results = this.products.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            );

            this.displaySearchResults(results, query);

        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('Search failed. Please try again.', 'error');
        }
    }

    // Display search results
    displaySearchResults(results, query) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        if (results.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>No results found for "${query}"</h3>
                    <p>Try searching for different terms or browse our categories</p>
                    <button class="clear-search-btn" onclick="window.spencersApp.clearSearch()">Show All Products</button>
                </div>
            `;
        } else {
            productsGrid.innerHTML = `
                <div class="search-header">
                    <h3>Found ${results.length} results for "${query}"</h3>
                    <button class="clear-search-btn" onclick="window.spencersApp.clearSearch()">Show All</button>
                </div>
                ${results.map(product => this.createProductCard(product)).join('')}
            `;
        }
    }

    // Clear search and show all products
    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.renderProducts();
    }

    // Filter products by category
    filterByCategory(category) {
        const filtered = category === 'all' ? 
            this.products : 
            this.products.filter(product => product.category === category);
        
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = filtered.map(product => this.createProductCard(product)).join('');
            this.animateProductCards();
        }
    }

    // Sort products
    sortProducts(sortBy) {
        let sorted = [...this.products];
        
        switch (sortBy) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case 'popularity':
                sorted.sort((a, b) => b.reviews - a.reviews);
                break;
            case 'newest':
                // Demo: random order for newest
                sorted.sort(() => Math.random() - 0.5);
                break;
            default:
                // Keep original order
                break;
        }
        
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = sorted.map(product => this.createProductCard(product)).join('');
            this.animateProductCards();
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `app-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            min-width: 300px;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.parentElement.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Preload assets for better performance
    async preloadAssets() {
        const imagesToPreload = [
            'https://via.placeholder.com/300x250/1a0d2e/ff4500?text=Vampire',
            'https://via.placeholder.com/300x250/1a0d2e/ff4500?text=Witch',
            'https://via.placeholder.com/300x250/1a0d2e/ff4500?text=Zombie'
        ];

        const preloadPromises = imagesToPreload.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = src;
            });
        });

        try {
            await Promise.all(preloadPromises);
            console.log('Assets preloaded successfully');
        } catch (error) {
            console.warn('Some assets failed to preload:', error);
        }
    }

    // Hide loading screen
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    // Handle quick actions
    handleQuickAction(action) {
        switch (action) {
            case 'shop-now':
                document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'explore-3d':
                this.showNotification('3D exploration mode activated! 🎃', 'info');
                break;
            case 'view-categories':
                document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    // Get product recommendations
    async getRecommendations(productId) {
        try {
            // Future API integration:
            /*
            const response = await fetch(`${this.apiBaseUrl}/products/${productId}/recommendations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get recommendations');
            }

            return await response.json();
            */

            // Demo recommendations
            const currentProduct = this.products.find(p => p.id === productId);
            if (!currentProduct) return [];

            const recommendations = this.products
                .filter(p => p.id !== productId && p.category === currentProduct.category)
                .slice(0, 4);

            return recommendations;

        } catch (error) {
            console.error('Error getting recommendations:', error);
            return [];
        }
    }

    // Handle wishlist functionality
    async toggleWishlist(productId) {
        try {
            let wishlist = JSON.parse(localStorage.getItem('spencers_wishlist') || '[]');
            
            if (wishlist.includes(productId)) {
                wishlist = wishlist.filter(id => id !== productId);
                this.showNotification('Removed from wishlist', 'info');
            } else {
                wishlist.push(productId);
                this.showNotification('Added to wishlist! 💜', 'success');
            }
            
            localStorage.setItem('spencers_wishlist', JSON.stringify(wishlist));
            this.updateWishlistUI();

            // Future API integration:
            /*
            await fetch(`${this.apiBaseUrl}/wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    productId: productId,
                    action: wishlist.includes(productId) ? 'add' : 'remove'
                })
            });
            */

        } catch (error) {
            console.error('Wishlist error:', error);
            this.showNotification('Failed to update wishlist', 'error');
        }
    }

    // Update wishlist UI
    updateWishlistUI() {
        const wishlist = JSON.parse(localStorage.getItem('spencers_wishlist') || '[]');
        
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = btn.dataset.productId;
            if (wishlist.includes(productId)) {
                btn.classList.add('active');
                btn.innerHTML = '💜';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '🤍';
            }
        });
    }

    // Share product
    async shareProduct(product) {
        const shareData = {
            title: `${product.name} - Spencer's Halloween Store`,
            text: `Check out this ${product.category} from Spencer's!`,
            url: `${window.location.origin}?product=${product.id}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(shareData.url);
                this.showNotification('Product link copied to clipboard! 📋', 'success');
            }
        } catch (error) {
            console.error('Share failed:', error);
            this.showNotification('Failed to share product', 'error');
        }
    }

    // Analytics tracking
    trackEvent(eventName, data = {}) {
        // Future analytics integration
        const eventData = {
            event: eventName,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...data
        };

        // Send to analytics service
        /*
        fetch(`${this.apiBaseUrl}/analytics/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        }).catch(error => {
            console.warn('Analytics tracking failed:', error);
        });
        */

        console.log('Event tracked:', eventData);
    }

    // Get session ID
    getSessionId() {
        let sessionId = sessionStorage.getItem('spencers_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('spencers_session_id', sessionId);
        }
        return sessionId;
    }

    // Error boundary for handling JS errors
    handleError(error, errorInfo = {}) {
        console.error('Application error:', error);
        
        // Log error for debugging
        const errorData = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...errorInfo
        };

        // Future error logging service
        /*
        fetch(`${this.apiBaseUrl}/errors/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorData)
        }).catch(err => {
            console.warn('Error logging failed:', err);
        });
        */

        // Show user-friendly error message
        this.showNotification('Something spooky happened! Please refresh the page.', 'error');
    }

    // Bind all event listeners
    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
        }

        // CTA buttons
        document.getElementById('shopNowBtn')?.addEventListener('click', () => {
            this.handleQuickAction('shop-now');
            this.trackEvent('cta_click', { button: 'shop_now' });
        });

        document.getElementById('exploreBtn')?.addEventListener('click', () => {
            this.handleQuickAction('explore-3d');
            this.trackEvent('cta_click', { button: 'explore_3d' });
        });

        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.filterByCategory(category);
                this.trackEvent('category_click', { category });
            });
        });

        // Product interactions
        document.addEventListener('click', (event) => {
            const target = event.target;

            // Quick view
            if (target.classList.contains('quick-view-btn')) {
                const productData = JSON.parse(target.dataset.product);
                this.showQuickView(productData);
                this.trackEvent('quick_view', { productId: productData.id });
            }

            // Wishlist toggle
            if (target.classList.contains('wishlist-btn')) {
                const productId = target.dataset.productId;
                this.toggleWishlist(productId);
                this.trackEvent('wishlist_toggle', { productId });
            }

            // Share product
            if (target.classList.contains('share-btn')) {
                const productData = JSON.parse(target.dataset.product);
                this.shareProduct(productData);
                this.trackEvent('product_share', { productId: productData.id });
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            // Ctrl+K to focus search
            if (event.ctrlKey && event.key === 'k') {
                event.preventDefault();
                document.getElementById('searchInput')?.focus();
            }
            
            // Escape to clear search
            if (event.key === 'Escape' && document.getElementById('searchInput')?.value) {
                this.clearSearch();
            }
        });

        // Handle window errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, { 
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, { type: 'unhandled_promise_rejection' });
        });

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.trackEvent('page_visible');
            } else {
                this.trackEvent('page_hidden');
            }
        });

        // Before page unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_unload');
        });
    }

    // Show quick view modal
    showQuickView(product) {
        // This would integrate with the 3D viewer
        if (window.threeSceneManager) {
            window.threeSceneManager.openProductViewer(product);
        }
    }

    // Performance monitoring
    measurePerformance() {
        if ('performance' in window) {
            const perfData = {
                loadTime: performance.now(),
                navigation: performance.getEntriesByType('navigation')[0],
                resources: performance.getEntriesByType('resource').length
            };

            this.trackEvent('performance_metrics', perfData);
        }
    }
}

// Add loading screen HTML if it doesn't exist
const addLoadingScreen = () => {
    if (!document.getElementById('loadingScreen')) {
        const loadingHTML = `
            <div id="loadingScreen" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a0d2e, #2d1b3d);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
            ">
                <div class="loading-icon" style="
                    font-size: 4rem;
                    animation: bounce 1s infinite;
                    margin-bottom: 1rem;
                ">🎃</div>
                <div class="loading-text" style="
                    font-size: 1.5rem;
                    margin-bottom: 2rem;
                ">Loading Halloween Magic...</div>
                <div class="loading-bar" style="
                    width: 200px;
                    height: 4px;
                    background: rgba(255, 69, 0, 0.3);
                    border-radius: 2px;
                    overflow: hidden;
                ">
                    <div class="loading-progress" style="
                        height: 100%;
                        background: linear-gradient(45deg, #ff4500, #ff6b35);
                        animation: loading 2s infinite ease-in-out;
                    "></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', loadingHTML);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addLoadingScreen();
    
    // Initialize main app
    window.spencersApp = new SpencersApp();
    
    // Measure performance after load
    window.addEventListener('load', () => {
        window.spencersApp.measurePerformance();
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpencersApp;
}