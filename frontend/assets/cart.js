// Shopping Cart Management for Spencer's Halloween Store

class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.isOpen = false;
        this.apiEndpoint = '/api/cart'; // Will be connected to your MuleSoft API
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCartDisplay();
        this.updateCartCount();
    }

    // Load cart from local storage (will be replaced with API calls)
    loadCart() {
        try {
            const saved = localStorage.getItem('spencers_halloween_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('Error loading cart:', error);
            return [];
        }
    }

    // Save cart to local storage (will be replaced with API calls)
    saveCart() {
        try {
            localStorage.setItem('spencers_halloween_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.warn('Error saving cart:', error);
        }
    }

    // Add item to cart
    async addToCart(product, quantity = 1) {
        try {
            // Client-side logic
            const existingItem = this.cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    quantity: quantity,
                    addedAt: new Date().toISOString()
                });
            }

            // Save locally for now (will be API call)
            this.saveCart();
            
            // Future API call structure:
            /*
            const response = await fetch(`${this.apiEndpoint}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: quantity,
                    sessionId: this.getSessionId()
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }
            
            const result = await response.json();
            this.cart = result.cart;
            */

            this.updateCartDisplay();
            this.updateCartCount();
            this.showAddToCartAnimation(product);
            this.showNotification(`${product.name} added to cart!`, 'success');
            
            return { success: true, cart: this.cart };
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Failed to add item to cart', 'error');
            return { success: false, error: error.message };
        }
    }

    // Remove item from cart
    async removeFromCart(productId) {
        try {
            const itemIndex = this.cart.findIndex(item => item.id === productId);
            
            if (itemIndex === -1) {
                throw new Error('Item not found in cart');
            }

            const removedItem = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            
            // Save locally for now (will be API call)
            this.saveCart();
            
            // Future API call structure:
            /*
            const response = await fetch(`${this.apiEndpoint}/remove`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    productId: productId,
                    sessionId: this.getSessionId()
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }
            */

            this.updateCartDisplay();
            this.updateCartCount();
            this.showNotification(`${removedItem.name} removed from cart`, 'info');
            
            return { success: true, cart: this.cart };
        } catch (error) {
            console.error('Error removing from cart:', error);
            this.showNotification('Failed to remove item from cart', 'error');
            return { success: false, error: error.message };
        }
    }

    // Update item quantity
    async updateQuantity(productId, newQuantity) {
        try {
            if (newQuantity <= 0) {
                return this.removeFromCart(productId);
            }

            const item = this.cart.find(item => item.id === productId);
            
            if (!item) {
                throw new Error('Item not found in cart');
            }

            item.quantity = newQuantity;
            
            // Save locally for now (will be API call)
            this.saveCart();
            
            // Future API call structure:
            /*
            const response = await fetch(`${this.apiEndpoint}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: newQuantity,
                    sessionId: this.getSessionId()
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update cart item');
            }
            */

            this.updateCartDisplay();
            this.updateCartCount();
            
            return { success: true, cart: this.cart };
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            this.showNotification('Failed to update item quantity', 'error');
            return { success: false, error: error.message };
        }
    }

    // Clear entire cart
    async clearCart() {
        try {
            this.cart = [];
            
            // Save locally for now (will be API call)
            this.saveCart();
            
            // Future API call structure:
            /*
            const response = await fetch(`${this.apiEndpoint}/clear`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to clear cart');
            }
            */

            this.updateCartDisplay();
            this.updateCartCount();
            this.showNotification('Cart cleared', 'info');
            
            return { success: true };
        } catch (error) {
            console.error('Error clearing cart:', error);
            this.showNotification('Failed to clear cart', 'error');
            return { success: false, error: error.message };
        }
    }

    // Get cart totals
    getCartTotals() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax rate
        const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
        const total = subtotal + tax + shipping;

        return {
            subtotal: Math.round(subtotal * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            shipping: Math.round(shipping * 100) / 100,
            total: Math.round(total * 100) / 100,
            itemCount: this.cart.reduce((count, item) => count + item.quantity, 0)
        };
    }

    // Update cart display in sidebar
    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems || !cartTotal) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">👻</div>
                    <p>Your cart is empty</p>
                    <p>Add some spooky items to get started!</p>
                </div>
            `;
            cartTotal.textContent = '0.00';
            return;
        }

        // Render cart items
        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    ${this.getItemEmoji(item.category)}
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">−</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}">🗑️</button>
            </div>
        `).join('');

        // Update total
        const totals = this.getCartTotals();
        cartTotal.textContent = totals.total.toFixed(2);
    }

    // Update cart count badge
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totals = this.getCartTotals();
            cartCount.textContent = totals.itemCount;
            cartCount.style.display = totals.itemCount > 0 ? 'flex' : 'none';
        }
    }

    // Get appropriate emoji for item category
    getItemEmoji(category) {
        const emojis = {
            'costume': '👗',
            'decoration': '🎃',
            'accessory': '🎭',
            'makeup': '💄',
            'default': '🛍️'
        };
        return emojis[category] || emojis.default;
    }

    // Show/hide cart sidebar
    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            this.isOpen = !this.isOpen;
            cartSidebar.classList.toggle('active', this.isOpen);
            
            // Prevent body scroll when cart is open
            document.body.style.overflow = this.isOpen ? 'hidden' : 'auto';
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            this.isOpen = false;
            cartSidebar.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    // Add to cart animation
    showAddToCartAnimation(product) {
        // Create flying animation from product to cart
        const cartIcon = document.getElementById('cartIcon');
        if (!cartIcon) return;

        const flyingItem = document.createElement('div');
        flyingItem.innerHTML = this.getItemEmoji(product.category);
        flyingItem.style.cssText = `
            position: fixed;
            font-size: 2rem;
            pointer-events: none;
            z-index: 9999;
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;

        // Position at center of screen (where product would be)
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;
        flyingItem.style.left = startX + 'px';
        flyingItem.style.top = startY + 'px';

        document.body.appendChild(flyingItem);

        // Animate to cart
        const cartRect = cartIcon.getBoundingClientRect();
        setTimeout(() => {
            flyingItem.style.left = cartRect.left + 'px';
            flyingItem.style.top = cartRect.top + 'px';
            flyingItem.style.transform = 'scale(0.5)';
            flyingItem.style.opacity = '0';
        }, 50);

        // Remove element after animation
        setTimeout(() => {
            document.body.removeChild(flyingItem);
            // Add bounce effect to cart
            cartIcon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1)';
            }, 200);
        }, 850);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Proceed to checkout
    async proceedToCheckout() {
        try {
            if (this.cart.length === 0) {
                this.showNotification('Your cart is empty!', 'error');
                return;
            }

            // Prepare checkout data
            const checkoutData = {
                items: this.cart,
                totals: this.getCartTotals(),
                sessionId: this.getSessionId(),
                timestamp: new Date().toISOString()
            };

            // Future API call to initiate checkout:
            /*
            const response = await fetch(`${this.apiEndpoint}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(checkoutData)
            });

            if (!response.ok) {
                throw new Error('Failed to initiate checkout');
            }

            const result = await response.json();
            
            // Redirect to checkout page or payment processor
            window.location.href = result.checkoutUrl;
            */

            // For now, show demo checkout modal
            this.showCheckoutModal(checkoutData);

        } catch (error) {
            console.error('Checkout error:', error);
            this.showNotification('Failed to proceed to checkout', 'error');
        }
    }

    // Demo checkout modal (will be replaced with real checkout flow)
    showCheckoutModal(checkoutData) {
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.innerHTML = `
            <div class="checkout-content">
                <div class="checkout-header">
                    <h2>🎃 Checkout Demo</h2>
                    <button class="close-checkout" onclick="this.closest('.checkout-modal').remove()">×</button>
                </div>
                <div class="checkout-body">
                    <div class="checkout-summary">
                        <h3>Order Summary</h3>
                        ${checkoutData.items.map(item => `
                            <div class="checkout-item">
                                <span>${item.name} × ${item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        <div class="checkout-totals">
                            <div class="checkout-total-line">
                                <span>Subtotal:</span>
                                <span>${checkoutData.totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div class="checkout-total-line">
                                <span>Tax:</span>
                                <span>${checkoutData.totals.tax.toFixed(2)}</span>
                            </div>
                            <div class="checkout-total-line">
                                <span>Shipping:</span>
                                <span>${checkoutData.totals.shipping.toFixed(2)}</span>
                            </div>
                            <div class="checkout-total-line total">
                                <span>Total:</span>
                                <span>${checkoutData.totals.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="checkout-form">
                        <p>This is a demo checkout. In the real implementation, this would integrate with:</p>
                        <ul>
                            <li>MuleSoft Payment API</li>
                            <li>Java Spring Boot Order Service</li>
                            <li>Payment processors (Stripe, PayPal, etc.)</li>
                            <li>Inventory management system</li>
                        </ul>
                        <button class="demo-complete-btn" onclick="window.cartManager.completeDemo()">
                            Complete Demo Order
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        document.body.appendChild(modal);
    }

    // Complete demo order
    completeDemo() {
        this.clearCart();
        document.querySelector('.checkout-modal')?.remove();
        this.closeCart();
        this.showNotification('Demo order completed! 🎃', 'success');
    }

    // Bind event listeners
    bindEvents() {
        // Cart icon click
        document.getElementById('cartIcon')?.addEventListener('click', () => {
            this.toggleCart();
        });

        // Close cart button
        document.getElementById('closeCart')?.addEventListener('click', () => {
            this.closeCart();
        });

        // Checkout button
        document.getElementById('checkoutBtn')?.addEventListener('click', () => {
            this.proceedToCheckout();
        });

        // Event delegation for cart items
        document.addEventListener('click', (event) => {
            const target = event.target;
            const productId = target.dataset.id;

            if (target.classList.contains('increase')) {
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            } else if (target.classList.contains('decrease')) {
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            } else if (target.classList.contains('remove-item')) {
                this.removeFromCart(productId);
            } else if (target.classList.contains('add-to-cart')) {
                // Handle add to cart from product cards
                const productCard = target.closest('.product-card');
                if (productCard) {
                    const productData = this.extractProductData(productCard);
                    this.addToCart(productData);
                }
            }
        });

        // Close cart when clicking outside
        document.addEventListener('click', (event) => {
            const cartSidebar = document.getElementById('cartSidebar');
            const cartIcon = document.getElementById('cartIcon');
            
            if (this.isOpen && cartSidebar && 
                !cartSidebar.contains(event.target) && 
                !cartIcon.contains(event.target)) {
                this.closeCart();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });
    }

    // Extract product data from DOM element
    extractProductData(productElement) {
        return {
            id: productElement.dataset.productId || `product_${Date.now()}`,
            name: productElement.querySelector('.product-name')?.textContent || 'Unknown Product',
            price: parseFloat(productElement.querySelector('.product-price')?.textContent.replace(', '') || '0'),
            image: productElement.querySelector('.product-image img')?.src || '',
            category: productElement.dataset.category || 'default'
        };
    }

    // Utility methods for future API integration
    getSessionId() {
        let sessionId = sessionStorage.getItem('spencers_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('spencers_session_id', sessionId);
        }
        return sessionId;
    }

    getAuthToken() {
        // Future implementation will get actual auth token
        return localStorage.getItem('spencers_auth_token') || null;
    }

    // Apply discount code
    async applyDiscount(discountCode) {
        try {
            // Future API call structure:
            /*
            const response = await fetch(`${this.apiEndpoint}/discount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    code: discountCode,
                    sessionId: this.getSessionId()
                })
            });

            if (!response.ok) {
                throw new Error('Invalid discount code');
            }

            const result = await response.json();
            this.discount = result.discount;
            */

            // Demo discount logic
            const validCodes = {
                'HALLOWEEN25': 0.25,
                'SPOOKY15': 0.15,
                'TRICK10': 0.10
            };

            if (validCodes[discountCode.toUpperCase()]) {
                this.discount = {
                    code: discountCode.toUpperCase(),
                    percentage: validCodes[discountCode.toUpperCase()]
                };
                this.showNotification(`Discount applied: ${discountCode}!`, 'success');
                this.updateCartDisplay();
                return { success: true, discount: this.discount };
            } else {
                throw new Error('Invalid discount code');
            }

        } catch (error) {
            this.showNotification(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    // Get recommended products based on cart contents
    async getRecommendations() {
        try {
            // Future API call to get personalized recommendations
            /*
            const response = await fetch(`${this.apiEndpoint}/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cartItems: this.cart.map(item => item.id),
                    sessionId: this.getSessionId()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get recommendations');
            }

            return await response.json();
            */

            // Demo recommendations
            const demoRecommendations = [
                { id: 'rec1', name: 'Vampire Fangs', price: 12.99, category: 'accessory' },
                { id: 'rec2', name: 'Fake Blood', price: 8.99, category: 'makeup' },
                { id: 'rec3', name: 'Spider Web', price: 15.99, category: 'decoration' }
            ];

            return { success: true, recommendations: demoRecommendations };

        } catch (error) {
            console.error('Error getting recommendations:', error);
            return { success: false, error: error.message };
        }
    }

    // Save cart for later
    async saveForLater() {
        try {
            // Future API call to save cart
            const savedCart = {
                items: this.cart,
                savedAt: new Date().toISOString(),
                sessionId: this.getSessionId()
            };

            localStorage.setItem('spencers_saved_cart', JSON.stringify(savedCart));
            this.showNotification('Cart saved for later!', 'success');
            
            return { success: true };
        } catch (error) {
            this.showNotification('Failed to save cart', 'error');
            return { success: false, error: error.message };
        }
    }

    // Load saved cart
    async loadSavedCart() {
        try {
            const savedCart = localStorage.getItem('spencers_saved_cart');
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                this.cart = parsed.items || [];
                this.saveCart();
                this.updateCartDisplay();
                this.updateCartCount();
                this.showNotification('Saved cart loaded!', 'success');
                return { success: true };
            } else {
                this.showNotification('No saved cart found', 'info');
                return { success: false, error: 'No saved cart found' };
            }
        } catch (error) {
            this.showNotification('Failed to load saved cart', 'error');
            return { success: false, error: error.message };
        }
    }
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}