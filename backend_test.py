#!/usr/bin/env python3
"""
Comprehensive backend test for Fast Chiptuningfiles API
Tests all endpoints according to the review request flow
"""

import requests
import json
import time
import os
import tempfile
from pathlib import Path

# Get backend URL from frontend .env
def get_backend_url():
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    return line.split("=", 1)[1].strip()
    return "http://localhost:8001"

BASE_URL = get_backend_url() + "/api"
print(f"Testing backend at: {BASE_URL}")

# Test results tracking
test_results = []
failed_tests = []

def log_test(test_name, success, details=""):
    """Log test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details:
        print(f"   Details: {details}")
    test_results.append({
        "test": test_name,
        "success": success,
        "details": details
    })
    if not success:
        failed_tests.append(f"{test_name}: {details}")

def create_test_file():
    """Create a small test file for upload"""
    with tempfile.NamedTemporaryFile(delete=False, suffix='.bin') as f:
        f.write(b"Test ECU file content for chiptuning")
        return f.name

# Global variables for test data
customer_token = None
customer_id = None
customer_email = None
admin_token = None
admin_id = None
file_id = None
second_customer_token = None
second_customer_id = None

def test_customer_auth():
    """Test 1: Customer Authentication Flow"""
    global customer_token, customer_id, customer_email
    
    # Generate unique email with timestamp
    timestamp = str(int(time.time()))
    customer_email = f"test+{timestamp}@example.com"
    password = "testpass123"
    
    print("\n=== Testing Customer Authentication ===")
    
    # 1.1 Register new customer
    register_data = {
        "email": customer_email,
        "password": password,
        "firstName": "Test",
        "lastName": "Customer"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code == 200:
            data = response.json()
            customer_token = data.get("token")
            customer_id = data.get("user", {}).get("id")
            is_admin = data.get("user", {}).get("is_admin", True)
            
            if customer_token and customer_id and not is_admin:
                log_test("Customer registration", True, f"User ID: {customer_id}")
            else:
                log_test("Customer registration", False, f"Missing token/ID or is_admin=true: {data}")
        else:
            log_test("Customer registration", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Customer registration", False, f"Exception: {str(e)}")
    
    # 1.2 Login with same credentials
    try:
        login_data = {"email": customer_email, "password": password}
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            if token:
                log_test("Customer login", True)
                customer_token = token  # Update token
            else:
                log_test("Customer login", False, f"No token in response: {data}")
        else:
            log_test("Customer login", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Customer login", False, f"Exception: {str(e)}")
    
    # 1.3 Get user profile
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == customer_email:
                log_test("Get user profile", True)
            else:
                log_test("Get user profile", False, f"Email mismatch: {data}")
        else:
            log_test("Get user profile", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Get user profile", False, f"Exception: {str(e)}")
    
    # 1.4 Update profile
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        update_data = {"firstName": "Updated"}
        response = requests.patch(f"{BASE_URL}/auth/me", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("firstName") == "Updated":
                log_test("Update profile", True)
            else:
                log_test("Update profile", False, f"firstName not updated: {data}")
        else:
            log_test("Update profile", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Update profile", False, f"Exception: {str(e)}")
    
    # 1.5 Change password
    new_password = "newpass123"
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        change_data = {"currentPassword": password, "newPassword": new_password}
        response = requests.post(f"{BASE_URL}/auth/change-password", json=change_data, headers=headers)
        if response.status_code == 200:
            log_test("Change password", True)
            
            # Test login with new password
            login_data = {"email": customer_email, "password": new_password}
            response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                customer_token = data.get("token")  # Update token
                log_test("Login with new password", True)
            else:
                log_test("Login with new password", False, f"Status: {response.status_code}")
        else:
            log_test("Change password", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Change password", False, f"Exception: {str(e)}")
    
    # 1.6 Test duplicate email registration
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code == 400:
            log_test("Duplicate email registration fails", True)
        else:
            log_test("Duplicate email registration fails", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("Duplicate email registration fails", False, f"Exception: {str(e)}")
    
    # 1.7 Test wrong password login
    try:
        login_data = {"email": customer_email, "password": "wrongpassword"}
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 401:
            log_test("Wrong password login fails", True)
        else:
            log_test("Wrong password login fails", False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        log_test("Wrong password login fails", False, f"Exception: {str(e)}")

def test_admin_auth():
    """Test 2: Admin Authentication Flow"""
    global admin_token, admin_id
    
    print("\n=== Testing Admin Authentication ===")
    
    # 2.1 Admin login
    try:
        login_data = {"email": "admin@fast-chiptuningfiles.com", "password": "admin1234"}
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            admin_token = data.get("token")
            admin_id = data.get("user", {}).get("id")
            is_admin = data.get("user", {}).get("is_admin", False)
            
            if admin_token and is_admin:
                log_test("Admin login", True, f"Admin ID: {admin_id}")
            else:
                log_test("Admin login", False, f"Missing token or is_admin=false: {data}")
        else:
            log_test("Admin login", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Admin login", False, f"Exception: {str(e)}")
    
    # 2.2 Get admin profile
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("is_admin"):
                log_test("Get admin profile", True)
            else:
                log_test("Get admin profile", False, f"is_admin=false: {data}")
        else:
            log_test("Get admin profile", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Get admin profile", False, f"Exception: {str(e)}")

def test_credits_flow():
    """Test 3: Credits Flow"""
    print("\n=== Testing Credits Flow ===")
    
    # 3.1 Get credit packages
    try:
        response = requests.get(f"{BASE_URL}/credits/packages")
        if response.status_code == 200:
            packages = response.json()
            if len(packages) == 5:
                log_test("Get credit packages", True, f"Found {len(packages)} packages")
            else:
                log_test("Get credit packages", False, f"Expected 5 packages, got {len(packages)}")
        else:
            log_test("Get credit packages", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Get credit packages", False, f"Exception: {str(e)}")
    
    # 3.2 Purchase credits
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        purchase_data = {"packageId": "pkg_25"}
        response = requests.post(f"{BASE_URL}/credits/purchase", json=purchase_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            user_credits = data.get("user", {}).get("credits", 0)
            transaction = data.get("transaction")
            if user_credits >= 25 and transaction:
                log_test("Purchase credits", True, f"User now has {user_credits} credits")
            else:
                log_test("Purchase credits", False, f"Credits not incremented or no transaction: {data}")
        else:
            log_test("Purchase credits", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Purchase credits", False, f"Exception: {str(e)}")
    
    # 3.3 Purchase with invalid package
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        purchase_data = {"packageId": "invalid_pkg"}
        response = requests.post(f"{BASE_URL}/credits/purchase", json=purchase_data, headers=headers)
        if response.status_code == 400:
            log_test("Invalid package purchase fails", True)
        else:
            log_test("Invalid package purchase fails", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("Invalid package purchase fails", False, f"Exception: {str(e)}")
    
    # 3.4 Get transactions
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/credits/transactions", headers=headers)
        if response.status_code == 200:
            transactions = response.json()
            if len(transactions) > 0:
                log_test("Get transactions", True, f"Found {len(transactions)} transactions")
            else:
                log_test("Get transactions", False, "No transactions found")
        else:
            log_test("Get transactions", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Get transactions", False, f"Exception: {str(e)}")

def test_file_upload_flow():
    """Test 4: File Upload Flow"""
    global file_id
    
    print("\n=== Testing File Upload Flow ===")
    
    # 4.1 Upload file
    test_file_path = create_test_file()
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test_ecu.bin', f, 'application/octet-stream')}
            data = {
                'vehicle': 'Test Car 2.0 (2020)',
                'ecu': 'Bosch EDC17',
                'tuningOptions': 'Stage 1,EGR Off',
                'credits': 8,
                'note': 'test upload'
            }
            response = requests.post(f"{BASE_URL}/files", files=files, data=data, headers=headers)
        
        if response.status_code == 200:
            file_data = response.json()
            file_id = file_data.get("id")
            status = file_data.get("status")
            has_original = file_data.get("hasOriginal")
            has_tuned = file_data.get("hasTuned")
            
            if file_id and status == "pending" and has_original and not has_tuned:
                log_test("File upload", True, f"File ID: {file_id}")
            else:
                log_test("File upload", False, f"Unexpected response: {file_data}")
        else:
            log_test("File upload", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("File upload", False, f"Exception: {str(e)}")
    finally:
        os.unlink(test_file_path)
    
    # 4.2 Check credits deducted
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            credits = data.get("credits", 0)
            # Should be 25 - 8 = 17
            if credits == 17:
                log_test("Credits deducted correctly", True, f"Credits: {credits}")
            else:
                log_test("Credits deducted correctly", False, f"Expected 17 credits, got {credits}")
        else:
            log_test("Credits deducted correctly", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Credits deducted correctly", False, f"Exception: {str(e)}")
    
    # 4.3 Get files list
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/files", headers=headers)
        if response.status_code == 200:
            files = response.json()
            if len(files) > 0 and any(f.get("id") == file_id for f in files):
                log_test("Get files list", True, f"Found {len(files)} files")
            else:
                log_test("Get files list", False, f"Uploaded file not in list: {files}")
        else:
            log_test("Get files list", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Get files list", False, f"Exception: {str(e)}")
    
    # 4.4 Get file details
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/files/{file_id}", headers=headers)
        if response.status_code == 200:
            file_data = response.json()
            if file_data.get("id") == file_id:
                log_test("Get file details", True)
            else:
                log_test("Get file details", False, f"File ID mismatch: {file_data}")
        else:
            log_test("Get file details", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Get file details", False, f"Exception: {str(e)}")
    
    # 4.5 Download original file
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/files/{file_id}/download/original", headers=headers)
        if response.status_code == 200:
            content = response.content
            if len(content) > 0:
                log_test("Download original file", True, f"Downloaded {len(content)} bytes")
            else:
                log_test("Download original file", False, "Empty file content")
        else:
            log_test("Download original file", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Download original file", False, f"Exception: {str(e)}")
    
    # 4.6 Try download tuned file (should fail)
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/files/{file_id}/download/tuned", headers=headers)
        if response.status_code == 404:
            log_test("Download tuned file (not available)", True)
        else:
            log_test("Download tuned file (not available)", False, f"Expected 404, got {response.status_code}")
    except Exception as e:
        log_test("Download tuned file (not available)", False, f"Exception: {str(e)}")
    
    # 4.7 Try upload with insufficient credits
    test_file_path = create_test_file()
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test_ecu2.bin', f, 'application/octet-stream')}
            data = {
                'vehicle': 'Test Car 3.0 (2021)',
                'ecu': 'Bosch EDC17',
                'tuningOptions': 'Stage 2',
                'credits': 9999,  # More than available
                'note': 'insufficient credits test'
            }
            response = requests.post(f"{BASE_URL}/files", files=files, data=data, headers=headers)
        
        if response.status_code == 400:
            log_test("Upload with insufficient credits fails", True)
        else:
            log_test("Upload with insufficient credits fails", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("Upload with insufficient credits fails", False, f"Exception: {str(e)}")
    finally:
        os.unlink(test_file_path)

def test_chat_flow():
    """Test 5: Chat Flow"""
    print("\n=== Testing Chat Flow ===")
    
    # 5.1 Post message as customer
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        message_data = {"content": "Hello support, please help with my file"}
        response = requests.post(f"{BASE_URL}/files/{file_id}/messages", json=message_data, headers=headers)
        if response.status_code == 200:
            message = response.json()
            if message.get("senderRole") == "user" and message.get("content") == message_data["content"]:
                log_test("Post customer message", True)
            else:
                log_test("Post customer message", False, f"Unexpected message data: {message}")
        else:
            log_test("Post customer message", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Post customer message", False, f"Exception: {str(e)}")
    
    # 5.2 Get messages
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/files/{file_id}/messages", headers=headers)
        if response.status_code == 200:
            messages = response.json()
            if len(messages) > 0:
                log_test("Get messages", True, f"Found {len(messages)} messages")
            else:
                log_test("Get messages", False, "No messages found")
        else:
            log_test("Get messages", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Get messages", False, f"Exception: {str(e)}")

def test_notifications():
    """Test 6: Notifications"""
    print("\n=== Testing Notifications ===")
    
    # 6.1 Get notifications
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/notifications", headers=headers)
        if response.status_code == 200:
            notifications = response.json()
            log_test("Get notifications", True, f"Found {len(notifications)} notifications")
        else:
            log_test("Get notifications", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Get notifications", False, f"Exception: {str(e)}")

def test_admin_operations():
    """Test 7: Admin Operations"""
    print("\n=== Testing Admin Operations ===")
    
    # 7.1 Get all users
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
        if response.status_code == 200:
            users = response.json()
            if len(users) >= 2:  # At least admin and customer
                log_test("Admin get users", True, f"Found {len(users)} users")
            else:
                log_test("Admin get users", False, f"Expected at least 2 users, got {len(users)}")
        else:
            log_test("Admin get users", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Admin get users", False, f"Exception: {str(e)}")
    
    # 7.2 Get all files
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/files", headers=headers)
        if response.status_code == 200:
            files = response.json()
            if len(files) > 0:
                log_test("Admin get files", True, f"Found {len(files)} files")
            else:
                log_test("Admin get files", False, "No files found")
        else:
            log_test("Admin get files", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Admin get files", False, f"Exception: {str(e)}")
    
    # 7.3 Get files with status filter
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/files?status_filter=pending", headers=headers)
        if response.status_code == 200:
            files = response.json()
            log_test("Admin get files with filter", True, f"Found {len(files)} pending files")
        else:
            log_test("Admin get files with filter", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Admin get files with filter", False, f"Exception: {str(e)}")
    
    # 7.4 Get admin stats
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
        if response.status_code == 200:
            stats = response.json()
            if "totalUsers" in stats and "totalFiles" in stats:
                log_test("Admin get stats", True, f"Stats: {stats}")
            else:
                log_test("Admin get stats", False, f"Missing stats fields: {stats}")
        else:
            log_test("Admin get stats", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Admin get stats", False, f"Exception: {str(e)}")
    
    # 7.5 Adjust customer credits
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        adjust_data = {"amount": 10, "reason": "test bonus"}
        response = requests.patch(f"{BASE_URL}/admin/users/{customer_id}/credits", json=adjust_data, headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            credits = user_data.get("credits", 0)
            if credits == 27:  # 17 + 10
                log_test("Admin adjust credits", True, f"Credits now: {credits}")
            else:
                log_test("Admin adjust credits", False, f"Expected 27 credits, got {credits}")
        else:
            log_test("Admin adjust credits", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Admin adjust credits", False, f"Exception: {str(e)}")
    
    # 7.6 Update file status
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        status_data = {"status": "in_progress"}
        response = requests.patch(f"{BASE_URL}/admin/files/{file_id}/status", json=status_data, headers=headers)
        if response.status_code == 200:
            file_data = response.json()
            if file_data.get("status") == "in_progress":
                log_test("Admin update file status", True)
            else:
                log_test("Admin update file status", False, f"Status not updated: {file_data}")
        else:
            log_test("Admin update file status", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Admin update file status", False, f"Exception: {str(e)}")
    
    # 7.7 Try invalid status
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        status_data = {"status": "invalid_status"}
        response = requests.patch(f"{BASE_URL}/admin/files/{file_id}/status", json=status_data, headers=headers)
        if response.status_code == 400:
            log_test("Admin invalid status fails", True)
        else:
            log_test("Admin invalid status fails", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("Admin invalid status fails", False, f"Exception: {str(e)}")
    
    # 7.8 Upload tuned file
    test_file_path = create_test_file()
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        with open(test_file_path, 'rb') as f:
            files = {'file': ('tuned_ecu.bin', f, 'application/octet-stream')}
            response = requests.post(f"{BASE_URL}/admin/files/{file_id}/upload-tuned", files=files, headers=headers)
        
        if response.status_code == 200:
            file_data = response.json()
            status = file_data.get("status")
            has_tuned = file_data.get("hasTuned")
            tuned_filename = file_data.get("tunedFileName")
            
            if status == "completed" and has_tuned and tuned_filename:
                log_test("Admin upload tuned file", True)
            else:
                log_test("Admin upload tuned file", False, f"Unexpected response: {file_data}")
        else:
            log_test("Admin upload tuned file", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Admin upload tuned file", False, f"Exception: {str(e)}")
    finally:
        os.unlink(test_file_path)
    
    # 7.9 Post admin message
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        message_data = {"content": "Your tuned file is ready for download!"}
        response = requests.post(f"{BASE_URL}/files/{file_id}/messages", json=message_data, headers=headers)
        if response.status_code == 200:
            message = response.json()
            if message.get("senderRole") == "admin":
                log_test("Admin post message", True)
            else:
                log_test("Admin post message", False, f"Expected senderRole=admin: {message}")
        else:
            log_test("Admin post message", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Admin post message", False, f"Exception: {str(e)}")

def test_authorization_checks():
    """Test 8: Authorization Checks"""
    global second_customer_token, second_customer_id
    
    print("\n=== Testing Authorization Checks ===")
    
    # 8.1 Customer tries admin endpoint
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
        if response.status_code == 403:
            log_test("Customer blocked from admin endpoint", True)
        else:
            log_test("Customer blocked from admin endpoint", False, f"Expected 403, got {response.status_code}")
    except Exception as e:
        log_test("Customer blocked from admin endpoint", False, f"Exception: {str(e)}")
    
    # 8.2 Customer tries admin file status update
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        status_data = {"status": "completed"}
        response = requests.patch(f"{BASE_URL}/admin/files/{file_id}/status", json=status_data, headers=headers)
        if response.status_code == 403:
            log_test("Customer blocked from admin file update", True)
        else:
            log_test("Customer blocked from admin file update", False, f"Expected 403, got {response.status_code}")
    except Exception as e:
        log_test("Customer blocked from admin file update", False, f"Exception: {str(e)}")
    
    # 8.3 Register second customer
    timestamp = str(int(time.time()))
    second_email = f"test2+{timestamp}@example.com"
    register_data = {
        "email": second_email,
        "password": "testpass123",
        "firstName": "Second",
        "lastName": "Customer"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code == 200:
            data = response.json()
            second_customer_token = data.get("token")
            second_customer_id = data.get("user", {}).get("id")
            log_test("Register second customer", True)
        else:
            log_test("Register second customer", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Register second customer", False, f"Exception: {str(e)}")
    
    # 8.4 Second customer tries to access first customer's file
    try:
        headers = {"Authorization": f"Bearer {second_customer_token}"}
        response = requests.get(f"{BASE_URL}/files/{file_id}", headers=headers)
        if response.status_code in [403, 404]:
            log_test("Second customer blocked from other's file", True)
        else:
            log_test("Second customer blocked from other's file", False, f"Expected 403/404, got {response.status_code}")
    except Exception as e:
        log_test("Second customer blocked from other's file", False, f"Exception: {str(e)}")
    
    # 8.5 Second customer tries to download first customer's file
    try:
        headers = {"Authorization": f"Bearer {second_customer_token}"}
        response = requests.get(f"{BASE_URL}/files/{file_id}/download/original", headers=headers)
        if response.status_code == 403:
            log_test("Second customer blocked from download", True)
        else:
            log_test("Second customer blocked from download", False, f"Expected 403, got {response.status_code}")
    except Exception as e:
        log_test("Second customer blocked from download", False, f"Exception: {str(e)}")
    
    # 8.6 No token request
    try:
        response = requests.get(f"{BASE_URL}/auth/me")
        if response.status_code == 401:
            log_test("No token request fails", True)
        else:
            log_test("No token request fails", False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        log_test("No token request fails", False, f"Exception: {str(e)}")

def test_customer_download_tuned():
    """Test 9: Customer Downloads Tuned File"""
    print("\n=== Testing Customer Download Tuned File ===")
    
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/files/{file_id}/download/tuned", headers=headers)
        if response.status_code == 200:
            content = response.content
            if len(content) > 0:
                log_test("Customer download tuned file", True, f"Downloaded {len(content)} bytes")
            else:
                log_test("Customer download tuned file", False, "Empty file content")
        else:
            log_test("Customer download tuned file", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Customer download tuned file", False, f"Exception: {str(e)}")

def test_notifications_after_admin_actions():
    """Test 10: Notifications After Admin Actions"""
    print("\n=== Testing Notifications After Admin Actions ===")
    
    # 10.1 Customer notifications
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/notifications", headers=headers)
        if response.status_code == 200:
            notifications = response.json()
            status_changed = any(n.get("type") == "status_changed" for n in notifications)
            file_completed = any(n.get("type") == "file_completed" for n in notifications)
            
            if status_changed and file_completed:
                log_test("Customer notifications after admin actions", True, f"Found {len(notifications)} notifications")
            else:
                log_test("Customer notifications after admin actions", False, f"Missing expected notifications: {[n.get('type') for n in notifications]}")
        else:
            log_test("Customer notifications after admin actions", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Customer notifications after admin actions", False, f"Exception: {str(e)}")
    
    # 10.2 Mark all as read
    try:
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.post(f"{BASE_URL}/notifications/read-all", headers=headers)
        if response.status_code == 200:
            # Check if all are marked as read
            response = requests.get(f"{BASE_URL}/notifications", headers=headers)
            if response.status_code == 200:
                notifications = response.json()
                all_read = all(n.get("read", False) for n in notifications)
                if all_read:
                    log_test("Mark all notifications as read", True)
                else:
                    log_test("Mark all notifications as read", False, "Some notifications still unread")
            else:
                log_test("Mark all notifications as read", False, "Failed to verify read status")
        else:
            log_test("Mark all notifications as read", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Mark all notifications as read", False, f"Exception: {str(e)}")
    
    # 10.3 Admin notifications
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/notifications", headers=headers)
        if response.status_code == 200:
            notifications = response.json()
            new_file = any(n.get("type") == "new_file" for n in notifications)
            new_message = any(n.get("type") == "new_message" for n in notifications)
            
            if new_file and new_message:
                log_test("Admin notifications", True, f"Found {len(notifications)} notifications")
            else:
                log_test("Admin notifications", False, f"Missing expected notifications: {[n.get('type') for n in notifications]}")
        else:
            log_test("Admin notifications", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Admin notifications", False, f"Exception: {str(e)}")

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    total_tests = len(test_results)
    passed_tests = sum(1 for t in test_results if t["success"])
    failed_tests_count = total_tests - passed_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests_count}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if failed_tests:
        print("\nFAILED TESTS:")
        for failure in failed_tests:
            print(f"❌ {failure}")
    
    print("\nDETAILED RESULTS:")
    for result in test_results:
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        print(f"{status}: {result['test']}")
        if result["details"]:
            print(f"   {result['details']}")

if __name__ == "__main__":
    print("Starting Fast Chiptuningfiles Backend API Tests")
    print(f"Backend URL: {BASE_URL}")
    
    # Run all tests in order
    test_customer_auth()
    test_admin_auth()
    test_credits_flow()
    test_file_upload_flow()
    test_chat_flow()
    test_notifications()
    test_admin_operations()
    test_authorization_checks()
    test_customer_download_tuned()
    test_notifications_after_admin_actions()
    
    print_summary()