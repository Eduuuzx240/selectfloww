@@ .. @@
     async renderApplicationsView(container) {
        const user = window.authManager.currentUser;
        if (user.type !== 'company') {
            container.innerHTML = `
                <div class="dashboard-header">
                    <h1 class="dashboard-title">Acesso Negado</h1>
                    <p class="dashboard-subtitle">Apenas empresas podem ver candidatos</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
             <div class="dashboard-header">
                 <h1 class="dashboard-title">Minhas Candidaturas</h1>
                <p class="dashboard-subtitle">Candidatos que se aplicaram às suas vagas</p>
             </div>
            <div id="candidates-content">
                <div class="spinner"></div>
                <p>Carregando candidatos...</p>
             </div>
         `;

        try {
            const applications = await window.apiService.getApplications();
            this.renderCandidatesList(applications);
        } catch (error) {
            console.error('Error loading candidates:', error);
            document.getElementById('candidates-content').innerHTML = `
                <div class="error-message">
                    <p>Erro ao carregar candidatos: ${error.message}</p>
                    <button class="btn btn-primary" onclick="window.dashboardManager.renderCandidatesView(document.getElementById('main-content'))">Tentar novamente</button>
                </div>
            `;
        }
    }

    renderCandidatesList(applications) {
        const content = document.getElementById('candidates-content');
        
        if (!applications || applications.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhum candidato encontrado</h3>
                    <p>Ainda não há candidatos para suas vagas.</p>
                    <button class="btn btn-primary" onclick="window.dashboardManager.setActiveTab('jobs')">
                        Ver Vagas
                    </button>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div class="candidates-grid">
                ${applications.map(app => `
                    <div class="candidate-card">
                        <div class="candidate-header">
                            <div class="candidate-info">
                                <h3>${app.candidateName}</h3>
                                <p class="candidate-email">${app.candidateEmail}</p>
                            </div>
                            <span class="application-status status-${app.status}">${this.getStatusText(app.status)}</span>
                        </div>
                        <div class="candidate-details">
                            <p><strong>Vaga:</strong> ${app.jobTitle}</p>
                            <p><strong>Localização:</strong> ${app.location}</p>
                            <p><strong>Estágio atual:</strong> ${this.getStageText(app.currentStage)}</p>
                            <p><strong>Data da candidatura:</strong> ${new Date(app.appliedAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div class="candidate-actions">
                            <button class="btn btn-outline btn-sm" onclick="window.dashboardManager.viewCandidateProfile(${app.candidateId})">
                                Ver Perfil
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="window.dashboardManager.updateApplicationStatus(${app.id}, '${app.status}')">
                                Atualizar Status
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getStageText(stage) {
        const stageMap = {
            'resume_analysis': 'Análise de Currículo',
            'technical_test': 'Teste Técnico',
            'group_dynamics': 'Dinâmica em Grupo',
            'interview': 'Entrevista',
            'reference_check': 'Verificação de Referências',
            'final_interview': 'Entrevista Final',
            'hired': 'Contratado'
        };
        return stageMap[stage] || 'Análise de Currículo';
    }

    viewCandidateProfile(candidateId) {
        alert(`Visualizar perfil do candidato ID: ${candidateId}`);
    }

    updateApplicationStatus(applicationId, currentStatus) {
        alert(`Atualizar status da candidatura ID: ${applicationId} (Status atual: ${currentStatus})`);
         try {
             const applications = await window.apiService.getApplications();
            this.renderApplicationsList(applications);
        } catch (error) {
            console.error('Error loading applications:', error);
            document.getElementById('applications-content').innerHTML = `
                <div class="error-message">
                    <p>Erro ao carregar candidaturas: ${error.message}</p>
                    <button class="btn btn-primary" onclick="window.dashboardManager.renderApplicationsView(document.getElementById('main-content'))">Tentar novamente</button>
                </div>
            `;
        }
    }

    async renderProfileView(container, user) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">${user.type === 'company' ? 'Perfil da Empresa' : 'Meu Perfil'}</h1>
                <p class="dashboard-subtitle">Mantenha suas informações atualizadas</p>

    renderApplicationsList(applications) {
        const content = document.getElementById('applications-content');
        
        if (!applications || applications.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhuma candidatura encontrada</h3>
                        <div class="application-details">
                            <p><strong>Empresa:</strong> ${app.company}</p>
                            <p><strong>Localização:</strong> ${app.location}</p>
                            <p><strong>Salário:</strong> ${app.salary || 'Não informado'}</p>
                            <p><strong>Data da candidatura:</strong> ${new Date(app.appliedAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div class="application-footer">
                            <button class="btn btn-outline btn-sm" onclick="window.dashboardManager.viewJobDetails(${app.jobId})">
                                Ver Vaga
                            </button>
                        </div>
        return statusMap[status] || 'Pendente';
    }

    viewJobDetails(jobId) {
        // For now, just show an alert. In a real app, this would open a job details modal
        alert(`Visualizar detalhes da vaga ID: ${jobId}`);
    }

    async previewProfile() {

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
                    <div class="job-meta"><b>Empresa:</b> ${job.company || 'Empresa'}</div>
                    <div class="job-meta"><b>Local:</b> ${job.location} | <b>Tipo:</b> ${job.workLocation}</div>
                    <div class="job-meta"><b>Salário:</b> ${job.salary || 'Não informado'}</div>
                    <div class="job-desc">${job.description}</div>
                    <button class="btn-apply" onclick="window.dashboardManager.openJobModal(${job.id}, 'candidate')">Ver detalhes</button>
                    <div class="job-date">Publicado em: ${job.postedAt}</div>
                </div>

    openJobModal(jobId, userType) {
        // Busca o job na lista renderizada
        let jobDiv;
        if (userType === 'company') {
            jobDiv = document.querySelector(`#company-jobs-content .job-item[data-job-id="${jobId}"]`);
        } else {
            jobDiv = document.querySelector(`#candidate-jobs-content .job-item[data-job-id="${jobId}"]`);
        }
        
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
                <h3>${title}</h3>
                ${userType === 'candidate' ? `<p>${empresa}</p>` : ''}
                <p>${meta[userType === 'candidate' ? 1 : 0].textContent}</p>
                <p>${meta[userType === 'candidate' ? 2 : 1].textContent}</p>
                <p>${description}</p>
                <p>${date}</p>
                ${userType === 'candidate' ? `<button class='btn-apply' onclick='window.dashboardManager.applyToJob(${jobId}, this)'>Candidatar-se</button><span class="apply-message" style="margin-left:10px;font-size:0.95em;"></span>` : ''}
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }