// Dashboard functionality
class DashboardManager {
    constructor() {
        this.activeTab = 'dashboard';
        this.metrics = {
            totalCandidates: 0,
            activeJobs: 0,
            candidatesInReview: 0,
            scheduledInterviews: 0,
            totalApplications: 0,
            hiredCandidates: 0
        };
    }

    async loadMetrics() {
        try {
            const metricsData = await window.apiService.getDashboardMetrics();
            this.metrics = metricsData;
        } catch (error) {
            console.error('Failed to load metrics:', error);
        }
    }

    renderSidebar(user) {
        const sidebar = document.getElementById('sidebar');
        
        const navigation = user.type === 'company' ? [
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'jobs', label: 'Vagas', icon: '💼' },
            { id: 'candidates', label: 'Candidatos', icon: '👥' },
            { id: 'profile', label: 'Perfil', icon: '🏢' },
        ] : [
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'jobs', label: 'Vagas', icon: '🔍' },
            { id: 'applications', label: 'Candidaturas', icon: '📄' },
            { id: 'profile', label: 'Perfil', icon: '👤' },
        ];

        sidebar.className = 'sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="logo">
                    <img src="public/SelectFlowBranco.png" alt="SelectFlow" class="logo-text">
                </div>
            </div>

            <div class="sidebar-profile">
                <div class="sidebar-avatar">
                    <img src="${user.avatar}" alt="${user.name}">
                </div>
                <div class="sidebar-name">${this.formatName(user.name)}</div>
                <div class="sidebar-role">${user.type === 'company' ? 'Empresa' : 'Candidato'}</div>
            </div>

            <nav class="sidebar-nav">
                ${navigation.map(item => `
                    <button class="nav-item ${item.id === this.activeTab ? 'active' : ''}" 
                            onclick="window.dashboardManager.setActiveTab('${item.id}')"
                            data-tab-id="${item.id}">
                        <span class="nav-icon">${item.icon}</span>
                        <span>${item.label}</span>
                    </button>
                `).join('')}
            </nav>

            <button class="sidebar-logout" onclick="window.authManager.logout()">
                <span class="nav-icon">→</span>
                <span>Sair</span>
            </button>
        `;
    }

    setActiveTab(tab) {
        if (!tab) {
            console.error('No tab specified');
            return;
        }
        
        console.log(`Activating tab: ${tab}`);
        this.activeTab = tab;
        this.renderContent();
        
        // Update active nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.tabId === tab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    renderContent() {
        console.log(`Rendering content for tab: ${this.activeTab}`);
        const mainContent = document.getElementById('main-content');
        
        if (!mainContent) {
            console.error('Main content element not found');
            return;
        }

        const user = window.authManager.currentUser ;
        if (!user) {
            console.error('User  not authenticated');
            return;
        }

        try {
            switch (this.activeTab) {
                case 'dashboard':
                    this.renderDashboardHome(mainContent, user);
                    break;
                case 'jobs':
                    this.renderJobsView(mainContent, user);
                    break;
                case 'candidates':
                    this.renderCandidatesView(mainContent);
                    break;
                case 'applications':
                    this.renderApplicationsView(mainContent);
                    break;
                case 'profile':
                    this.renderProfileView(mainContent, user);
                    break;
                default:
                    console.warn(`Unknown tab: ${this.activeTab}`);
                    this.renderDashboardHome(mainContent, user);
            }
        } catch (error) {
            console.error('Error rendering content:', error);
            mainContent.innerHTML = '<div class="error">Ocorreu um erro ao carregar esta página</div>';
        }
    }

    renderDashboardHome(container, user) {
        console.log('Rendering dashboard home');
        try {
            const firstName = user.name ? user.name.split(' ')[0] : 'Usuário';
            const greeting = user.type === 'company'
                ? `Bem-vindo, ${user.name || 'Empresa'}!`
                : `Olá, ${firstName}!`;
            const subtitle = user.type === 'company'
                ? 'Aqui está um resumo das suas atividades de recrutamento'
                : 'Aqui está um resumo das suas atividades';

            container.innerHTML = `
                <div class="dashboard-header">
                    <h1 class="dashboard-title">${greeting}</h1>
                    <p class="dashboard-subtitle">${subtitle}</p>
                </div>

                <div class="metrics-grid">
                    ${this.renderMetricCard('Total de candidatos', this.metrics.totalCandidates, '👤', 'blue')}
                    ${this.renderMetricCard('Vagas ativas', this.metrics.activeJobs, '💼', 'purple')}
                    ${this.renderMetricCard('Em análise', this.metrics.candidatesInReview, '📄', 'gray')}
                    ${this.renderMetricCard('Entrevistas', this.metrics.scheduledInterviews, '📅', 'green')}
                </div>

                <div class="content-grid">
                    ${this.renderRecentActivities()}
                    ${this.renderQuickStats()}
                </div>
            `;
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            container.innerHTML = '<div class="error">Ocorreu um erro ao carregar o dashboard</div>';
        }
    }

    renderMetricCard(title, value, icon, variant) {
        return `
            <div class="metric-card ${variant}">
                <div class="metric-header">
                    <div>
                        <div class="metric-icon">${icon}</div>
                    </div>
                </div>
                <div class="metric-title">${title}</div>
                <div class="metric-value">${value.toLocaleString()}</div>
            </div>
        `;
    }

    renderRecentActivities() {
        const activities = [
            { action: 'Nova candidatura recebida', detail: 'Desenvolvedor Full Stack - João Silva', time: '1 hora atrás' },
            { action: 'Entrevista agendada', detail: 'Analista de Dados - Amanda Silva', time: '3 horas atrás' },
            { action: 'Candidato contratado', detail: 'Designer UX/UI - Bruno Ferreira', time: '1 dia atrás' },
        ];

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Atividades Recentes</h3>
                </div>
                <div class="card-content">
                    <div class="activity-feed">
                        ${activities.map(activity => `
                            <div class="activity-item">
                                <div class="activity-dot"></div>
                                <div class="activity-content">
                                    <div class="activity-title">${activity.action}</div>
                                    <div class="activity-description">${activity.detail}</div>
                                    <div class="activity-time">${activity.time}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderQuickStats() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Estatísticas Rápidas</h3>
                </div>
                <div class="card-content">
                    <div class="activity-feed">
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-title">Taxa de aprovação</div>
                                <div class="activity-description">68% dos candidatos passam para entrevista</div>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-title">Tempo médio</div>
                                <div class="activity-description">12 dias para contratação</div>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-title">Score IA médio</div>
                                <div class="activity-description">84% de compatibilidade</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderJobsView(container, user) {
        if (user.type === 'company') {
            await this.renderCompanyJobs(container, user);
        } else {
            await this.renderCandidateJobs(container, user);
        }
    }

    async renderCompanyJobs(container, user) {
        // Formulário para criar vaga
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Minhas Vagas</h1>
                <p class="dashboard-subtitle">Gerencie e crie oportunidades de emprego</p>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Cadastrar nova vaga</h3></div>
                <div class="card-content">
                    <form id="job-create-form">
                        <div class="form-group">
                            <label>Título</label>
                            <input type="text" id="job-title" required>
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea id="job-description" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Localização</label>
                            <input type="text" id="job-location" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo de trabalho</label>
                            <select id="job-type">
                                <option value="full-time">Tempo Integral</option>
                                <option value="part-time">Meio Período</option>
                                <option value="remote">Remoto</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Faixa Salarial</label>
                            <input type="text" id="job-salary">
                        </div>
                        <button type="submit" class="btn btn-primary">Criar Vaga</button>
                        <div id="job-create-message" style="margin-top:10px;"></div>
                    </form>
                </div>
            </div>
            <div class="card" id="company-jobs-list">
                <div class="card-header"><h3 class="card-title">Vagas cadastradas</h3></div>
                <div class="card-content" id="company-jobs-content">
                    <p>Carregando vagas...</p>
                </div>
            </div>
        `;

        // Handler do formulário
        document.getElementById('job-create-form').onsubmit = async (e) => {
            e.preventDefault();
            const title = document.getElementById('job-title').value;
            const description = document.getElementById('job-description').value;
            const location = document.getElementById('job-location').value;
            const jobType = document.getElementById('job-type').value;
            const salary = document.getElementById('job-salary').value;
            const messageDiv = document.getElementById('job-create-message');
            messageDiv.textContent = '';
            try {
                await window.apiService.createJob({
                    title,
                    description,
                    location,
                    workLocation: jobType,
                    salary,
                    type: jobType
                });
                messageDiv.textContent = 'Vaga criada com sucesso!';
                messageDiv.style.color = 'green';
                document.getElementById('job-create-form').reset();
                await this.loadCompanyJobs();
            } catch (err) {
                messageDiv.textContent = 'Erro ao criar vaga.';
                messageDiv.style.color = 'red';
            }
        };
        await this.loadCompanyJobs();
    }

    async loadCompanyJobs() {
        const content = document.getElementById('company-jobs-content');
        try {
            const jobs = await window.apiService.getJobs();
            if (!jobs.length) {
                content.innerHTML = '<p>Nenhuma vaga cadastrada.</p>';
                return;
            }
            content.innerHTML = jobs.map(job => `
                <div class="job-item" data-job-id="${job.id}">
                    <h4>${job.title}</h4>
                    <div class="job-meta"><b>Local:</b> ${job.location} | <b>Tipo:</b> ${job.workLocation}</div>
                    <div class="job-meta"><b>Salário:</b> ${job.salary || 'Não informado'}</div>
                    <button class="btn-apply" onclick="window.dashboardManager.openJobModal(${job.id}, 'company')">Ver detalhes</button>
                    <div class="job-date">Publicado em: ${job.postedAt}</div>
                </div>
            `).join('');
        } catch (err) {
            content.innerHTML = '<p>Erro ao carregar vagas.</p>';
        }
    }

    async renderCandidateJobs(container, user) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Vagas Disponíveis</h1>
                <p class="dashboard-subtitle">Encontre oportunidades que combinam com seu perfil</p>
            </div>
            <div class="card" id="candidate-jobs-list">
                <div class="card-header"><h3 class="card-title">Vagas abertas</h3></div>
                <div class="card-content" id="candidate-jobs-content">
                    <p>Carregando vagas...</p>
                </div>
            </div>
        `;
        await this.loadCandidateJobs();
    }

    async loadCandidateJobs() {
        const content = document.getElementById('candidate-jobs-content');
        try {
            const jobs = await window.apiService.getJobs();
            if (!jobs.length) {
                content.innerHTML = '<p>Nenhuma vaga disponível.</p>';
                return;
            }
            content.innerHTML = jobs.map(job => `
                <div class="job-item" data-job-id="${job.id}">
                    <h4>${job.title}</h4>
                    <div class="job-meta"><b>Empresa:</b> ${job.company}</div>
                    <div class="job-meta"><b>Local:</b> ${job.location} | <b>Tipo:</b> ${job.workLocation}</div>
                    <div class="job-meta"><b>Salário:</b> ${job.salary || 'Não informado'}</div>
                    <button class="btn-apply" onclick="window.dashboardManager.openJobModal(${job.id}, 'candidate')">Ver detalhes</button>
                    <div class="job-date">Publicado em: ${job.postedAt}</div>
                </div>
            `).join('');
        } catch (err) {
            content.innerHTML = '<p>Erro ao carregar vagas.</p>';
        }
    }

    openJobModal(jobId, userType) {
        // Busca o job na lista renderizada
        let jobs = [];
        if (userType === 'company') {
            jobs = Array.from(document.querySelectorAll('#company-jobs-content .job-item'));
        } else {
            jobs = Array.from(document.querySelectorAll('#candidate-jobs-content .job-item'));
        }
        const jobDiv = jobs.find(j => j.getAttribute('data-job-id') == jobId);
        if (!jobDiv) return;
        // Pega os dados do job do DOM
        const title = jobDiv.querySelector('h4').textContent;
        const meta = jobDiv.querySelectorAll('.job-meta');
        const description = jobDiv.querySelector('.job-desc') ? jobDiv.querySelector('.job-desc').textContent : '';
        const date = jobDiv.querySelector('.job-date').textContent;
        let empresa = '';
        if (userType === 'candidate') {
            empresa = meta[0].textContent;
        }
        // Cria o modal
        let modal = document.getElementById('job-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'job-modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="modal-overlay" onclick="window.dashboardManager.closeJobModal()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="window.dashboardManager.closeJobModal()">&times;</button>
                <h2>${title}</h2>
                ${empresa ? `<div class='job-meta'>${empresa}</div>` : ''}
                ${Array.from(meta).map(m => `<div class='job-meta'>${m.textContent}</div>`).join('')}
                <div class='job-desc'>${description}</div>
                <div class='job-date'>${date}</div>
                ${userType === 'candidate' ? `<button class='btn-apply' onclick='window.dashboardManager.applyToJob(${jobId}, this)'>Candidatar-se</button><span class="apply-message" style="margin-left:10px;font-size:0.95em;"></span>` : ''}
            </div>
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeJobModal() {
        const modal = document.getElementById('job-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    async applyToJob(jobId, btn) {
        const messageSpan = btn.nextElementSibling;
        btn.disabled = true;
        messageSpan.textContent = '';
        try {
            await window.apiService.applyToJob(jobId);
            messageSpan.textContent = 'Candidatura enviada!';
            messageSpan.style.color = 'green';
        } catch (err) {
            messageSpan.textContent = 'Erro ao candidatar-se.';
            messageSpan.style.color = 'red';
        }
        setTimeout(() => {
            btn.disabled = false;
            messageSpan.textContent = '';
        }, 2500);
    }

    renderCandidatesView(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Candidatos</h1>
                <p class="dashboard-subtitle">Gerencie candidatos que se aplicaram às suas vagas</p>
            </div>
            <div class="card">
                <div class="card-content">
                    <p>Funcionalidade de gerenciamento de candidatos em desenvolvimento...</p>
                </div>
            </div>
        `;
    }

// Applications view
async renderApplicationsView(container) {
    container.innerHTML = `
        <div class="dashboard-header">
            <h1 class="dashboard-title">Minhas Candidaturas</h1>
            <p class="dashboard-subtitle">Acompanhe o status das suas candidaturas</p>
        </div>
        <div id="applications-content">
            <div class="loading-spinner"></div>
            <p>Carregando candidaturas...</p>
        </div>
    `;

    try {
        // Debugging: Check if apiService and getApplications are defined
        if (typeof window.apiService === 'undefined' || typeof window.apiService.getApplications !== 'function') {
            throw new Error('apiService or getApplications is not defined');
        }

        const applications = await window.apiService.getApplications();
        this.renderApplicationsList(applications || []);
    } catch (error) {
        console.error('Error loading applications:', error);
        document.getElementById('applications-content').innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar candidaturas</p>
                <button onclick="window.dashboardManager.renderApplicationsView(this.parentElement)">Tentar novamente</button>
            </div>
        `;
    }
}

    async renderProfileView(container, user) {
        container.innerHTML = `        this.renderApplicationsList(applications);

            <div class="dashboard-header">
                <h1 class="dashboard-title">${user.type === 'company' ? 'Perfil da Empresa' : 'Meu Perfil'}</h1>
                <p class="dashboard-subtitle">Mantenha suas informações atualizadas</p>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Informações do Perfil</h3>
                </div>
                <div class="card-content" id="profile-content">
                    <p>Carregando perfil...</p>
                </div>
            </div>
        `;
        await this.loadProfile(user);
    }

    async loadProfile(user) {
        const content = document.getElementById('profile-content');
        try {
            const profile = await window.apiService.getProfile();
            if (user.type === 'candidate') {
                this.renderCandidateProfile(content, profile);
            } else {
                this.renderCompanyProfile(content, profile);
            }
        } catch (err) {
            content.innerHTML = '<p>Erro ao carregar perfil.</p>';
        }
    }

    renderCandidateProfile(container, profile) {
        container.innerHTML = `
            <form id="candidate-profile-form">
                <div class="form-group">
                    <label>Foto de Perfil</label>
                    <div class="profile-photo-upload">
                        <div class="current-photo">
                            <img id="profile-photo-preview" src="${profile.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.nome || 'User') + '&background=7c3aed&color=fff'}" alt="Foto de perfil" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
                        </div>
                        <input type="file" id="profile-photo-input" accept="image/*" style="margin-top: 10px;">
                        <button type="button" id="upload-photo-btn" class="btn btn-outline" style="margin-top: 10px;">Alterar Foto</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" id="candidate-name" value="${profile.nome || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="candidate-email" value="${profile.email || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>CPF</label>
                    <input type="text" id="candidate-cpf" value="${profile.cpf || ''}">
                </div>
                <div class="form-group">
                    <label>CEP</label>
                    <input type="text" id="candidate-cep" value="${profile.cep || ''}">
                </div>
                <div class="form-group">
                    <label>Idade</label>
                    <input type="number" id="candidate-age" value="${profile.age || ''}" min="16" max="100">
                </div>
                <div class="form-group">
                    <label>Descrição Pessoal</label>
                    <textarea id="candidate-bio" placeholder="Conte um pouco sobre você, seus objetivos e experiências...">${profile.bio || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="text" id="candidate-phone" value="${profile.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Localização</label>
                    <input type="text" id="candidate-location" value="${profile.location || ''}">
                </div>
                <div class="form-group">
                    <label>Habilidades (separadas por vírgula)</label>
                    <textarea id="candidate-skills" placeholder="JavaScript, Python, React...">${(profile.skills || []).join(', ')}</textarea>
                </div>
                <div class="form-group">
                    <label>Experiência Profissional</label>
                    <textarea id="candidate-experience" placeholder="Descreva sua experiência...">${(profile.experience || []).join('\n')}</textarea>
                </div>
                <div class="form-group">
                    <label>Educação</label>
                    <textarea id="candidate-education" placeholder="Formação acadêmica...">${(profile.education || []).join('\n')}</textarea>
                </div>
                <div class="form-group">
                    <label>Idiomas</label>
                    <textarea id="candidate-languages" placeholder="Português (nativo), Inglês (avançado)...">${(profile.languages || []).join(', ')}</textarea>
                </div>
                <div class="form-group">
                    <label>LinkedIn (opcional)</label>
                    <input type="url" id="candidate-linkedin" value="${profile.linkedin || ''}" placeholder="https://linkedin.com/in/seuperfil">
                </div>
                <div class="form-group">
                    <label>Portfólio (opcional)</label>
                    <input type="url" id="candidate-portfolio" value="${profile.portfolio || ''}" placeholder="https://seuportfolio.com">
                </div>
                <div class="form-group">
                    <label>GitHub (opcional)</label>
                    <input type="url" id="candidate-github" value="${profile.github || ''}" placeholder="https://github.com/seuusuario">
                </div>
                <button type="submit" class="btn btn-primary">Salvar Perfil</button>
                <button type="button" class="btn btn-outline" onclick="window.dashboardManager.previewProfile()" style="margin-left: 10px;">
                    Visualizar Perfil
                </button>
                <div id="profile-message" style="margin-top:10px;"></div>
            </form>
        `;

        // Setup photo upload
        this.setupPhotoUpload();

        document.getElementById('candidate-profile-form').onsubmit = async (e) => {
            e.preventDefault();
            await this.saveCandidateProfile();
        };
    }

    renderCompanyProfile(container, profile) {
        container.innerHTML = `
            <form id="company-profile-form">
                <div class="form-group">
                    <label>Foto de Perfil</label>
                    <div class="profile-photo-upload">
                        <div class="current-photo">
                            <img id="profile-photo-preview" src="${profile.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.nome || 'Company') + '&background=7c3aed&color=fff'}" alt="Foto de perfil" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
                        </div>
                        <input type="file" id="profile-photo-input" accept="image/*" style="margin-top: 10px;">
                        <button type="button" id="upload-photo-btn" class="btn btn-outline" style="margin-top: 10px;">Alterar Foto</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Nome do Responsável</label>
                    <input type="text" id="company-contact-name" value="${profile.nome || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="company-email" value="${profile.email || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Nome da Empresa</label>
                    <input type="text" id="company-name" value="${profile.company_name || ''}">
                </div>
                <div class="form-group">
                    <label>CNPJ</label>
                    <input type="text" id="company-cnpj" value="${profile.cnpj || ''}">
                </div>
                <div class="form-group">
                    <label>Telefone de Contato</label>
                    <input type="text" id="company-phone" value="${profile.company_phone || ''}">
                </div>
                <div class="form-group">
                    <label>Descrição da Empresa</label>
                    <textarea id="company-description" placeholder="Descreva sua empresa...">${profile.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Setor/Indústria</label>
                    <input type="text" id="company-industry" value="${profile.industry || ''}">
                </div>
                <div class="form-group">
                    <label>Tamanho da Empresa</label>
                    <select id="company-size">
                        <option value="">Selecione...</option>
                        <option value="1-10" ${profile.size === '1-10' ? 'selected' : ''}>1-10 funcionários</option>
                        <option value="11-50" ${profile.size === '11-50' ? 'selected' : ''}>11-50 funcionários</option>
                        <option value="51-200" ${profile.size === '51-200' ? 'selected' : ''}>51-200 funcionários</option>
                        <option value="201-500" ${profile.size === '201-500' ? 'selected' : ''}>201-500 funcionários</option>
                        <option value="500+" ${profile.size === '500+' ? 'selected' : ''}>500+ funcionários</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Website</label>
                    <input type="url" id="company-website" value="${profile.website || ''}">
                </div>
                <div class="form-group">
                    <label>Localização</label>
                    <input type="text" id="company-location" value="${profile.location || ''}">
                </div>
                <div class="form-group">
                    <label>LinkedIn da Empresa (opcional)</label>
                    <input type="url" id="company-linkedin" value="${profile.linkedin || ''}" placeholder="https://linkedin.com/company/suaempresa">
                </div>
                <button type="submit" class="btn btn-primary">Salvar Perfil</button>
                <button type="button" class="btn btn-outline" onclick="window.dashboardManager.previewProfile()" style="margin-left: 10px;">
                    Visualizar Perfil
                </button>
                <div id="profile-message" style="margin-top:10px;"></div>
            </form>
        `;

        // Setup photo upload
        this.setupPhotoUpload();

        document.getElementById('company-profile-form').onsubmit = async (e) => {
            e.preventDefault();
            await this.saveCompanyProfile();
        };
    }

    async saveCandidateProfile() {
        const messageDiv = document.getElementById('profile-message');
        messageDiv.textContent = '';
        try {
            const skills = document.getElementById('candidate-skills').value
                .split(',').map(s => s.trim()).filter(s => s);
            const experience = document.getElementById('candidate-experience').value
                .split('\n').map(s => s.trim()).filter(s => s);
            const education = document.getElementById('candidate-education').value
                .split('\n').map(s => s.trim()).filter(s => s);
            const languages = document.getElementById('candidate-languages').value
                .split(',').map(s => s.trim()).filter(s => s);

            await window.apiService.updateProfile({
                cpf: document.getElementById('candidate-cpf').value,
                cep: document.getElementById('candidate-cep').value,
                age: document.getElementById('candidate-age').value,
                bio: document.getElementById('candidate-bio').value,
                phone: document.getElementById('candidate-phone').value,
                location: document.getElementById('candidate-location').value,
                linkedin: document.getElementById('candidate-linkedin').value,
                portfolio: document.getElementById('candidate-portfolio').value,
                github: document.getElementById('candidate-github').value,
                skills,
                experience,
                education,
                languages
            });
            messageDiv.textContent = 'Perfil atualizado com sucesso!';
            messageDiv.style.color = 'green';
        } catch (err) {
            messageDiv.textContent = 'Erro ao atualizar perfil.';
            messageDiv.style.color = 'red';
        }
    }

    async saveCompanyProfile() {
        const messageDiv = document.getElementById('profile-message');
        messageDiv.textContent = '';
        try {
            await window.apiService.updateProfile({
                company_name: document.getElementById('company-name').value,
                cnpj: document.getElementById('company-cnpj').value,
                company_phone: document.getElementById('company-phone').value,
                description: document.getElementById('company-description').value,
                industry: document.getElementById('company-industry').value,
                size: document.getElementById('company-size').value,
                website: document.getElementById('company-website').value,
                location: document.getElementById('company-location').value,
                linkedin: document.getElementById('company-linkedin').value
            });
            messageDiv.textContent = 'Perfil atualizado com sucesso!';
            messageDiv.style.color = 'green';
        } catch (err) {
            messageDiv.textContent = 'Erro ao atualizar perfil.';
            messageDiv.style.color = 'red';
        }
    }

    setupPhotoUpload() {
        const photoInput = document.getElementById('profile-photo-input');
        const uploadBtn = document.getElementById('upload-photo-btn');
        const preview = document.getElementById('profile-photo-preview');

        uploadBtn.addEventListener('click', () => {
            photoInput.click();
        });

        photoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Preview the image
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);

                // Upload the image
                await this.uploadProfilePhoto(file);
            }
        });
    }

    async uploadProfilePhoto(file) {
        const messageDiv = document.getElementById('profile-message');
        messageDiv.textContent = '';

        try {
            const formData = new FormData();
            formData.append('photo', file);

            const response = await fetch('/api/profile/photo', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Foto atualizada com sucesso!';
                messageDiv.style.color = 'green';
                
                // Update user avatar in session
                if (window.authManager.currentUser) {
                    window.authManager.currentUser.avatar = data.avatar;
                }
                
                // Update sidebar avatar
                const sidebarAvatar = document.querySelector('.sidebar-avatar img');
                if (sidebarAvatar) {
                    sidebarAvatar.src = data.avatar;
                }
            } else {
                throw new Error(data.error || 'Erro ao fazer upload da foto');
            }
        } catch (error) {
            messageDiv.textContent = 'Erro ao fazer upload da foto: ' + error.message;
            messageDiv.style.color = 'red';
        }
    }

    formatName(name) {
        if (!name) return '';
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    renderApplicationsList(applications) {
        const content = document.getElementById('applications-content');
        
        if (applications.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhuma candidatura encontrada</h3>
                    <p>Você ainda não se candidatou a nenhuma vaga.</p>
                    <button class="btn btn-primary" onclick="window.dashboardManager.setActiveTab('jobs')">
                        Buscar Vagas
                    </button>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div class="applications-grid">
                ${applications.map(app => `
                    <div class="application-card">
                        <div class="application-header">
                            <h3>${app.job_title}</h3>
                            <span class="application-status status-${app.status}">${this.getStatusText(app.status)}</span>
                        </div>
                        <div class="application-details">
                            <p><strong>Empresa:</strong> ${app.company_name}</p>
                            <p><strong>Localização:</strong> ${app.location}</p>
                            <p><strong>Data da candidatura:</strong> ${new Date(app.applied_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div class="application-footer">
                            <button class="btn btn-outline btn-sm" onclick="this.viewJobDetails(${app.job_id})">
                                Ver Vaga
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendente',
            'reviewing': 'Em análise',
            'interview': 'Entrevista',
            'accepted': 'Aceito',
            'rejected': 'Rejeitado'
        };
        return statusMap[status] || 'Pendente';
    }

    async previewProfile() {
        try {
            const profile = await window.apiService.getProfile();
            const user = window.authManager.currentUser;
            
            // Create modal for profile preview
            const modal = document.createElement('div');
            modal.className = 'profile-preview-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;
            
            const content = document.createElement('div');
            content.className = 'profile-preview-content';
            content.style.cssText = `
                background: white;
                border-radius: 0.75rem;
                padding: 2rem;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
            `;
            
            if (user.type === 'candidate') {
                content.innerHTML = this.renderCandidatePreview(profile, user);
            } else {
                content.innerHTML = this.renderCompanyPreview(profile, user);
            }
            
            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = `
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
            `;
            closeBtn.onclick = () => document.body.removeChild(modal);
            
            content.appendChild(closeBtn);
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            // Close on background click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            };
            
        } catch (error) {
            alert('Erro ao carregar visualização do perfil');
        }
    }

    renderCandidatePreview(profile, user) {
        return `
            <div class="profile-preview">
                <div class="profile-header">
                    <img src="${user.avatar}" alt="${user.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
                    <div style="margin-left: 1rem;">
                        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600;">${this.formatName(user.name)}</h2>
                        <p style="margin: 0.25rem 0; color: #6b7280;">${profile.age ? profile.age + ' anos' : ''} ${profile.location ? '• ' + profile.location : ''}</p>
                        <p style="margin: 0.25rem 0; color: #6b7280;">${user.email}</p>
                    </div>
                </div>
                
                ${profile.bio ? `
                    <div style="margin: 1.5rem 0;">
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem; font-weight: 600;">Sobre</h3>
                        <p style="margin: 0; color: #374151; line-height: 1.6;">${profile.bio}</p>
                    </div>
                ` : ''}
                
                ${profile.skills && profile.skills.length > 0 ? `
                    <div style="margin: 1.5rem 0;">
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem; font-weight: 600;">Habilidades</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${profile.skills.map(skill => `
                                <span style="background: #e0e7ff; color: #3730a3; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${profile.experience && profile.experience.length > 0 ? `
                    <div style="margin: 1.5rem 0;">
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem; font-weight: 600;">Experiência</h3>
                        ${profile.experience.map(exp => `
                            <p style="margin: 0.5rem 0; color: #374151;">${exp}</p>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div style="margin: 1.5rem 0;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem; font-weight: 600;">Links</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
                        ${profile.linkedin ? `<a href="${profile.linkedin}" target="_blank" style="color: #0066cc; text-decoration: none;">LinkedIn</a>` : ''}
                        ${profile.portfolio ? `<a href="${profile.portfolio}" target="_blank" style="color: #0066cc; text-decoration: none;">Portfólio</a>` : ''}
                        ${profile.github ? `<a href="${profile.github}" target="_blank" style="color: #0066cc; text-decoration: none;">GitHub</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderCompanyPreview(profile, user) {
        return `
            <div class="profile-preview">
                <div class="profile-header">
                    <img src="${user.avatar}" alt="${profile.company_name || user.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
                    <div style="margin-left: 1rem;">
                        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600;">${profile.company_name || user.name}</h2>
                        <p style="margin: 0.25rem 0; color: #6b7280;">${profile.industry || ''} ${profile.size ? '• ' + profile.size + ' funcionários' : ''}</p>
                        <p style="margin: 0.25rem 0; color: #6b7280;">${profile.location || ''}</p>
                    </div>
                </div>
                
                ${profile.description ? `
                    <div style="margin: 1.5rem 0;">
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem; font-weight: 600;">Sobre a Empresa</h3>
                        <p style="margin: 0; color: #374151; line-height: 1.6;">${profile.description}</p>
                    </div>
                ` : ''}
                
                <div style="margin: 1.5rem 0;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem; font-weight: 600;">Contato</h3>
                    <p style="margin: 0.25rem 0; color: #374151;">Responsável: ${this.formatName(user.name)}</p>
                    <p style="margin: 0.25rem 0; color: #374151;">Email: ${user.email}</p>
                    ${profile.company_phone ? `<p style="margin: 0.25rem 0; color: #374151;">Telefone: ${profile.company_phone}</p>` : ''}
                </div>
                
                <div style="margin: 1.5rem 0;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem; font-weight: 600;">Links</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
                        ${profile.website ? `<a href="${profile.website}" target="_blank" style="color: #0066cc; text-decoration: none;">Website</a>` : ''}
                        ${profile.linkedin ? `<a href="${profile.linkedin}" target="_blank" style="color: #0066cc; text-decoration: none;">LinkedIn</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

