@@ .. @@
     async getJobs() {
         return this.request('/jobs');
     }
+
+    async getApplications() {
+        return this.request('/applications');
+    }

     async createJob(jobData) {
@@ .. @@
     async getTags() {
         return this.request('/tags');
     }
-}
-const baseURL = 'http://localhost:5000/api';
-
-// Função para buscar candidaturas
-async function fetchApplications() {
-    const response = await fetch(`${baseURL}/applications`);
-    if (!response.ok) {
-        throw new Error('Erro ao buscar candidaturas');
-    }
-    return await response.json();
 }