// 3D Interactive Elements for ExpressGo
// Three.js Bus Animation

document.addEventListener('DOMContentLoaded', function() {
    init3DBus();
    init3DCardInteractions();
});

// Initialize 3D Bus Animation
function init3DBus() {
    const canvas = document.getElementById('bus3d-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true,
        antialias: true 
    });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 10, 5);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);

    // Create 3D bus using real image
    const busGroup = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();

    // If no image is found, we will use a placeholder from Unsplash
    const busImagePath = './images/bus.jpg'; 
    
    // Function to create bus with texture
    function createBusWithTexture(texture) {
        // Ensure texture displays correctly
        texture.flipY = false;
        
        // Create a plane with the bus image
        const planeGeometry = new THREE.PlaneGeometry(18, 9.5);
        const planeMaterial = new THREE.MeshPhongMaterial({ 
            map: texture,
            transparent: false,
            side: THREE.DoubleSide
        });
        
        const busPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        busPlane.position.set(0, 0, 0);
        busGroup.add(busPlane);
    }
    
    // Try loading the bus image
    textureLoader.load(
        busImagePath,
        // On success
        function(texture) {
            createBusWithTexture(texture);
        },
        // On progress
        undefined,
        // On error - try alternative paths or use placeholder
        function(error) {
            console.log('Bus image not found at ' + busImagePath + ', trying alternatives...');
            let currentIndex = 0;
            
            function tryNextPath() {
                if (currentIndex >= alternativePaths.length) {
                    // All alternatives failed, use online placeholder
                    console.log('Using online placeholder. Please add a bus image to images/bus.jpg');
                    textureLoader.load(
                        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop',
                        function(texture) {
                            createBusWithTexture(texture);
                        },
                        undefined,
                        function() {
                            // Final fallback - solid color
                            const planeGeometry = new THREE.PlaneGeometry(6, 3.5);
                            const planeMaterial = new THREE.MeshPhongMaterial({ 
                                color: 0x002e9b,
                                side: THREE.DoubleSide
                            });
                            const busPlane = new THREE.Mesh(planeGeometry, planeMaterial);
                            busPlane.position.set(0, 0, 0);
                            busGroup.add(busPlane);
                        }
                    );
                    return;
                }
                
                textureLoader.load(
                    function(texture) {
                        createBusWithTexture(texture);
                    },
                    undefined,
                    function() {
                        currentIndex++;
                        tryNextPath();
                    }
                );
            }
            
            tryNextPath();
        }
    );

    scene.add(busGroup);

    // Camera position
    camera.position.set(0, 0, 0);
    camera.lookAt(1, 1, 0);
    // camera.lookAt(0, 1, 0);

    // Animation variables
    let mouseX = 5;
    let mouseY = 5;
    let targetRotationY = 5;
    let targetRotationX = 5;

    // Mouse interaction
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        targetRotationY = mouseX * 0.3;
        targetRotationX = mouseY * 0.2;
    });

    // Animation loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        
        time += 0.01;
        
        // Smooth rotation following mouse
        busGroup.rotation.y += (targetRotationY - busGroup.rotation.y) * 0.1;
        busGroup.rotation.x += (targetRotationX - busGroup.rotation.x) * 0.1;
        
        // Gentle floating animation
        busGroup.position.y = Math.sin(time) * 0.2;
        
        // No wheels to rotate with image-based bus

        // Rotate camera around bus
        const radius = 8;
        camera.position.x = Math.sin(time * 0.3) * radius * 0.3;
        camera.position.z = 8 + Math.cos(time * 0.3) * radius * 0.2;
        camera.lookAt(busGroup.position);

        renderer.render(scene, camera);
    }

    // Handle window resize
    function handleResize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    // Start animation
    animate();
}

// Initialize 3D Card Interactions
function init3DCardInteractions() {
    const cards = document.querySelectorAll('.card-3d');
    
    cards.forEach(card => {
        let isFlipped = false;
        
        // Add tilt effect on mouse move (desktop only)
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                if (!isFlipped) {
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
                }
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!isFlipped) {
                card.style.transform = '';
            }
        });

        // Touch support for mobile devices
        card.addEventListener('touchstart', () => {
            isFlipped = !isFlipped;
            card.classList.toggle('touched');
        });
    });
}

