// Initialize all managers and start the application
document.addEventListener('DOMContentLoaded', () => {
    // Create global instances
    window.apiService = new ApiService();
    window.authManager = new AuthManager();
    window.dashboardManager = new DashboardManager();
    window.app = new App();
});

