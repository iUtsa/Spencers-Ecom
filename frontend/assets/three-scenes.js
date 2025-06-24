// Three.js Scene Management for Spencer's Halloween Store

class ThreeSceneManager {
    constructor() {
        this.scenes = {};
        this.animationFrames = {};
        this.init();
    }

    init() {
        this.createHeroScene();
        this.createCategoryScenes();
        this.bindEvents();
    }

    // Main Hero Scene with Halloween atmosphere
    createHeroScene() {
        const container = document.getElementById('three-container');
        if (!container) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0x1a0d2e, 0.3);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xff4500, 1.5, 100);
        pointLight1.position.set(10, 10, 10);
        pointLight1.castShadow = true;
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff6b35, 1, 80);
        pointLight2.position.set(-10, 5, -10);
        scene.add(pointLight2);

        // Create floating Halloween objects
        const halloweenObjects = this.createHalloweenObjects(scene);
        
        // Create particle system
        const particles = this.createParticleSystem(scene);

        // Create spooky fog
        const fog = this.createFogEffect(scene);

        // Camera positioning
        camera.position.set(0, 0, 15);

        // Animation loop
        const animate = () => {
            this.animationFrames.hero = requestAnimationFrame(animate);

            // Rotate Halloween objects
            halloweenObjects.forEach((obj, index) => {
                obj.rotation.x += 0.005 + (index * 0.001);
                obj.rotation.y += 0.008 + (index * 0.002);
                obj.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
            });

            // Animate particles
            if (particles) {
                particles.rotation.y += 0.002;
                const positions = particles.geometry.attributes.position.array;
                for (let i = 1; i < positions.length; i += 3) {
                    positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.001;
                }
                particles.geometry.attributes.position.needsUpdate = true;
            }

            // Animate lights
            pointLight1.intensity = 1.5 + Math.sin(Date.now() * 0.003) * 0.3;
            pointLight2.intensity = 1 + Math.cos(Date.now() * 0.004) * 0.2;

            renderer.render(scene, camera);
        };

        animate();

        // Store scene reference
        this.scenes.hero = { scene, camera, renderer, container };

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createHalloweenObjects(scene) {
        const objects = [];

        // Pumpkin
        const pumpkinGeometry = new THREE.SphereGeometry(1, 16, 12);
        const pumpkinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff6600,
            emissive: 0x331100,
            shininess: 30
        });
        const pumpkin = new THREE.Mesh(pumpkinGeometry, pumpkinMaterial);
        pumpkin.position.set(-8, 2, -5);
        pumpkin.castShadow = true;
        scene.add(pumpkin);
        objects.push(pumpkin);

        // Ghost (using sphere and cone)
        const ghostGeometry = new THREE.SphereGeometry(0.8, 12, 8);
        const ghostMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            emissive: 0x111111
        });
        const ghost = new THREE.Mesh(ghostGeometry, ghostMaterial);
        ghost.position.set(6, 3, -8);
        scene.add(ghost);
        objects.push(ghost);

        // Skull
        const skullGeometry = new THREE.BoxGeometry(1.2, 1.4, 1);
        const skullMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xeeeeee,
            emissive: 0x222222
        });
        const skull = new THREE.Mesh(skullGeometry, skullMaterial);
        skull.position.set(4, -3, -6);
        scene.add(skull);
        objects.push(skull);

        // Witch Hat
        const hatGeometry = new THREE.ConeGeometry(1, 2, 8);
        const hatMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a0d2e,
            emissive: 0x330066
        });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.set(-5, -2, -7);
        scene.add(hat);
        objects.push(hat);

        // Spider (using spheres)
        const spiderBody = new THREE.SphereGeometry(0.5, 8, 6);
        const spiderMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000,
            emissive: 0x220000
        });
        const spider = new THREE.Mesh(spiderBody, spiderMaterial);
        spider.position.set(8, -1, -4);
        scene.add(spider);
        objects.push(spider);

        // Bat wings (using planes)
        const batGeometry = new THREE.PlaneGeometry(2, 1);
        const batMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2d1b3d,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const bat = new THREE.Mesh(batGeometry, batMaterial);
        bat.position.set(-3, 4, -3);
        scene.add(bat);
        objects.push(bat);

        return objects;
    }

    createParticleSystem(scene) {
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = (Math.random() - 0.5) * 50;
            positions[i3 + 1] = (Math.random() - 0.5) * 50;
            positions[i3 + 2] = (Math.random() - 0.5) * 50;
            
            // Color (orange/purple theme)
            const colorChoice = Math.random();
            if (colorChoice < 0.5) {
                colors[i3] = 1; // Red
                colors[i3 + 1] = 0.27; // Green
                colors[i3 + 2] = 0; // Blue (Orange)
            } else {
                colors[i3] = 0.6; // Red
                colors[i3 + 1] = 0.2; // Green
                colors[i3 + 2] = 0.8; // Blue (Purple)
            }
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);

        return particleSystem;
    }

    createFogEffect(scene) {
        scene.fog = new THREE.Fog(0x1a0d2e, 10, 50);
        return scene.fog;
    }

    // Category scenes for product displays
    createCategoryScenes() {
        const categories = ['costumes', 'decorations', 'accessories', 'makeup'];
        
        categories.forEach(category => {
            const container = document.getElementById(`${category}-3d`);
            if (!container) return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            renderer.setClearColor(0x000000, 0);
            container.appendChild(renderer.domElement);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xff4500, 1);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);

            // Create category-specific object
            const object = this.createCategoryObject(category);
            scene.add(object);

            camera.position.z = 5;

            // Animation
            const animate = () => {
                this.animationFrames[category] = requestAnimationFrame(animate);
                object.rotation.x += 0.01;
                object.rotation.y += 0.02;
                renderer.render(scene, camera);
            };

            animate();

            this.scenes[category] = { scene, camera, renderer, container, object };
        });
    }

    createCategoryObject(category) {
        let geometry, material, object;

        switch (category) {
            case 'costumes':
                // Mannequin-like figure
                geometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xff4500,
                    emissive: 0x331100
                });
                object = new THREE.Mesh(geometry, material);
                
                // Add head
                const headGeometry = new THREE.SphereGeometry(0.3, 8, 6);
                const head = new THREE.Mesh(headGeometry, material);
                head.position.y = 1.3;
                object.add(head);
                break;

            case 'decorations':
                // Spooky tree
                geometry = new THREE.CylinderGeometry(0.1, 0.3, 2, 6);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0x2d1b3d,
                    emissive: 0x1a0d2e
                });
                object = new THREE.Mesh(geometry, material);
                
                // Add branches
                for (let i = 0; i < 6; i++) {
                    const branchGeometry = new THREE.CylinderGeometry(0.02, 0.05, 0.8, 4);
                    const branch = new THREE.Mesh(branchGeometry, material);
                    branch.position.set(
                        Math.cos(i * Math.PI / 3) * 0.3,
                        0.5 + Math.random() * 0.5,
                        Math.sin(i * Math.PI / 3) * 0.3
                    );
                    branch.rotation.z = Math.random() * 0.5;
                    object.add(branch);
                }
                break;

            case 'accessories':
                // Magic orb
                geometry = new THREE.SphereGeometry(0.8, 16, 12);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xff6b35,
                    emissive: 0xff4500,
                    transparent: true,
                    opacity: 0.8
                });
                object = new THREE.Mesh(geometry, material);
                
                // Add inner glow
                const innerGeometry = new THREE.SphereGeometry(0.6, 12, 8);
                const innerMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0xffa500,
                    transparent: true,
                    opacity: 0.3
                });
                const inner = new THREE.Mesh(innerGeometry, innerMaterial);
                object.add(inner);
                break;

            case 'makeup':
                // Makeup palette
                geometry = new THREE.BoxGeometry(1.5, 0.2, 1);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0x000000,
                    emissive: 0x330066
                });
                object = new THREE.Mesh(geometry, material);
                
                // Add color spots
                const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
                colors.forEach((color, index) => {
                    const spotGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8);
                    const spotMaterial = new THREE.MeshPhongMaterial({ color });
                    const spot = new THREE.Mesh(spotGeometry, spotMaterial);
                    spot.position.set(
                        (index % 3 - 1) * 0.4,
                        0.15,
                        (Math.floor(index / 3) - 0.5) * 0.3
                    );
                    object.add(spot);
                });
                break;

            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshPhongMaterial({ color: 0xff4500 });
                object = new THREE.Mesh(geometry, material);
        }

        return object;
    }

    // Create 3D product viewer
    createProductViewer(productData) {
        const container = document.getElementById('viewer3D');
        if (!container) return;

        // Clear previous content
        container.innerHTML = '';

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.setClearColor(0x1a0d2e, 1);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // Enhanced lighting for product viewing
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(5, 5, 5);
        directionalLight1.castShadow = true;
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xff4500, 0.4);
        directionalLight2.position.set(-5, 3, -5);
        scene.add(directionalLight2);

        // Create product based on type
        const product = this.createProductMesh(productData);
        scene.add(product);

        // Add platform
        const platformGeometry = new THREE.CylinderGeometry(2, 2, 0.1, 16);
        const platformMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2d1b3d,
            transparent: true,
            opacity: 0.7
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = -1.5;
        platform.receiveShadow = true;
        scene.add(platform);

        camera.position.set(0, 0, 5);

        // Mouse controls for rotation
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;

        container.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        container.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        container.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        // Touch controls for mobile
        container.addEventListener('touchstart', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            mouseX = touch.clientX;
            mouseY = touch.clientY;
            isMouseDown = true;
        });

        container.addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (!isMouseDown) return;
            
            const touch = event.touches[0];
            const deltaX = touch.clientX - mouseX;
            const deltaY = touch.clientY - mouseY;
            
            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;
            
            mouseX = touch.clientX;
            mouseY = touch.clientY;
        });

        container.addEventListener('touchend', (event) => {
            event.preventDefault();
            isMouseDown = false;
        });

        // Animation loop
        const animate = () => {
            this.animationFrames.viewer = requestAnimationFrame(animate);

            // Smooth rotation
            product.rotation.x += (targetRotationX - product.rotation.x) * 0.1;
            product.rotation.y += (targetRotationY - product.rotation.y) * 0.1;

            // Auto-rotation when not interacting
            if (!isMouseDown) {
                targetRotationY += 0.005;
            }

            // Floating animation
            product.position.y = Math.sin(Date.now() * 0.002) * 0.1;

            renderer.render(scene, camera);
        };

        animate();

        this.scenes.viewer = { scene, camera, renderer, container };
    }

    createProductMesh(productData) {
        const group = new THREE.Group();
        
        // Create different product types based on category
        switch (productData.category) {
            case 'costume':
                return this.createCostumeMesh(productData);
            case 'decoration':
                return this.createDecorationMesh(productData);
            case 'accessory':
                return this.createAccessoryMesh(productData);
            case 'makeup':
                return this.createMakeupMesh(productData);
            default:
                return this.createDefaultProductMesh(productData);
        }
    }

    createCostumeMesh(productData) {
        const group = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 2.5, 12);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: productData.color || 0xff4500,
            emissive: 0x331100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.35, 12, 8);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 1.6;
        head.castShadow = true;
        group.add(head);

        // Arms
        for (let i = 0; i < 2; i++) {
            const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8);
            const arm = new THREE.Mesh(armGeometry, bodyMaterial);
            arm.position.set(i === 0 ? -0.7 : 0.7, 0.5, 0);
            arm.rotation.z = (i === 0 ? 1 : -1) * Math.PI / 6;
            arm.castShadow = true;
            group.add(arm);
        }

        return group;
    }

    createDecorationMesh(productData) {
        const group = new THREE.Group();
        
        // Create a spooky lantern
        const lanternGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 8);
        const lanternMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2d1b3d,
            emissive: 0xff4500,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8
        });
        const lantern = new THREE.Mesh(lanternGeometry, lanternMaterial);
        lantern.castShadow = true;
        group.add(lantern);

        // Glowing core
        const coreGeometry = new THREE.SphereGeometry(0.3, 12, 8);
        const coreMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffa500,
            emissive: 0xff4500
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);

        return group;
    }

    createAccessoryMesh(productData) {
        const group = new THREE.Group();
        
        // Create a witch hat
        const hatGeometry = new THREE.ConeGeometry(1, 2, 12);
        const hatMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a0d2e,
            emissive: 0x330066
        });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 0.5;
        hat.castShadow = true;
        group.add(hat);

        // Hat brim
        const brimGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 16);
        const brim = new THREE.Mesh(brimGeometry, hatMaterial);
        brim.position.y = -0.5;
        brim.castShadow = true;
        group.add(brim);

        return group;
    }

    createMakeupMesh(productData) {
        const group = new THREE.Group();
        
        // Makeup compact
        const compactGeometry = new THREE.CylinderGeometry(1, 1, 0.3, 16);
        const compactMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000,
            metalness: 0.8,
            roughness: 0.2
        });
        const compact = new THREE.Mesh(compactGeometry, compactMaterial);
        compact.castShadow = true;
        group.add(compact);

        // Makeup colors
        const colors = [0xff0000, 0xff4500, 0xffa500, 0x8b4513];
        colors.forEach((color, index) => {
            const colorGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8);
            const colorMaterial = new THREE.MeshPhongMaterial({ color });
            const colorMesh = new THREE.Mesh(colorGeometry, colorMaterial);
            const angle = (index / colors.length) * Math.PI * 2;
            colorMesh.position.set(
                Math.cos(angle) * 0.5,
                0.2,
                Math.sin(angle) * 0.5
            );
            group.add(colorMesh);
        });

        return group;
    }

    createDefaultProductMesh(productData) {
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const material = new THREE.MeshPhongMaterial({ 
            color: productData.color || 0xff4500,
            emissive: 0x331100
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        return mesh;
    }

    // Utility methods
    bindEvents() {
        // Category card hover effects
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                const category = card.dataset.category;
                if (this.scenes[category] && this.scenes[category].object) {
                    // Enhance animation speed on hover
                    this.scenes[category].object.rotation.x += 0.1;
                    this.scenes[category].object.rotation.y += 0.1;
                }
            });
        });

        // Product card 3D viewer
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('view-3d-btn')) {
                const productData = JSON.parse(event.target.dataset.product);
                this.openProductViewer(productData);
            }
        });
    }

    openProductViewer(productData) {
        const modal = document.getElementById('productViewer');
        if (modal) {
            modal.classList.add('active');
            this.createProductViewer(productData);
            
            // Update product info
            document.getElementById('viewerProductName').textContent = productData.name;
            document.getElementById('viewerProductPrice').textContent = `${productData.price}`;
        }
    }

    closeProductViewer() {
        const modal = document.getElementById('productViewer');
        if (modal) {
            modal.classList.remove('active');
            if (this.animationFrames.viewer) {
                cancelAnimationFrame(this.animationFrames.viewer);
            }
        }
    }

    // Cleanup method
    destroy() {
        Object.keys(this.animationFrames).forEach(key => {
            if (this.animationFrames[key]) {
                cancelAnimationFrame(this.animationFrames[key]);
            }
        });

        Object.keys(this.scenes).forEach(key => {
            const scene = this.scenes[key];
            if (scene.renderer) {
                scene.container.removeChild(scene.renderer.domElement);
                scene.renderer.dispose();
            }
        });

        this.scenes = {};
        this.animationFrames = {};
    }

    // Resize handler
    handleResize() {
        Object.keys(this.scenes).forEach(key => {
            const scene = this.scenes[key];
            if (scene.camera && scene.renderer && scene.container) {
                const width = scene.container.offsetWidth;
                const height = scene.container.offsetHeight;
                
                scene.camera.aspect = width / height;
                scene.camera.updateProjectionMatrix();
                scene.renderer.setSize(width, height);
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.threeSceneManager = new ThreeSceneManager();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        window.threeSceneManager.handleResize();
    });
    
    // Handle product viewer close
    document.getElementById('closeViewer')?.addEventListener('click', () => {
        window.threeSceneManager.closeProductViewer();
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreeSceneManager;
}