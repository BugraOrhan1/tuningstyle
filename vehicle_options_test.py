#!/usr/bin/env python3
"""
Vehicle and Options Endpoints Smoke Test
Tests the updated vehicle and options endpoints as per review request
"""

import requests
import json
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
print(f"Testing vehicle and options endpoints at: {BASE_URL}")

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

def test_vehicles_brands():
    """Test 1: GET /api/vehicles/brands"""
    print("\n=== Testing Vehicles Brands ===")
    
    try:
        response = requests.get(f"{BASE_URL}/vehicles/brands")
        if response.status_code == 200:
            brands = response.json()
            
            # Check if it returns 100+ brands
            if len(brands) >= 100:
                log_test("Brands count (100+)", True, f"Found {len(brands)} brands")
            else:
                log_test("Brands count (100+)", False, f"Expected 100+, got {len(brands)}")
            
            # Check for specific required brands
            required_brands = [
                'Audi', 'BMW', 'Volkswagen', 'Mercedes-Benz', 'Acura', 'Alpina', 
                'Aston Martin', 'BAIC', 'BYD', 'Bentley', 'Cadillac', 'DAF', 
                'Ferrari', 'Genesis', 'Iveco', 'John Deere', 'Lamborghini', 
                'Lexus', 'MAN Trucks', 'Maserati', 'McLaren', 'Massey Ferguson', 
                'Saab', 'Scania Trucks', 'Tesla', 'Volvo Trucks'
            ]
            
            missing_brands = [brand for brand in required_brands if brand not in brands]
            if not missing_brands:
                log_test("Required brands present", True, f"All {len(required_brands)} required brands found")
            else:
                log_test("Required brands present", False, f"Missing brands: {missing_brands}")
            
            # Check that "Otherwise, namely" is NOT in the brands list
            if "Otherwise, namely" not in brands:
                log_test("'Otherwise, namely' not in brands", True)
            else:
                log_test("'Otherwise, namely' not in brands", False, "'Otherwise, namely' found in brands list")
                
        else:
            log_test("Vehicles brands endpoint", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Vehicles brands endpoint", False, f"Exception: {str(e)}")

def test_vehicles_models():
    """Test 2: GET /api/vehicles/models"""
    print("\n=== Testing Vehicles Models ===")
    
    # Test Ferrari (should return only 'Otherwise, namely')
    try:
        response = requests.get(f"{BASE_URL}/vehicles/models?brand=Ferrari")
        if response.status_code == 200:
            models = response.json()
            if models == ['Otherwise, namely']:
                log_test("Ferrari models (Otherwise, namely only)", True)
            else:
                log_test("Ferrari models (Otherwise, namely only)", False, f"Expected ['Otherwise, namely'], got {models}")
        else:
            log_test("Ferrari models", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Ferrari models", False, f"Exception: {str(e)}")
    
    # Test BMW (should return BMW models PLUS "Otherwise, namely" at end)
    try:
        response = requests.get(f"{BASE_URL}/vehicles/models?brand=BMW")
        if response.status_code == 200:
            models = response.json()
            if len(models) > 1 and models[-1] == "Otherwise, namely":
                log_test("BMW models (with Otherwise, namely appended)", True, f"Found {len(models)} models")
            else:
                log_test("BMW models (with Otherwise, namely appended)", False, f"Expected multiple models with 'Otherwise, namely' at end, got {models}")
        else:
            log_test("BMW models", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("BMW models", False, f"Exception: {str(e)}")

def test_vehicles_generations():
    """Test 3: GET /api/vehicles/generations"""
    print("\n=== Testing Vehicles Generations ===")
    
    try:
        response = requests.get(f"{BASE_URL}/vehicles/generations?brand=Ferrari&model=Otherwise, namely")
        if response.status_code == 200:
            generations = response.json()
            if generations == ['Otherwise, namely']:
                log_test("Ferrari generations (Otherwise, namely)", True)
            else:
                log_test("Ferrari generations (Otherwise, namely)", False, f"Expected ['Otherwise, namely'], got {generations}")
        else:
            log_test("Ferrari generations", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Ferrari generations", False, f"Exception: {str(e)}")

def test_vehicles_engines():
    """Test 4: GET /api/vehicles/engines"""
    print("\n=== Testing Vehicles Engines ===")
    
    try:
        response = requests.get(f"{BASE_URL}/vehicles/engines?brand=Ferrari&model=Otherwise, namely&generation=Otherwise, namely")
        if response.status_code == 200:
            engines = response.json()
            if (len(engines) == 1 and 
                engines[0].get('name') == 'Otherwise, namely' and 
                engines[0].get('hp') == 0 and 
                engines[0].get('kw') == 0):
                log_test("Ferrari engines (Otherwise, namely with hp=0, kw=0)", True)
            else:
                log_test("Ferrari engines (Otherwise, namely with hp=0, kw=0)", False, f"Expected single engine with name='Otherwise, namely', hp=0, kw=0, got {engines}")
        else:
            log_test("Ferrari engines", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Ferrari engines", False, f"Exception: {str(e)}")

def test_options_tuning_types():
    """Test 5: GET /api/options/tuning-types"""
    print("\n=== Testing Options Tuning Types ===")
    
    try:
        response = requests.get(f"{BASE_URL}/options/tuning-types")
        if response.status_code == 200:
            tuning_types = response.json()
            
            # Should return 15 entries
            if len(tuning_types) == 15:
                log_test("Tuning types count (15)", True)
            else:
                log_test("Tuning types count (15)", False, f"Expected 15, got {len(tuning_types)}")
            
            # Check specific entries with corrected names and credits
            expected_entries = {
                'Car Tuning (Stage 1)': 1.0,
                'Checksum (if possible)': 0.5,
                'E85 Conversion': 2.0,
                'MapSwitch Simos 18.X EDC17.X Med17.X med9.X MG1 MD1': 4.0
            }
            
            found_entries = {}
            for entry in tuning_types:
                name = entry.get('name')
                credits = entry.get('credits')
                if name in expected_entries:
                    found_entries[name] = credits
            
            all_correct = True
            for name, expected_credits in expected_entries.items():
                if name not in found_entries:
                    log_test(f"Tuning type '{name}' present", False, f"Not found")
                    all_correct = False
                elif found_entries[name] != expected_credits:
                    log_test(f"Tuning type '{name}' credits", False, f"Expected {expected_credits}, got {found_entries[name]}")
                    all_correct = False
                else:
                    log_test(f"Tuning type '{name}' correct", True, f"Credits: {expected_credits}")
            
        else:
            log_test("Tuning types endpoint", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Tuning types endpoint", False, f"Exception: {str(e)}")

def test_options_additional():
    """Test 6: GET /api/options/additional"""
    print("\n=== Testing Options Additional ===")
    
    try:
        response = requests.get(f"{BASE_URL}/options/additional")
        if response.status_code == 200:
            additional_options = response.json()
            
            # Should return 40+ items
            if len(additional_options) >= 40:
                log_test("Additional options count (40+)", True, f"Found {len(additional_options)} options")
            else:
                log_test("Additional options count (40+)", False, f"Expected 40+, got {len(additional_options)}")
            
            # Check for specific required options with correct credits
            expected_options = {
                'adblue_scr': 1.0,
                'antilag': 1.0,
                'pop_bang': 1.0,
                'pop_bang_sport': 1.2,
                'launch_control': 0.5,
                'warranty_patch': 1.0,
                'e85_flexfuel': 2.0,
                'perf_gauge': 0.0
            }
            
            found_options = {}
            for option in additional_options:
                option_id = option.get('id')
                credits = option.get('credits')
                if option_id in expected_options:
                    found_options[option_id] = credits
            
            for option_id, expected_credits in expected_options.items():
                if option_id not in found_options:
                    log_test(f"Additional option '{option_id}' present", False, "Not found")
                elif found_options[option_id] != expected_credits:
                    log_test(f"Additional option '{option_id}' credits", False, f"Expected {expected_credits}, got {found_options[option_id]}")
                else:
                    log_test(f"Additional option '{option_id}' correct", True, f"Credits: {expected_credits}")
                    
        else:
            log_test("Additional options endpoint", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Additional options endpoint", False, f"Exception: {str(e)}")

def test_options_tools():
    """Test 7: GET /api/options/tools"""
    print("\n=== Testing Options Tools ===")
    
    try:
        response = requests.get(f"{BASE_URL}/options/tools")
        if response.status_code == 200:
            tools = response.json()
            
            # Check toolTypes
            tool_types = tools.get('toolTypes', [])
            expected_tool_types = ['Master', 'Slave']
            if tool_types == expected_tool_types:
                log_test("Tool types correct", True, f"Found: {tool_types}")
            else:
                log_test("Tool types correct", False, f"Expected {expected_tool_types}, got {tool_types}")
            
            # Check readMethods includes specific items
            read_methods = tools.get('readMethods', [])
            required_read_methods = ['Alientech Kess', 'Autotuner Bench', 'FOXflash BENCH', 'MPPS', 'Otherwise, namely']
            missing_methods = [method for method in required_read_methods if method not in read_methods]
            if not missing_methods:
                log_test("Read methods include required items", True, f"Found {len(read_methods)} methods")
            else:
                log_test("Read methods include required items", False, f"Missing: {missing_methods}")
            
            # Check gearboxes includes specific items
            gearboxes = tools.get('gearboxes', [])
            required_gearboxes = ['DSG', 'DSG6', 'DSG7', 'CVT', 'Tiptronic', 'SMG']
            missing_gearboxes = [gb for gb in required_gearboxes if gb not in gearboxes]
            if not missing_gearboxes:
                log_test("Gearboxes include required items", True, f"Found {len(gearboxes)} gearboxes")
            else:
                log_test("Gearboxes include required items", False, f"Missing: {missing_gearboxes}")
            
            # Check octaneRatings has 4 entries
            octane_ratings = tools.get('octaneRatings', [])
            if len(octane_ratings) == 4:
                log_test("Octane ratings count (4)", True, f"Found: {octane_ratings}")
            else:
                log_test("Octane ratings count (4)", False, f"Expected 4, got {len(octane_ratings)}")
            
            # Check vehicleTypes
            vehicle_types = tools.get('vehicleTypes', [])
            expected_vehicle_types = ['Car', 'Truck', 'Agriculture', 'Bike', 'Boat']
            if vehicle_types == expected_vehicle_types:
                log_test("Vehicle types correct", True, f"Found: {vehicle_types}")
            else:
                log_test("Vehicle types correct", False, f"Expected {expected_vehicle_types}, got {vehicle_types}")
            
            # Check timeFrames has 3 entries
            time_frames = tools.get('timeFrames', [])
            if len(time_frames) == 3:
                log_test("Time frames count (3)", True, f"Found: {time_frames}")
            else:
                log_test("Time frames count (3)", False, f"Expected 3, got {len(time_frames)}")
                
        else:
            log_test("Tools options endpoint", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Tools options endpoint", False, f"Exception: {str(e)}")

def test_auth_regression():
    """Test 8: Quick regression - Admin login"""
    print("\n=== Testing Auth Regression ===")
    
    try:
        login_data = {"email": "admin@fast-chiptuningfiles.com", "password": "admin1234"}
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            is_admin = data.get("user", {}).get("is_admin", False)
            if is_admin:
                log_test("Admin login regression", True, "Admin login successful with is_admin=true")
            else:
                log_test("Admin login regression", False, f"is_admin=false: {data}")
        else:
            log_test("Admin login regression", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        log_test("Admin login regression", False, f"Exception: {str(e)}")

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("VEHICLE & OPTIONS ENDPOINTS SMOKE TEST SUMMARY")
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
    print("Starting Vehicle and Options Endpoints Smoke Test")
    print(f"Backend URL: {BASE_URL}")
    
    # Run all tests in order
    test_vehicles_brands()
    test_vehicles_models()
    test_vehicles_generations()
    test_vehicles_engines()
    test_options_tuning_types()
    test_options_additional()
    test_options_tools()
    test_auth_regression()
    
    print_summary()