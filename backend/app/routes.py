@@ .. @@
 @main.route('/api/applications', methods=['GET'])
 def get_applications():
     if 'user_id' not in session:
         return jsonify({'error': 'Não autenticado'}), 401
     
-    if session.get('user_type') != 'candidate':
-        return jsonify({'error': 'Apenas candidatos podem ver candidaturas'}), 403
-    
     conn = get_db_connection()
     
     try:
-        applications = conn.execute("""
-            SELECT 
-                a.id,
-                a.job_id,
-                a.status,
-                a.current_stage,
-                a.submitted_at,
-                j.title as job_title,
-                j.location,
-                j.salary,
-                cp.company_name
-            FROM applications a
-            JOIN jobs j ON a.job_id = j.id
-            JOIN company_profiles cp ON j.company_id = cp.user_id
-            WHERE a.candidate_id = ?
-            ORDER BY a.submitted_at DESC
-        """, (session['user_id'],)).fetchall()
+        if session.get('user_type') == 'candidate':
+            # Get applications for candidate
+            applications = conn.execute("""
+                SELECT 
+                    a.id,
+                    a.job_id,
+                    a.status,
+                    a.current_stage,
+                    a.submitted_at,
+                    j.title as job_title,
+                    j.location,
+                    j.salary,
+                    cp.company_name
+                FROM applications a
+                JOIN jobs j ON a.job_id = j.id
+                JOIN company_profiles cp ON j.company_id = cp.user_id
+                WHERE a.candidate_id = ?
+                ORDER BY a.submitted_at DESC
+            """, (session['user_id'],)).fetchall()
+        else:
+            # Get applications for company jobs
+            applications = conn.execute("""
+                SELECT 
+                    a.id,
+                    a.job_id,
+                    a.candidate_id,
+                    a.status,
+                    a.current_stage,
+                    a.submitted_at,
+                    j.title as job_title,
+                    j.location,
+                    j.salary,
+                    u.nome as candidate_name,
+                    u.email as candidate_email
+                FROM applications a
+                JOIN jobs j ON a.job_id = j.id
+                JOIN usuarios u ON a.candidate_id = u.id
+                WHERE j.company_id = ?
+                ORDER BY a.submitted_at DESC
+            """, (session['user_id'],)).fetchall()
         
         applications_list = []
         for app in applications:
-            applications_list.append({
-                'id': app['id'],
-                'jobId': app['job_id'],
-                'jobTitle': app['job_title'],
-                'company': app['company_name'],
-                'location': app['location'],
-                'salary': app['salary'],
-                'status': app['status'],
-                'currentStage': app['current_stage'],
-                'appliedAt': app['submitted_at']
-            })
+            if session.get('user_type') == 'candidate':
+                applications_list.append({
+                    'id': app['id'],
+                    'jobId': app['job_id'],
+                    'jobTitle': app['job_title'],
+                    'company': app['company_name'],
+                    'location': app['location'],
+                    'salary': app['salary'],
+                    'status': app['status'],
+                    'currentStage': app['current_stage'],
+                    'appliedAt': app['submitted_at']
+                })
+            else:
+                applications_list.append({
+                    'id': app['id'],
+                    'jobId': app['job_id'],
+                    'candidateId': app['candidate_id'],
+                    'jobTitle': app['job_title'],
+                    'candidateName': app['candidate_name'],
+                    'candidateEmail': app['candidate_email'],
+                    'location': app['location'],
+                    'salary': app['salary'],
+                    'status': app['status'],
+                    'currentStage': app['current_stage'],
+                    'appliedAt': app['submitted_at']
+                })
         
         return jsonify(applications_list)