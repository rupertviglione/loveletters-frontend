#!/usr/bin/env python3
import requests
import sys
from datetime import datetime

class APITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, expected_count=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}" if not endpoint.startswith('/api') else f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response Type: {type(response_data)}")
                    
                    # Check if we expect a specific count
                    if expected_count is not None:
                        if isinstance(response_data, list):
                            actual_count = len(response_data)
                            print(f"   Expected Count: {expected_count}, Actual Count: {actual_count}")
                            success = actual_count == expected_count
                            if not success:
                                print(f"❌ Count mismatch - Expected {expected_count}, got {actual_count}")
                        else:
                            success = False
                            print(f"❌ Expected list response for count check, got {type(response_data)}")
                    
                    if success:
                        self.tests_passed += 1
                        print(f"✅ Passed - Status: {response.status_code}")
                        if expected_count:
                            print(f"   ✓ Count verified: {expected_count}")
                    
                    return success, response_data
                except Exception as e:
                    print(f"❌ Failed to parse JSON response: {str(e)}")
                    print(f"   Raw response: {response.text[:200]}...")
                    return False, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Raw error: {response.text[:200]}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_products_api(self):
        """Test products API - should return 17 products"""
        return self.run_test("Products API (All)", "GET", "products", 200, expected_count=17)
    
    def test_products_categories(self):
        """Test products by category"""
        categories = ['tshirts', 'totebags', 'posters', 'complementos', 'bundles', 'rascunhos']
        all_passed = True
        
        for category in categories:
            success, response = self.run_test(
                f"Products API ({category})", 
                "GET", 
                f"products?category={category}", 
                200
            )
            if not success:
                all_passed = False
        
        return all_passed

    def test_contact_form(self):
        """Test contact form submission"""
        test_data = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "This is a test message from automated testing"
        }
        return self.run_test("Contact Form", "POST", "contact", 200, data=test_data)

def main():
    # Get the public URL from frontend .env
    try:
        with open('/app/frontend/.env', 'r') as f:
            content = f.read()
            public_url = None
            for line in content.split('\n'):
                if line.startswith('REACT_APP_BACKEND_URL='):
                    public_url = line.split('=', 1)[1].strip()
                    break
            
            if not public_url:
                print("❌ Could not find REACT_APP_BACKEND_URL in frontend/.env")
                return 1
    except Exception as e:
        print(f"❌ Error reading frontend/.env: {e}")
        return 1

    print(f"🚀 Starting API tests with public URL: {public_url}")
    
    # Setup tester
    tester = APITester(public_url)

    # Run tests
    print("\n" + "="*60)
    print("BACKEND API TESTING")
    print("="*60)
    
    # Test basic API connection
    tester.test_api_root()
    
    # Test products API - should return exactly 17 products
    tester.test_products_api()
    
    # Test products by categories
    tester.test_products_categories()
    
    # Test contact form
    tester.test_contact_form()

    # Print results
    print(f"\n" + "="*60)
    print(f"📊 RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    print("="*60)
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print("⚠️  Some backend tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())