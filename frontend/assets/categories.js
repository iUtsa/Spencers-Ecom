// Categories Page JavaScript
class CategoriesManager {
    constructor() {
        this.categories = [];
        this.filteredCategories = [];
        this.currentView = 'grid';
        this.currentSort = 'name';
        this.apiBaseUrl = 'http://localhost:8081/api/v1'; // MuleSoft API
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategories();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('category-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterCategories(e.target.value);
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sort-categories');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.sortCategories();
                this.renderCategories();
            });
        }

        // Trend items click handlers
        document.querySelectorAll('.trend-item').forEach(item => {
            item.addEventListener('click', () => {
                const trendText = item.querySelector('h3').textContent;
                this.searchByTrend(trendText);
            });
        });
    }

    async loadCategories() {
        this.showLoading(true);
        
        try {
            // Try to load from MuleSoft API
            const response = await this.makeApiCall('/categories');
            this.categories = response;
        } catch (error) {
            console.error('Error loading categories from API:', error);
            // Fallback to mock data
            this.loadMockCategories();
        }

        this.filteredCategories = [...this.categories];
        this.sortCategories();
        this.renderCategories();
        this.showLoading(false);
    }

    loadMockCategories() {
        this.categories = [
            {
                id: 1,
                name: 'Adult Costumes',
                description: 'Premium quality costumes for adults in all sizes',
                image: 'https://images.unsplash.com/photo-1607618649583-09bd5e6b6096?w=400',
                itemCount: 120,
                rating: 4.5,
                tags: ['Accessories', 'Complete Look'],
                trending: true
            },
            {
                id: 10,
                name: 'Decorations',
                description: 'Transform your space into a haunted paradise',
                image: 'https://images.unsplash.com/photo-1572478200520-6d5b14d6ac11?w=400',
                itemCount: 89,
                rating: 4.6,
                tags: ['Home Decor', 'Party'],
                trending: true
            },
            {
                id: 11,
                name: 'Couples Costumes',
                description: 'Perfect matching costumes for partners',
                image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
                itemCount: 34,
                rating: 4.8,
                tags: ['Couples', 'Romantic'],
                trending: false
            },
            {
                id: 12,
                name: 'Group Costumes',
                description: 'Coordinate with friends and family',
                image: 'https://images.unsplash.com/photo-1578072460825-3c36e2e93ec2?w=400',
                itemCount: 28,
                rating: 4.7,
                tags: ['Group', 'Party'],
                trending: false
            }
        ];
    }

    filterCategories(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            this.filteredCategories = [...this.categories];
        } else {
            this.filteredCategories = this.categories.filter(category => 
                category.name.toLowerCase().includes(term) ||
                category.description.toLowerCase().includes(term) ||
                category.tags.some(tag => tag.toLowerCase().includes(term))
            );
        }
        
        this.sortCategories();
        this.renderCategories();
    }

    sortCategories() {
        switch (this.currentSort) {
            case 'name':
                this.filteredCategories.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'popularity':
                this.filteredCategories.sort((a, b) => b.rating - a.rating);
                break;
            case 'items':
                this.filteredCategories.sort((a, b) => b.itemCount - a.itemCount);
                break;
        }
    }

    renderCategories() {
        const grid = document.getElementById('categories-grid');
        if (!grid) return;

        if (this.filteredCategories.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;"></i>
                    <h3>No categories found</h3>
                    <p>Try adjusting your search terms or browse our featured collections below.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        
        this.filteredCategories.forEach(category => {
            const categoryCard = this.createCategoryCard(category);
            grid.appendChild(categoryCard);
        });

        // Add click handlers to category cards
        this.addCategoryClickHandlers();
    }

    createCategoryCard(category) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.dataset.categoryId = category.id;
        
        const trendingBadge = category.trending ? '<span class="trend-badge">Trending</span>' : '';
        
        card.innerHTML = `
            <div class="category-image">
                <img src="${category.image}" alt="${category.name}" loading="lazy">
                <div class="category-overlay">
                    <div class="overlay-text">
                        <i class="fas fa-arrow-right"></i>
                        Browse ${category.name}
                    </div>
                </div>
                ${trendingBadge}
            </div>
            <div class="category-info">
                ${this.currentView === 'list' ? '<div class="category-details">' : ''}
                <h3 class="category-title">${category.name}</h3>
                <p class="category-description">${category.description}</p>
                <div class="category-meta">
                    <span class="item-count">${category.itemCount} items</span>
                    <div class="category-rating">
                        ${this.generateStarRating(category.rating)}
                        <span>(${category.rating})</span>
                    </div>
                </div>
                <div class="category-tags">
                    ${category.tags.map(tag => `<span class="category-tag">${tag}</span>`).join('')}
                </div>
                ${this.currentView === 'list' ? '</div>' : ''}
            </div>
        `;
        
        return card;
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return stars;
    }

    addCategoryClickHandlers() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const categoryId = card.dataset.categoryId;
                const category = this.categories.find(c => c.id == categoryId);
                this.navigateToCategory(category);
            });
        });
    }

    navigateToCategory(category) {
        // Navigate to products page with category filter
        const categorySlug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        window.location.href = `products.html?category=${categorySlug}&id=${category.id}`;
    }

    searchByTrend(trendText) {
        const searchInput = document.getElementById('category-search');
        if (searchInput) {
            searchInput.value = trendText;
            this.filterCategories(trendText);
        }
    }

    async makeApiCall(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }

        return response.json();
    }

    showLoading(show) {
        const placeholder = document.getElementById('loading-placeholder');
        const grid = document.getElementById('categories-grid');
        
        if (placeholder && grid) {
            placeholder.style.display = show ? 'block' : 'none';
            grid.style.opacity = show ? '0.5' : '1';
        }
    }
}

// Global functions for HTML event handlers
function toggleView(viewType) {
    const grid = document.getElementById('categories-grid');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    // Update active button
    viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewType);
    });
    
    // Update grid class
    if (viewType === 'list') {
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
    }
    
    // Update manager state and re-render
    if (window.categoriesManager) {
        window.categoriesManager.currentView = viewType;
        window.categoriesManager.renderCategories();
    }
}

function subscribeNewsletter() {
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput ? emailInput.value : '';
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Simulate newsletter subscription
    showSubscriptionSuccess();
    
    // Here you would typically make an API call to subscribe
    // categoriesManager.makeApiCall('/newsletter/subscribe', {
    //     method: 'POST',
    //     body: JSON.stringify({ email: email })
    // });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showSubscriptionSuccess() {
    const emailInput = document.getElementById('newsletter-email');
    const button = emailInput.nextElementSibling;
    
    const originalButtonText = button.textContent;
    const originalInputValue = emailInput.value;
    
    button.textContent = 'Subscribed!';
    button.style.backgroundColor = '#28a745';
    emailInput.value = 'Thank you for subscribing!';
    emailInput.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalButtonText;
        button.style.backgroundColor = '';
        emailInput.value = '';
        emailInput.disabled = false;
    }, 3000);
}

// Animation utilities
function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe category cards for scroll animations
    document.querySelectorAll('.category-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
    
    // Observe trend items
    document.querySelectorAll('.trend-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });
}

// Search suggestions functionality
function initSearchSuggestions() {
    const searchInput = document.getElementById('category-search');
    if (!searchInput) return;
    
    const suggestions = [
        'Adult Costumes', 'Kids Costumes', 'Horror', 'Fantasy', 'Superheroes',
        'Pirates', 'Animals', 'Historical', 'Accessories', 'Decorations'
    ];
    
    const suggestionsList = document.createElement('div');
    suggestionsList.className = 'search-suggestions';
    suggestionsList.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
    `;
    
    searchInput.parentNode.appendChild(suggestionsList);
    
    searchInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        
        if (value.length < 2) {
            suggestionsList.style.display = 'none';
            return;
        }
        
        const filteredSuggestions = suggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(value)
        );
        
        if (filteredSuggestions.length === 0) {
            suggestionsList.style.display = 'none';
            return;
        }
        
        suggestionsList.innerHTML = filteredSuggestions
            .map(suggestion => `
                <div class="suggestion-item" style="padding: 0.75rem; cursor: pointer; transition: background-color 0.2s ease;">
                    ${suggestion}
                </div>
            `).join('');
        
        suggestionsList.style.display = 'block';
        
        // Add click handlers to suggestions
        suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8f9fa';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
            });
            
            item.addEventListener('click', () => {
                searchInput.value = item.textContent.trim();
                suggestionsList.style.display = 'none';
                window.categoriesManager.filterCategories(searchInput.value);
            });
        });
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.style.display = 'none';
        }
    });
}

// Update cart count on page load
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.categoriesManager = new CategoriesManager();
    updateCartCount();
    
    // Initialize additional features after a short delay
    setTimeout(() => {
        animateOnScroll();
        initSearchSuggestions();
    }, 500);
});

// Handle window resize for responsive features
window.addEventListener('resize', () => {
    // Adjust view for mobile
    if (window.innerWidth < 768) {
        const grid = document.getElementById('categories-grid');
        if (grid && grid.classList.contains('list-view')) {
            toggleView('grid');
        }
    }
});

// Keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Hide search suggestions
        const suggestions = document.querySelector('.search-suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }
    
    if (e.key === 'Enter' && e.target.id === 'newsletter-email') {
        subscribeNewsletter();
    }
});