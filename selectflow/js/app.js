// Main application controller
class App {
    constructor() {
        this.currentPage = 'loading';
        this.init();
    }

    async init() {
        // Show loading screen
        this.showLoading();

        // Check if user is already authenticated
        const isAuthenticated = await window.authManager.checkAuthStatus();
        
        if (isAuthenticated) {
            await this.showDashboard();
        } else {
            this.showPreview();
        }
    }

    showLoading() {
        this.hideAllPages();
        document.getElementById('loading-screen').classList.remove('hidden');
        this.currentPage = 'loading';
    }

    showPreview() {
        this.hideAllPages();
        document.getElementById('preview-landing').classList.remove('hidden');
        this.currentPage = 'preview';
        this.loadPreviewData();
    }

    showLogin() {
        this.hideAllPages();
        document.getElementById('login-form').classList.remove('hidden');
        this.currentPage = 'login';
        
        // Clear form
        document.getElementById('login-form-element').reset();
        window.authManager.clearMessages('login-form');
    }

    showRegister() {
        this.hideAllPages();
        document.getElementById('register-form').classList.remove('hidden');
        this.currentPage = 'register';
        
        // Clear form
        document.getElementById('register-form-element').reset();
        window.authManager.clearMessages('register-form');
        
        // Reset to candidate type
        const candidateBtn = document.querySelector('#register-form .user-type-btn[data-type="candidate"]');
        if (candidateBtn) {
            candidateBtn.click();
        }
    }

    async showDashboard() {
        const user = window.authManager.currentUser;
        if (!user) {
            this.showPreview();
            return;
        }

        this.hideAllPages();
        document.getElementById('dashboard').classList.remove('hidden');
        this.currentPage = 'dashboard';

        // Load dashboard data
        await window.dashboardManager.loadMetrics();
        window.dashboardManager.renderSidebar(user);
        window.dashboardManager.renderContent();
    }

    hideAllPages() {
        const pages = document.querySelectorAll('.page, #loading-screen');
        pages.forEach(page => page.classList.add('hidden'));
    }

    async loadPreviewData() {
        try {
            // Load jobs data
            const jobs = await window.apiService.getPublicJobs();
            this.renderJobs(jobs.slice(0, 6)); // Show only first 6 jobs
            
            // Update search functionality
            this.setupJobSearch(jobs);
            
        } catch (error) {
            console.error('Failed to load preview data:', error);
            // Show fallback data
            this.renderFallbackJobs();
        }
    }

    renderJobs(jobs) {
        const jobsGrid = document.getElementById('jobs-grid');
        
        jobsGrid.innerHTML = jobs.map(job => `
            <div class="job-card" onclick="showLogin()">
                <div class="job-card-header">
                    <div>
                        <div class="job-card-title">${job.title}</div>
                        <div class="job-card-company">
                            🏢 ${job.company || 'Empresa'}
                        </div>
                    </div>
                    <div class="job-card-location">${this.getWorkLocationIcon(job.workLocation)}</div>
                </div>
                
                <div class="job-card-meta">
                    <div class="job-card-meta-item">
                        📍 ${job.location} • ${job.workLocation}
                    </div>
                    <div class="job-card-meta-item">
                        👤 ${job.applicants} candidatos
                    </div>
                </div>
                
                <div class="job-card-description">${job.description}</div>
                
                <div class="job-card-salary">
                    <span class="job-card-salary-amount">${job.salary}</span>
                    <span>${job.type}</span>
                </div>
                
                <div class="job-card-tags">
                    ${(job.tags || []).slice(0, 3).map(tag => `
                        <span class="job-tag">${tag}</span>
                    `).join('')}
                    ${job.tags && job.tags.length > 3 ? `<span class="job-tag">+${job.tags.length - 3}</span>` : ''}
                </div>
                
                <div class="job-card-footer">
                    <div class="job-card-applicants">
                        👤 ${job.applicants} candidatos
                    </div>
                    <button class="btn btn-primary btn-apply" onclick="event.stopPropagation(); window.app.handleJobApplication(${job.id});">
                        Candidatar-se
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderFallbackJobs() {
        const fallbackJobs = [
            {
                id: '1',
                title: 'Desenvolvedor Full Stack',
                company: 'TechCorp',
                location: 'São Paulo, SP',
                workLocation: 'Híbrido',
                salary: 'R$ 8.000 - R$ 12.000',
                type: 'Tempo integral',
                applicants: 45,
                description: 'Procuramos um desenvolvedor experiente para nossa equipe de tecnologia.',
                tags: ['React', 'Node.js', 'TypeScript']
            },
            {
                id: '2',
                title: 'Analista de Dados',
                company: 'DataTech',
                location: 'São Paulo, SP',
                workLocation: 'Remoto',
                salary: 'R$ 6.000 - R$ 9.000',
                type: 'Tempo integral',
                applicants: 32,
                description: 'Oportunidade para analista de dados com foco em business intelligence.',
                tags: ['Python', 'SQL', 'Power BI']
            },
            {
                id: '3',
                title: 'Designer UX/UI',
                company: 'DesignCorp',
                location: 'Rio de Janeiro, RJ',
                workLocation: 'Presencial',
                salary: 'R$ 4.000 - R$ 6.000',
                type: 'Tempo integral',
                applicants: 28,
                description: 'Estamos buscando um designer criativo para melhorar a experiência do usuário.',
                tags: ['Figma', 'Adobe XD', 'Prototyping']
            }
        ];
        
        this.renderJobs(fallbackJobs);
    }

    setupJobSearch(jobs) {
        const searchInput = document.getElementById('job-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredJobs = jobs.filter(job => 
                    job.title.toLowerCase().includes(searchTerm) ||
                    (job.company && job.company.toLowerCase().includes(searchTerm)) ||
                    (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
                );
                this.renderJobs(filteredJobs.slice(0, 6));
            });
        }
    }

    getWorkLocationIcon(workLocation) {
        switch (workLocation?.toLowerCase()) {
            case 'remoto':
                return '🏠';
            case 'presencial':
                return '🏢';
            case 'híbrido':
                return '🔄';
            default:
                return '📍';
        }
    }

    async handleJobApplication(jobId) {
        // Check if user is logged in
        if (!window.authManager.currentUser) {
            showLogin();
            return;
        }

        // Check if user is a candidate
        if (window.authManager.currentUser.type !== 'candidate') {
            alert('Apenas candidatos podem se candidatar a vagas.');
            return;
        }

        try {
            const response = await window.apiService.applyToJob(jobId);
            
            // Update button state
            const button = event.target;
            button.textContent = 'Candidatura Enviada';
            button.classList.add('applied');
            button.disabled = true;
            
            // Show success message
            this.showMessage('Candidatura enviada com sucesso!', 'success');
        } catch (error) {
            this.showMessage('Erro ao enviar candidatura: ' + error.message, 'error');
        }
    }

    showMessage(message, type) {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
        `;

        document.body.appendChild(messageDiv);

        // Remove message after 3 seconds
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onclick events
function showLogin() {
    if (window.app) {
        window.app.showLogin();
    }
}

function showRegister() {
    if (window.app) {
        window.app.showRegister();
    }
}

function showPreview() {
    if (window.app) {
        window.app.showPreview();
    }
}

function googleLogin() {
    alert('Funcionalidade de login com Google em desenvolvimento.');
}