// Product Detail JavaScript
class ProductDetailManager {
    constructor() {
        this.currentProduct = null;
        this.selectedSize = null;
        this.selectedColor = null;
        this.currentImageIndex = 0;
        this.apiBaseUrl = 'http://localhost:8081/api/v1'; // MuleSoft API
        this.init();
    }

    init() {
        this.loadProductFromUrl();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Image zoom functionality
        const mainImage = document.getElementById('main-product-image');
        const zoomOverlay = document.getElementById('zoom-overlay');
        
        if (mainImage && zoomOverlay) {
            mainImage.addEventListener('mouseenter', () => {
                zoomOverlay.style.display = 'flex';
            });
            
            mainImage.addEventListener('mouseleave', () => {
                zoomOverlay.style.display = 'none';
            });
        }

        // Quantity input validation
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            quantityInput.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                if (value < 1) e.target.value = 1;
                if (value > 10) e.target.value = 10;
            });
        }
    }

    async loadProductFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            console.error('No product ID found in URL');
            this.showError('Product not found');
            return;
        }

        this.showLoading(true);
        
        try {
            await this.loadProduct(productId);
            await this.loadRelatedProducts();
        } catch (error) {
            console.error('Error loading product:', error);
            this.showError('Failed to load product details');
        } finally {
            this.showLoading(false);
        }
    }

    async loadProduct(productId) {
        try {
            // Simulate API call - replace with actual MuleSoft API integration
            const response = await this.makeApiCall(`/products/${productId}`);
            this.currentProduct = response;
            this.renderProduct();
            await this.loadProductReviews(productId);
        } catch (error) {
            console.error('Error loading product:', error);
            // Fallback to mock data
            this.loadMockProduct(productId);
        }
    }

    loadMockProduct(productId) {
        // Mock product data for development
        const mockProducts = {
            '1': {
                id: 1,
                name: 'Deluxe Vampire Costume',
                category: 'Costumes',
                price: 89.99,
                originalPrice: 119.99,
                discount: 25,
                rating: 4.5,
                reviewCount: 127,
                description: 'Transform into a classic vampire with this deluxe costume featuring a dramatic cape, elegant vest, and authentic accessories.',
                detailedDescription: `
                    <h3>Product Features:</h3>
                    <ul>
                        <li>High-quality polyester fabric with satin lining</li>
                        <li>Dramatic floor-length cape with red interior</li>
                        <li>Elegant black vest with silver buttons</li>
                        <li>White dress shirt with ruffled front</li>
                        <li>Black bow tie included</li>
                        <li>Vampire fangs and medallion accessories</li>
                    </ul>
                    <h3>Care Instructions:</h3>
                    <p>Hand wash cold, hang dry. Do not bleach or iron.</p>
                `,
                images: [
                    'https://images.unsplash.com/photo-1509557965350-b0c0d8c56b2f?w=500',
                    'https://images.unsplash.com/photo-1544473244-47f9d28a8e2f?w=500',
                    'https://images.unsplash.com/photo-1576073734374-b6b6b73b8d36?w=500'
                ],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colors: ['Black', 'Burgundy'],
                inStock: true,
                stockQuantity: 15
            }
        };

        this.currentProduct = mockProducts[productId] || mockProducts['1'];
        this.renderProduct();
        this.loadMockReviews();
    }

    renderProduct() {
        const product = this.currentProduct;
        if (!product) return;

        // Update page title and breadcrumb
        document.title = `${product.name} - Spencer's Halloween Store`;
        document.getElementById('breadcrumb-category').textContent = product.category;
        document.getElementById('breadcrumb-product').textContent = product.name;

        // Update product info
        document.getElementById('product-title').textContent = product.name;
        document.getElementById('current-price').textContent = `${product.price.toFixed(2)}`;
        
        if (product.originalPrice && product.originalPrice > product.price) {
            document.getElementById('original-price').textContent = `${product.originalPrice.toFixed(2)}`;
            document.getElementById('discount-badge').textContent = `-${product.discount}%`;
        } else {
            document.getElementById('original-price').style.display = 'none';
            document.getElementById('discount-badge').style.display = 'none';
        }

        document.getElementById('product-description').innerHTML = `<p>${product.description}</p>`;
        document.getElementById('detailed-description').innerHTML = product.detailedDescription;
        document.getElementById('rating-count').textContent = `(${product.reviewCount} reviews)`;

        // Update rating stars
        this.updateRatingStars(product.rating);

        // Setup product images
        this.setupProductImages(product.images);

        // Setup product options
        this.setupProductOptions(product);

        // Update stock status
        this.updateStockStatus(product);
    }

    updateRatingStars(rating) {
        const starsContainer = document.getElementById('product-stars');
        if (!starsContainer) return;

        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        starsContainer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('i');
            if (i < fullStars) {
                star.className = 'fas fa-star';
            } else if (i === fullStars && hasHalfStar) {
                star.className = 'fas fa-star-half-alt';
            } else {
                star.className = 'far fa-star';
            }
            starsContainer.appendChild(star);
        }
    }

    setupProductImages(images) {
        if (!images || images.length === 0) return;

        const mainImage = document.getElementById('main-product-image');
        const thumbnailGallery = document.getElementById('thumbnail-gallery');

        // Set main image
        mainImage.src = images[0];
        mainImage.alt = this.currentProduct.name;

        // Create thumbnails
        thumbnailGallery.innerHTML = '';
        images.forEach((imageUrl, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.innerHTML = `<img src="${imageUrl}" alt="Product image ${index + 1}">`;
            thumbnail.addEventListener('click', () => this.changeMainImage(index));
            thumbnailGallery.appendChild(thumbnail);
        });
    }

    changeMainImage(index) {
        const mainImage = document.getElementById('main-product-image');
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        mainImage.src = this.currentProduct.images[index];
        this.currentImageIndex = index;
        
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    setupProductOptions(product) {
        // Setup size options
        if (product.sizes && product.sizes.length > 0) {
            const sizeSelector = document.querySelector('.size-selector');
            const sizeOptions = document.getElementById('size-options');
            
            sizeSelector.style.display = 'block';
            sizeOptions.innerHTML = '';
            
            product.sizes.forEach(size => {
                const sizeOption = document.createElement('div');
                sizeOption.className = 'size-option';
                sizeOption.textContent = size;
                sizeOption.addEventListener('click', () => this.selectSize(size));
                sizeOptions.appendChild(sizeOption);
            });
        }

        // Setup color options
        if (product.colors && product.colors.length > 0) {
            const colorSelector = document.querySelector('.color-selector');
            const colorOptions = document.getElementById('color-options');
            
            colorSelector.style.display = 'block';
            colorOptions.innerHTML = '';
            
            product.colors.forEach(color => {
                const colorOption = document.createElement('div');
                colorOption.className = 'color-option';
                colorOption.style.backgroundColor = this.getColorCode(color);
                colorOption.title = color;
                colorOption.addEventListener('click', () => this.selectColor(color));
                colorOptions.appendChild(colorOption);
            });
        }
    }

    getColorCode(colorName) {
        const colorCodes = {
            'Black': '#000000',
            'White': '#FFFFFF',
            'Red': '#FF0000',
            'Blue': '#0000FF',
            'Green': '#00FF00',
            'Burgundy': '#800020',
            'Purple': '#800080',
            'Orange': '#FFA500',
            'Yellow': '#FFFF00',
            'Pink': '#FFC0CB'
        };
        return colorCodes[colorName] || '#CCCCCC';
    }

    selectSize(size) {
        this.selectedSize = size;
        document.querySelectorAll('.size-option').forEach(option => {
            option.classList.toggle('selected', option.textContent === size);
        });
    }

    selectColor(color) {
        this.selectedColor = color;
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('selected', option.title === color);
        });
    }

    updateStockStatus(product) {
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        
        if (!product.inStock || product.stockQuantity === 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-times"></i> Out of Stock';
            addToCartBtn.style.backgroundColor = '#6c757d';
        } else if (product.stockQuantity < 5) {
            // Show low stock warning
            const stockWarning = document.createElement('div');
            stockWarning.className = 'stock-warning';
            stockWarning.innerHTML = `⚠️ Only ${product.stockQuantity} left in stock!`;
            stockWarning.style.color = '#dc3545';
            stockWarning.style.fontSize = '0.9rem';
            stockWarning.style.marginTop = '0.5rem';
            addToCartBtn.parentNode.appendChild(stockWarning);
        }
    }

    async loadProductReviews(productId) {
        try {
            const reviews = await this.makeApiCall(`/products/${productId}/reviews`);
            this.renderReviews(reviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
            this.loadMockReviews();
        }
    }

    loadMockReviews() {
        const mockReviews = [
            {
                id: 1,
                userName: 'Sarah M.',
                rating: 5,
                date: '2024-10-15',
                comment: 'Amazing costume! The quality is excellent and it fits perfectly. Got so many compliments at the Halloween party!'
            },
            {
                id: 2,
                userName: 'Mike R.',
                rating: 4,
                date: '2024-10-12',
                comment: 'Great vampire costume. The cape is dramatic and the accessories are nice quality. Only wish it came in more sizes.'
            },
            {
                id: 3,
                userName: 'Jennifer K.',
                rating: 5,
                date: '2024-10-08',
                comment: 'Perfect for Halloween! My husband loved this costume. Very authentic looking and comfortable to wear all night.'
            }
        ];
        
        this.renderReviews(mockReviews);
        this.renderRatingBreakdown();
    }

    renderReviews(reviews) {
        const reviewsList = document.getElementById('reviews-list');
        if (!reviewsList) return;

        reviewsList.innerHTML = '';
        
        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review-item';
            reviewElement.innerHTML = `
                <div class="review-header">
                    <span class="reviewer-name">${review.userName}</span>
                    <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div class="review-rating">
                    ${this.generateStarRating(review.rating)}
                </div>
                <div class="review-text">${review.comment}</div>
            `;
            reviewsList.appendChild(reviewElement);
        });
    }

    generateStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        }
        return stars;
    }

    renderRatingBreakdown() {
        const ratingBreakdown = document.getElementById('rating-breakdown');
        if (!ratingBreakdown) return;

        const breakdown = [
            { stars: 5, count: 78, percentage: 61 },
            { stars: 4, count: 32, percentage: 25 },
            { stars: 3, count: 12, percentage: 9 },
            { stars: 2, count: 4, percentage: 3 },
            { stars: 1, count: 1, percentage: 1 }
        ];

        ratingBreakdown.innerHTML = '';
        breakdown.forEach(item => {
            const barElement = document.createElement('div');
            barElement.className = 'rating-bar';
            barElement.innerHTML = `
                <div class="rating-label">${item.stars} stars</div>
                <div class="rating-progress">
                    <div class="rating-fill" style="width: ${item.percentage}%"></div>
                </div>
                <div class="rating-count">${item.count}</div>
            `;
            ratingBreakdown.appendChild(barElement);
        });
    }

    async loadRelatedProducts() {
        try {
            const related = await this.makeApiCall(`/products/related/${this.currentProduct.id}`);
            this.renderRelatedProducts(related);
        } catch (error) {
            console.error('Error loading related products:', error);
            this.loadMockRelatedProducts();
        }
    }

    loadMockRelatedProducts() {
        const mockRelated = [
            {
                id: 2,
                name: 'Classic Witch Costume',
                price: 59.99,
                image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=300'
            },
            {
                id: 3,
                name: 'Zombie Pirate Costume',
                price: 74.99,
                image: 'https://images.unsplash.com/photo-1509557965350-b0c0d8c56b2f?w=300'
            },
            {
                id: 4,
                name: 'Gothic Victorian Dress',
                price: 99.99,
                image: 'https://images.unsplash.com/photo-1544473244-47f9d28a8e2f?w=300'
            },
            {
                id: 5,
                name: 'Skull Mask Set',
                price: 24.99,
                image: 'https://images.unsplash.com/photo-1576073734374-b6b6b73b8d36?w=300'
            }
        ];
        
        this.renderRelatedProducts(mockRelated);
    }

    renderRelatedProducts(products) {
        const grid = document.getElementById('related-products-grid');
        if (!grid) return;

        grid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'related-product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="related-product-image">
                <div class="related-product-info">
                    <h3 class="related-product-title">${product.name}</h3>
                    <div class="related-product-price">${product.price.toFixed(2)}</div>
                </div>
            `;
            productCard.addEventListener('click', () => {
                window.location.href = `product-detail.html?id=${product.id}`;
            });
            grid.appendChild(productCard);
        });
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
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = show ? 'flex' : 'none';
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 1000;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Global functions for HTML event handlers
function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    const newValue = Math.max(1, Math.min(10, currentValue + delta));
    quantityInput.value = newValue;
}

function addToCart() {
    if (!productDetailManager.currentProduct) return;

    const quantity = parseInt(document.getElementById('quantity').value);
    const size = productDetailManager.selectedSize;
    const color = productDetailManager.selectedColor;

    // Validate required selections
    if (productDetailManager.currentProduct.sizes && productDetailManager.currentProduct.sizes.length > 0 && !size) {
        alert('Please select a size');
        return;
    }

    if (productDetailManager.currentProduct.colors && productDetailManager.currentProduct.colors.length > 0 && !color) {
        alert('Please select a color');
        return;
    }

    const cartItem = {
        id: productDetailManager.currentProduct.id,
        name: productDetailManager.currentProduct.name,
        price: productDetailManager.currentProduct.price,
        quantity: quantity,
        size: size,
        color: color,
        image: productDetailManager.currentProduct.images[0]
    };

    // Add to cart (using cart functionality from main.js)
    if (typeof addToCartFunction === 'function') {
        addToCartFunction(cartItem);
    } else {
        // Fallback: store in localStorage
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => 
            item.id === cartItem.id && 
            item.size === cartItem.size && 
            item.color === cartItem.color
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // Show success message
    showAddToCartSuccess();
}

function showAddToCartSuccess() {
    const button = document.getElementById('add-to-cart-btn');
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
    button.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = '';
    }, 2000);
}

function toggleWishlist() {
    const wishlistBtn = document.getElementById('wishlist-btn');
    const isActive = wishlistBtn.classList.contains('active');
    
    wishlistBtn.classList.toggle('active');
    wishlistBtn.innerHTML = isActive ? '<i class="far fa-heart"></i>' : '<i class="fas fa-heart"></i>';
    
    // Add wishlist functionality here
    console.log('Wishlist toggled for product:', productDetailManager.currentProduct?.id);
}

function shareProduct() {
    if (navigator.share) {
        navigator.share({
            title: productDetailManager.currentProduct?.name,
            text: `Check out this ${productDetailManager.currentProduct?.name} at Spencer's Halloween Store!`,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Product link copied to clipboard!');
        });
    }
}

function showTab(tabName) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab pane
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function loadMoreReviews() {
    console.log('Loading more reviews...');
    // Implement pagination for reviews
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Initialize product detail manager when page loads
let productDetailManager;
document.addEventListener('DOMContentLoaded', () => {
    productDetailManager = new ProductDetailManager();
    updateCartCount();
});