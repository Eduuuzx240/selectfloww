renderCandidatesView(container) {
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
                <h1 class="dashboard-title">Candidatos</h1>
                <p class="dashboard-subtitle">Candidatos que se aplicaram às suas vagas</p>
            </div>
            <div id="candidates-content">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
                <p>Carregando candidatos...</p>
            </div>
        `;

        this.loadCandidates();
    }

    async loadCandidates() {
        const content = document.getElementById('candidates-content');
        try {
            const applications = await window.apiService.getApplications();
            this.renderCandidatesList(applications);
        } catch (error) {
            console.error('Error loading candidates:', error);
            content.innerHTML = `
                <div class="error-message">
                    <p>Erro ao carregar candidatos: ${error.message}</p>
                    <button class="btn btn-primary" onclick="window.dashboardManager.loadCandidates()">Tentar novamente</button>
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
                    <div class="job-meta"><b>Empresa:</b> ${job.company || 'Empresa'}</div>
                    <div class="job-meta"><b>Local:</b> ${job.location} | <b>Tipo:</b> ${job.workLocation}</div>
                    <div class="job-meta"><b>Salário:</b> ${job.salary || 'Não informado'}</div>
                    <div class="job-desc">${job.description}</div>
                    <button class="btn-apply" onclick="window.dashboardManager.openJobModal(${job.id}, 'candidate')">Ver detalhes</button>
                    <div class="job-date">Publicado em: ${job.postedAt}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading jobs:', error);
            content.innerHTML = '<p>Erro ao carregar vagas.</p>';
        }
    }

    openJobModal(jobId, userType) {
        // Find the job in the rendered list
        let jobDiv;
        if (userType === 'company') {
            jobDiv = document.querySelector(`#company-jobs-content .job-item[data-job-id="${jobId}"]`);
        } else {
            jobDiv = document.querySelector(`#candidate-jobs-content .job-item[data-job-id="${jobId}"]`);
        }
        
        if (!jobDiv) return;
        
        // Get job data from DOM
        const title = jobDiv.querySelector('h4').textContent;
        const meta = jobDiv.querySelectorAll('.job-meta');
        const description = jobDiv.querySelector('.job-desc') ? jobDiv.querySelector('.job-desc').textContent : '';
        const date = jobDiv.querySelector('.job-date').textContent;
        
        let empresa = '';
        if (userType === 'candidate') {
            empresa = meta[0].textContent;
        }
        
        // Create modal
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