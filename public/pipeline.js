// Pipeline Animation Controller

let animationPaused = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupAnimationToggle();
    setupStageInteractions();
    startPipelineAnimation();
});

// Toggle Animation
function setupAnimationToggle() {
    const toggleBtn = document.getElementById('toggleAnimation');
    const container = document.querySelector('.pipeline-container');

    toggleBtn.addEventListener('click', () => {
        animationPaused = !animationPaused;
        
        if (animationPaused) {
            container.classList.add('paused');
            toggleBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            container.classList.remove('paused');
            toggleBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
    });
}

// Stage Interactions
function setupStageInteractions() {
    const stages = document.querySelectorAll('.pipeline-stage');
    
    stages.forEach((stage, index) => {
        stage.addEventListener('click', () => {
            highlightStage(stage, index);
        });
    });
}

function highlightStage(stage, index) {
    // Remove previous highlights
    document.querySelectorAll('.pipeline-stage').forEach(s => {
        s.style.borderColor = 'var(--border)';
    });
    
    // Highlight clicked stage
    stage.style.borderColor = 'var(--accent)';
    stage.style.boxShadow = '0 10px 40px rgba(108, 92, 231, 0.5)';
    
    // Show stage info
    showStageInfo(index + 1);
    
    // Reset after 3 seconds
    setTimeout(() => {
        stage.style.borderColor = '';
        stage.style.boxShadow = '';
    }, 3000);
}

function showStageInfo(stageNumber) {
    const stageInfo = {
        1: { time: '~10ms', tech: 'HTML/CSS/JS' },
        2: { time: '~20ms', tech: 'Fetch API' },
        3: { time: '~50ms', tech: 'Express.js' },
        4: { time: '~30ms', tech: 'Agent Logic' },
        5: { time: '~2-4s', tech: 'Groq LLM' },
        6: { time: '~100-500ms', tech: 'Terminal' },
        7: { time: '~10ms', tech: 'SSE' },
        8: { time: '~5ms', tech: 'DOM Update' },
        9: { time: 'Complete', tech: 'Success' }
    };
    
    const info = stageInfo[stageNumber];
    if (info) {
        console.log(`Stage ${stageNumber}: ${info.time} | ${info.tech}`);
    }
}

// Pipeline Animation
function startPipelineAnimation() {
    // Animate data packets flowing through pipeline
    animateDataFlow();
    
    // Update stats periodically
    updateStats();
}

function animateDataFlow() {
    const packets = document.querySelectorAll('.data-packet');
    
    packets.forEach((packet, index) => {
        // Add glow effect
        setInterval(() => {
            if (!animationPaused) {
                packet.style.boxShadow = `0 0 ${20 + Math.random() * 20}px var(--accent)`;
            }
        }, 1000 + index * 500);
    });
}

function updateStats() {
    const totalTimeEl = document.getElementById('totalTime');
    let time = 2;
    
    setInterval(() => {
        if (!animationPaused) {
            time = 2 + Math.random() * 3;
            totalTimeEl.textContent = `~${time.toFixed(1)}s`;
        }
    }, 3000);
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
        }
    });
}, observerOptions);

// Observe all stages
document.querySelectorAll('.pipeline-stage').forEach(stage => {
    observer.observe(stage);
});

// Add particle effect on hover
document.querySelectorAll('.stage-icon').forEach(icon => {
    icon.addEventListener('mouseenter', () => {
        createParticles(icon);
    });
});

function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const colors = ['#6c5ce7', '#00d4aa', '#ffd93d', '#ff6b9d'];
    
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = '50%';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 5;
        const velocity = 2;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let x = 0;
        let y = 0;
        let opacity = 1;
        
        const animate = () => {
            x += vx;
            y += vy;
            opacity -= 0.02;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        animate();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space to toggle animation
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('toggleAnimation').click();
    }
    
    // Escape to go back
    if (e.code === 'Escape') {
        window.location.href = 'index.html';
    }
});

// Add tooltip on hover
document.querySelectorAll('.pipeline-stage').forEach((stage, index) => {
    stage.setAttribute('title', `Click to highlight Stage ${index + 1}`);
});

console.log('🎨 Pipeline visualization loaded!');
console.log('💡 Tip: Press Space to pause/resume animation');
console.log('💡 Tip: Press Escape to go back to chat');
