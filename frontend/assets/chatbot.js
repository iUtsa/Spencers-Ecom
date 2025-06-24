// AI Halloween Assistant Chatbot for Spencer's Halloween Store

class HalloweenChatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.conversationHistory = [];
        this.apiEndpoint = '/api/chatbot'; // Will connect to your AI service
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadConversationHistory();
        this.initializeBot();
    }

    // Initialize bot with welcome message
    initializeBot() {
        const welcomeMessage = {
            id: 'welcome_' + Date.now(),
            type: 'bot',
            message: "Welcome to Spencer's Halloween Store! 🎃 I'm your spooky shopping assistant. I can help you find costumes, decorations, makeup, and accessories. What kind of Halloween magic are you looking for today?",
            timestamp: new Date().toISOString(),
            suggestions: [
                "Show me popular costumes",
                "Halloween decorations under $25",
                "Scary makeup tutorials",
                "Complete Halloween party setup"
            ]
        };
        
        this.addMessage(welcomeMessage);
    }

    // Load conversation history from storage
    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('spencers_chat_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                this.renderConversationHistory();
            }
        } catch (error) {
            console.warn('Error loading chat history:', error);
        }
    }

    // Save conversation history
    saveConversationHistory() {
        try {
            localStorage.setItem('spencers_chat_history', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.warn('Error saving chat history:', error);
        }
    }

    // Send user message
    async sendMessage(message) {
        if (!message.trim()) return;

        // Add user message
        const userMessage = {
            id: 'user_' + Date.now(),
            type: 'user',
            message: message.trim(),
            timestamp: new Date().toISOString()
        };

        this.addMessage(userMessage);
        this.showTypingIndicator();

        try {
            // Process message and get bot response
            const botResponse = await this.processMessage(message);
            this.hideTypingIndicator();
            this.addMessage(botResponse);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage({
                id: 'error_' + Date.now(),
                type: 'bot',
                message: "Sorry, I'm having trouble understanding right now. Could you try asking again? 👻",
                timestamp: new Date().toISOString()
            });
        }
    }

    // Process user message and generate response
    async processMessage(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Future AI integration point:
        /*
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                conversationHistory: this.conversationHistory.slice(-10), // Last 10 messages for context
                sessionId: this.getSessionId(),
                userIntent: this.detectIntent(message)
            })
        });

        if (!response.ok) {
            throw new Error('AI service unavailable');
        }

        return await response.json();
        */

        // Demo AI responses based on keywords and intents
        const intent = this.detectIntent(message);
        const response = await this.generateDemoResponse(intent, message);
        
        return response;
    }

    // Detect user intent from message
    detectIntent(message) {
        const intents = {
            product_search: ['show', 'find', 'looking for', 'need', 'want', 'search'],
            costume_help: ['costume', 'outfit', 'character', 'superhero', 'princess', 'villain'],
            decoration_help: ['decoration', 'decorate', 'setup', 'party', 'house', 'yard'],
            makeup_help: ['makeup', 'face paint', 'tutorial', 'how to', 'scary look'],
            price_inquiry: ['price', 'cost', 'cheap', 'expensive', 'budget', 'under', 'less than'],
            size_help: ['size', 'fit', 'measurement', 'small', 'medium', 'large'],
            shipping_inquiry: ['shipping', 'delivery', 'when will', 'arrive', 'fast'],
            return_policy: ['return', 'exchange', 'refund', 'policy'],
            greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
            thanks: ['thank', 'thanks', 'appreciate'],
            goodbye: ['bye', 'goodbye', 'see you', 'later']
        };

        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => message.includes(keyword))) {
                return intent;
            }
        }

        return 'general';
    }

    // Generate demo AI response based on intent
    async generateDemoResponse(intent, message) {
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

        const responses = {
            greeting: {
                message: "Hello! 🎃 Welcome to Spencer's Halloween Store! I'm here to help you find the perfect spooky items. What are you looking for today?",
                suggestions: ["Popular costumes", "Halloween decorations", "Scary makeup", "Party supplies"]
            },
            
            costume_help: {
                message: "Great choice! Our costume collection is absolutely wicked! 👻 We have everything from classic monsters to trending characters. What type of vibe are you going for?",
                suggestions: ["Scary & Horror", "Funny & Quirky", "Superhero & Fantasy", "Classic Halloween"],
                products: [
                    { name: "Vampire Deluxe Costume", price: 49.99, category: "costume" },
                    { name: "Witch Sorceress Outfit", price: 39.99, category: "costume" },
                    { name: "Zombie Apocalypse Kit", price: 59.99, category: "costume" }
                ]
            },
            
            decoration_help: {
                message: "Time to transform your space into a haunted nightmare! 🏚️ Our decorations range from subtle spooky to full horror house. What's your setup like?",
                suggestions: ["Indoor decorations", "Outdoor yard setup", "Party decorations", "Animatronics"],
                products: [
                    { name: "12ft Skeleton", price: 299.99, category: "decoration" },
                    { name: "Fog Machine Pro", price: 89.99, category: "decoration" },
                    { name: "Spider Web Kit", price: 15.99, category: "decoration" }
                ]
            },
            
            makeup_help: {
                message: "Our special FX makeup will make you look terrifyingly realistic! 💀 From zombie wounds to vampire bites, we've got you covered. Are you a beginner or experienced?",
                suggestions: ["Beginner kits", "Professional FX", "Face paint sets", "Tutorials"],
                products: [
                    { name: "Zombie Makeup Kit", price: 24.99, category: "makeup" },
                    { name: "Vampire Fang Set", price: 12.99, category: "makeup" },
                    { name: "Scar Wax & Blood", price: 18.99, category: "makeup" }
                ]
            },
            
            price_inquiry: {
                message: "I can definitely help you find items within your budget! 💰 We have options from $5 accessories to premium $300+ animatronics. What's your price range?",
                suggestions: ["Under $20", "$20-$50", "$50-$100", "Premium items"]
            },
            
            shipping_inquiry: {
                message: "We offer several shipping options! 📦 Standard shipping (5-7 days) is FREE on orders over $50. Express shipping (2-3 days) is $9.99, and overnight is $19.99. Need it super fast?",
                suggestions: ["Standard shipping", "Express shipping", "Store pickup", "Track my order"]
            },
            
            size_help: {
                message: "Getting the right fit is crucial for a great Halloween! 📏 Our size chart covers everything from XS to 5XL. Most costumes run true to size, but I can help you find specific measurements!",
                suggestions: ["View size chart", "Costume fit guide", "Kids sizes", "Plus sizes"]
            },
            
            return_policy: {
                message: "No worries - we want you to love your Halloween gear! 🔄 You have 30 days to return unused items with tags. Opened makeup/face paint can't be returned for health reasons, but damaged items are always replaceable!",
                suggestions: ["Start a return", "Exchange policy", "Damaged item help", "Contact support"]
            },
            
            thanks: {
                message: "You're absolutely welcome! 🧡 I'm always here to help make your Halloween absolutely spook-tacular! Is there anything else you'd like to explore?",
                suggestions: ["Browse more items", "Halloween tips", "Party planning help", "Checkout help"]
            },
            
            goodbye: {
                message: "Thanks for visiting Spencer's! Have a frightfully fun Halloween! 🎃👻 Feel free to come back anytime if you need more spooky assistance!",
                suggestions: []
            }
        };

        const defaultResponse = {
            message: "I'm here to help with all things Halloween! 🎭 Whether you need costumes, decorations, makeup, or accessories, I can point you in the right direction. What specifically are you looking for?",
            suggestions: ["Browse costumes", "See decorations", "Makeup & FX", "Halloween accessories"]
        };

        const response = responses[intent] || defaultResponse;
        
        return {
            id: 'bot_' + Date.now(),
            type: 'bot',
            message: response.message,
            timestamp: new Date().toISOString(),
            suggestions: response.suggestions || [],
            products: response.products || []
        };
    }

    // Add message to conversation
    addMessage(messageObj) {
        this.conversationHistory.push(messageObj);
        this.renderMessage(messageObj);
        this.saveConversationHistory();
        this.scrollToBottom();
    }

    // Render message in chat UI
    renderMessage(messageObj) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `${messageObj.type}-message`;
        messageElement.dataset.messageId = messageObj.id;

        if (messageObj.type === 'bot') {
            messageElement.innerHTML = `
                <span class="bot-avatar">🎃</span>
                <div class="message-content">
                    ${messageObj.message}
                    ${this.renderSuggestions(messageObj.suggestions)}
                    ${this.renderProducts(messageObj.products)}
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <span class="user-avatar">👤</span>
                <div class="message-content">${messageObj.message}</div>
            `;
        }

        messagesContainer.appendChild(messageElement);
    }

    // Render suggestion buttons
    renderSuggestions(suggestions = []) {
        if (!suggestions.length) return '';
        
        return `
            <div class="message-suggestions">
                ${suggestions.map(suggestion => `
                    <button class="suggestion-btn" onclick="window.halloweenChatbot.sendMessage('${suggestion}')">${suggestion}</button>
                `).join('')}
            </div>
        `;
    }

    // Render product recommendations
    renderProducts(products = []) {
        if (!products.length) return '';
        
        return `
            <div class="message-products">
                <div class="products-header">Recommended Items:</div>
                ${products.map(product => `
                    <div class="chat-product-card">
                        <div class="chat-product-info">
                            <div class="chat-product-name">${product.name}</div>
                            <div class="chat-product-price">$${product.price}</div>
                        </div>
                        <button class="chat-add-to-cart" onclick="window.cartManager.addToCart({
                            id: 'chat_${product.name.replace(/\s+/g, '_').toLowerCase()}',
                            name: '${product.name}',
                            price: ${product.price},
                            category: '${product.category}',
                            image: ''
                        })">Add to Cart</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Show typing indicator
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const typingElement = document.createElement('div');
        typingElement.className = 'bot-message typing-indicator';
        typingElement.innerHTML = `
            <span class="bot-avatar">🎃</span>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
        this.isTyping = true;
    }

    // Hide typing indicator
    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    // Render conversation history
    renderConversationHistory() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';
        this.conversationHistory.forEach(message => {
            this.renderMessage(message);
        });
    }

    // Scroll to bottom of chat
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    // Toggle chatbot visibility
    toggleChat() {
        const chatContainer = document.getElementById('chatbot');
        const toggleButton = document.getElementById('chatToggle');
        
        if (chatContainer && toggleButton) {
            this.isOpen = !this.isOpen;
            chatContainer.classList.toggle('active', this.isOpen);
            toggleButton.classList.toggle('active', this.isOpen);
            
            if (this.isOpen) {
                this.scrollToBottom();
                // Focus on input when opened
                setTimeout(() => {
                    document.getElementById('chatInput')?.focus();
                }, 300);
            }
        }
    }

    // Minimize chat
    minimizeChat() {
        this.isOpen = false;
        document.getElementById('chatbot')?.classList.remove('active');
        document.getElementById('chatToggle')?.classList.remove('active');
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
        this.saveConversationHistory();
        document.getElementById('chatMessages').innerHTML = '';
        this.initializeBot();
    }

    // Get session ID for API calls
    getSessionId() {
        let sessionId = sessionStorage.getItem('spencers_chat_session');
        if (!sessionId) {
            sessionId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('spencers_chat_session', sessionId);
        }
        return sessionId;
    }

    // Bind event listeners
    bindEvents() {
        // Toggle button
        document.getElementById('chatToggle')?.addEventListener('click', () => {
            this.toggleChat();
        });

        // Minimize button
        document.getElementById('minimizeChat')?.addEventListener('click', () => {
            this.minimizeChat();
        });

        // Send message button
        document.getElementById('sendMessage')?.addEventListener('click', () => {
            const input = document.getElementById('chatInput');
            if (input) {
                this.sendMessage(input.value);
                input.value = '';
            }
        });

        // Enter key to send message
        document.getElementById('chatInput')?.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage(event.target.value);
                event.target.value = '';
            }
        });

        // Click outside to close
        document.addEventListener('click', (event) => {
            const chatContainer = document.getElementById('chatbot');
            const toggleButton = document.getElementById('chatToggle');
            
            if (this.isOpen && chatContainer && toggleButton &&
                !chatContainer.contains(event.target) && 
                !toggleButton.contains(event.target)) {
                this.minimizeChat();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            // Escape to close chat
            if (event.key === 'Escape' && this.isOpen) {
                this.minimizeChat();
            }
            
            // Ctrl+/ to open chat
            if (event.ctrlKey && event.key === '/') {
                event.preventDefault();
                if (!this.isOpen) {
                    this.toggleChat();
                }
            }
        });
    }

    // Handle quick actions
    handleQuickAction(action) {
        const quickActions = {
            'popular_costumes': "Show me your most popular Halloween costumes",
            'budget_decorations': "I'm looking for Halloween decorations under $25",
            'makeup_tutorials': "Do you have any scary makeup tutorials?",
            'party_setup': "Help me plan a complete Halloween party setup",
            'size_guide': "I need help with costume sizing",
            'shipping_info': "What are your shipping options?",
            'return_policy': "What's your return policy?",
            'track_order': "How can I track my order?"
        };

        if (quickActions[action]) {
            this.sendMessage(quickActions[action]);
        }
    }

    // Get product recommendations based on user preferences
    async getPersonalizedRecommendations(preferences) {
        try {
            // Future API integration for AI-powered recommendations
            /*
            const response = await fetch(`${this.apiEndpoint}/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    preferences: preferences,
                    conversationHistory: this.conversationHistory,
                    sessionId: this.getSessionId()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get recommendations');
            }

            return await response.json();
            */

            // Demo recommendation logic
            const recommendations = {
                scary: [
                    { name: "Pennywise Deluxe Costume", price: 79.99, category: "costume" },
                    { name: "Animatronic Jumping Spider", price: 149.99, category: "decoration" },
                    { name: "Professional Scar Wax Kit", price: 34.99, category: "makeup" }
                ],
                funny: [
                    { name: "Inflatable T-Rex Costume", price: 49.99, category: "costume" },
                    { name: "Toilet Paper Mummy Decoration", price: 19.99, category: "decoration" },
                    { name: "Glow-in-Dark Face Paint", price: 12.99, category: "makeup" }
                ],
                elegant: [
                    { name: "Victorian Vampire Costume", price: 89.99, category: "costume" },
                    { name: "Gothic Candelabra Set", price: 45.99, category: "decoration" },
                    { name: "Sophisticated Vampire Makeup Kit", price: 28.99, category: "makeup" }
                ]
            };

            return recommendations[preferences.style] || recommendations.scary;

        } catch (error) {
            console.error('Error getting recommendations:', error);
            return [];
        }
    }

    // Handle voice input (future feature)
    async handleVoiceInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                this.showVoiceIndicator();
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.sendMessage(transcript);
                this.hideVoiceIndicator();
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.hideVoiceIndicator();
            };

            recognition.start();
        } else {
            this.addMessage({
                id: 'error_voice_' + Date.now(),
                type: 'bot',
                message: "Sorry, voice input isn't supported in your browser. You can type your message instead! 🎤",
                timestamp: new Date().toISOString()
            });
        }
    }

    // Show voice recording indicator
    showVoiceIndicator() {
        const input = document.getElementById('chatInput');
        if (input) {
            input.placeholder = "🎤 Listening...";
            input.disabled = true;
        }
    }

    // Hide voice recording indicator
    hideVoiceIndicator() {
        const input = document.getElementById('chatInput');
        if (input) {
            input.placeholder = "Ask about Halloween products...";
            input.disabled = false;
        }
    }

    // Handle image uploads for costume help
    async handleImageUpload(file) {
        try {
            // Future implementation for image analysis
            /*
            const formData = new FormData();
            formData.append('image', file);
            formData.append('sessionId', this.getSessionId());

            const response = await fetch(`${this.apiEndpoint}/analyze-image`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to analyze image');
            }

            const result = await response.json();
            */

            // Demo response for image upload
            const response = {
                id: 'bot_image_' + Date.now(),
                type: 'bot',
                message: "I can see your image! 📸 Based on what I'm seeing, I can suggest some great costume options that would work perfectly. Would you like scary, funny, or elegant recommendations?",
                timestamp: new Date().toISOString(),
                suggestions: ["Scary options", "Funny costumes", "Elegant choices", "Show me all"]
            };

            this.addMessage(response);

        } catch (error) {
            console.error('Error handling image upload:', error);
            this.addMessage({
                id: 'error_image_' + Date.now(),
                type: 'bot',
                message: "Sorry, I had trouble analyzing that image. You can describe what you're looking for instead! 📝",
                timestamp: new Date().toISOString()
            });
        }
    }

    // Export conversation history
    exportConversation() {
        try {
            const conversation = {
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId(),
                messages: this.conversationHistory
            };

            const blob = new Blob([JSON.stringify(conversation, null, 2)], 
                { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `spencers_chat_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            this.addMessage({
                id: 'export_' + Date.now(),
                type: 'bot',
                message: "Your conversation has been exported! 📄 You can save it for future reference.",
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error exporting conversation:', error);
        }
    }

    // Get help for specific costume ideas
    async getCostumeIdeas(theme, budget, size) {
        const ideas = {
            scary: {
                low: ["Classic Ghost", "Vampire", "Witch", "Zombie"],
                medium: ["Pennywise Clown", "Freddy Krueger", "Horror Movie Character"],
                high: ["Animatronic Creature", "Professional Movie Replica", "Custom Prosthetics"]
            },
            funny: {
                low: ["Punny Costumes", "Food Items", "Animal Onesies"],
                medium: ["Inflatable Costumes", "Group Themes", "Pop Culture References"],
                high: ["Interactive Costumes", "LED Light-up Outfits", "Mechanical Features"]
            },
            creative: {
                low: ["DIY Ideas", "Upcycled Materials", "Simple Makeup"],
                medium: ["Unique Characters", "Abstract Concepts", "Historical Figures"],
                high: ["Art Installations", "Performance Pieces", "Technical Costumes"]
            }
        };

        const budgetCategory = budget < 30 ? 'low' : budget < 80 ? 'medium' : 'high';
        const suggestions = ideas[theme]?.[budgetCategory] || ideas.scary.medium;

        return {
            id: 'costume_ideas_' + Date.now(),
            type: 'bot',
            message: `Here are some ${theme} costume ideas for your budget range! 🎭 These should work great for size ${size}:`,
            timestamp: new Date().toISOString(),
            suggestions: suggestions,
            products: this.getProductsForIdeas(suggestions, budget)
        };
    }

    // Get products matching costume ideas
    getProductsForIdeas(ideas, budget) {
        // Demo product matching
        const products = [
            { name: ideas[0] + " Costume Kit", price: Math.min(budget * 0.8, 59.99), category: "costume" },
            { name: ideas[1] + " Accessories", price: Math.min(budget * 0.3, 24.99), category: "accessory" },
            { name: "Matching Makeup Set", price: Math.min(budget * 0.4, 19.99), category: "makeup" }
        ];

        return products.filter(p => p.price <= budget);
    }

    // Halloween event calendar integration
    async getHalloweenEvents() {
        // Future integration with local events API
        const events = [
            {
                name: "Halloween Costume Contest",
                date: "2024-10-26",
                location: "Downtown Community Center",
                category: "contest"
            },
            {
                name: "Haunted House Tours",
                date: "2024-10-27",
                location: "Old Spencer Mansion",
                category: "attraction"
            },
            {
                name: "Trick-or-Treat Safety Workshop",
                date: "2024-10-28",
                location: "Local Fire Station",
                category: "educational"
            }
        ];

        return {
            id: 'events_' + Date.now(),
            type: 'bot',
            message: "Here are some awesome Halloween events happening near you! 🎪 Perfect opportunities to show off your Spencer's costume:",
            timestamp: new Date().toISOString(),
            events: events,
            suggestions: ["Get directions", "Add to calendar", "Find more events"]
        };
    }

    // Analytics for conversation improvement
    trackUserInteraction(interactionType, data = {}) {
        // Future analytics integration
        const analyticsData = {
            sessionId: this.getSessionId(),
            timestamp: new Date().toISOString(),
            interactionType: interactionType,
            data: data,
            conversationLength: this.conversationHistory.length
        };

        // Send to analytics service
        /*
        fetch('/api/analytics/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(analyticsData)
        }).catch(error => {
            console.warn('Analytics tracking failed:', error);
        });
        */

        console.log('Chat interaction tracked:', analyticsData);
    }
}

// Add CSS for chat-specific styling
const chatStyles = `
<style>
.typing-dots {
    display: flex;
    gap: 4px;
    padding: 8px 0;
}

.typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary-orange);
    animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
    }
    30% {
        transform: translateY(-10px);
        opacity: 1;
    }
}

.message-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.suggestion-btn {
    background: rgba(255, 69, 0, 0.2);
    border: 1px solid var(--primary-orange);
    color: var(--primary-orange);
    padding: 0.5rem 1rem;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.suggestion-btn:hover {
    background: var(--primary-orange);
    color: white;
    transform: translateY(-2px);
}

.message-products {
    margin-top: 1rem;
    border-top: 1px solid rgba(255, 69, 0, 0.3);
    padding-top: 1rem;
}

.products-header {
    color: var(--primary-orange);
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.chat-product-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 69, 0, 0.1);
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
}

.chat-product-name {
    font-weight: bold;
    font-size: 0.9rem;
}

.chat-product-price {
    color: var(--primary-orange);
    font-weight: bold;
}

.chat-add-to-cart {
    background: var(--primary-orange);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.8rem;
}

.chat-add-to-cart:hover {
    background: var(--secondary-orange);
    transform: scale(1.05);
}
</style>
`;

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add chat-specific styles
    document.head.insertAdjacentHTML('beforeend', chatStyles);
    
    // Initialize chatbot
    window.halloweenChatbot = new HalloweenChatbot();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HalloweenChatbot;
}