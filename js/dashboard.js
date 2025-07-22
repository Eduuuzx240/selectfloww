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
-            // Debugging: Check if apiService and getApplications are defined
-            if (typeof window.apiService === 'undefined' || typeof window.apiService.getApplications !== 'function') {
-                throw new Error('apiService or getApplications is not defined');
-            }
-
             const applications = await window.apiService.getApplications();
-            this.renderApplicationsList(applications || []);
+            this.renderApplicationsList(applications);
         } catch (error) {
             console.error('Error loading applications:', error);
             document.getElementById('applications-content').innerHTML = `
                 <div class="error-message">
-                    <p>Erro ao carregar candidaturas</p>
-                    <button onclick="window.dashboardManager.renderApplicationsView(this.parentElement)">Tentar novamente</button>
+                    <p>Erro ao carregar candidaturas: ${error.message}</p>
+                    <button class="btn btn-primary" onclick="window.dashboardManager.renderApplicationsView(document.getElementById('main-content'))">Tentar novamente</button>
                 </div>
             `;
         }
     }
@@ .. @@
     async renderProfileView(container, user) {
-        container.innerHTML = `        this.renderApplicationsList(applications);
-
+        container.innerHTML = `
             <div class="dashboard-header">
                 <h1 class="dashboard-title">${user.type === 'company' ? 'Perfil da Empresa' : 'Meu Perfil'}</h1>
                 <p class="dashboard-subtitle">Mantenha suas informações atualizadas</p>
@@ .. @@
     renderApplicationsList(applications) {
         const content = document.getElementById('applications-content');
         
-        if (applications.length === 0) {
+        if (!applications || applications.length === 0) {
             content.innerHTML = `
                 <div class="empty-state">
                     <h3>Nenhuma candidatura encontrada</h3>
@@ .. @@
                         <div class="application-details">
                             <p><strong>Empresa:</strong> ${app.company}</p>
                             <p><strong>Localização:</strong> ${app.location}</p>
-                            <p><strong>Data da candidatura:</strong> ${new Date(app.applied_at).toLocaleDateString('pt-BR')}</p>
+                            <p><strong>Salário:</strong> ${app.salary || 'Não informado'}</p>
+                            <p><strong>Data da candidatura:</strong> ${new Date(app.appliedAt).toLocaleDateString('pt-BR')}</p>
                         </div>
                         <div class="application-footer">
-                            <button class="btn btn-outline btn-sm" onclick="this.viewJobDetails(${app.job_id})">
+                            <button class="btn btn-outline btn-sm" onclick="window.dashboardManager.viewJobDetails(${app.jobId})">
                                 Ver Vaga
                             </button>
                         </div>
@@ .. @@
         return statusMap[status] || 'Pendente';
     }
 
+    viewJobDetails(jobId) {
+        // For now, just show an alert. In a real app, this would open a job details modal
+        alert(`Visualizar detalhes da vaga ID: ${jobId}`);
+    }
+
     async previewProfile() {