#!/usr/bin/env python3
"""
Backend API Test Suite for Ayıntap Balta Kılıç E-commerce
Tests all backend endpoints using the deployed URL from .env
"""

import requests
import json
import base64
from typing import Dict, Optional

# Base URL from .env
BASE_URL = "https://osman-craft-market.preview.emergentagent.com/api"

# Bootstrap admin credentials
ADMIN_EMAIL = "admin@ayintap.com"
ADMIN_PASSWORD = "Ayintap2025!"

# Test state
admin_token = None
admin_cookie = None
customer_token = None
customer_cookie = None
test_product_id = None
test_section_id = None
test_order_id = None

def print_test(name: str):
    """Print test name"""
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_result(success: bool, message: str, details: Optional[Dict] = None):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    if details:
        print(f"Details: {json.dumps(details, indent=2, ensure_ascii=False)}")

def test_auto_seed():
    """Test 1: Auto-seed verification"""
    print_test("1. Auto-seed verification")
    
    try:
        # Test settings
        print("\n→ Testing GET /api/settings")
        resp = requests.get(f"{BASE_URL}/settings", timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            settings = data.get('settings', {})
            brand_name = settings.get('brandName', '')
            if brand_name == "Ayıntap Balta Kılıç":
                print_result(True, f"Settings returned with brandName='{brand_name}'")
            else:
                print_result(False, f"Expected brandName='Ayıntap Balta Kılıç', got '{brand_name}'", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Settings test failed: {str(e)}")
    
    try:
        # Test categories
        print("\n→ Testing GET /api/categories")
        resp = requests.get(f"{BASE_URL}/categories", timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            categories = data.get('categories', [])
            if len(categories) == 7:
                print_result(True, f"Categories returned: {len(categories)} categories")
                print(f"Category names: {[c.get('name') for c in categories]}")
            else:
                print_result(False, f"Expected 7 categories, got {len(categories)}", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Categories test failed: {str(e)}")
    
    try:
        # Test products
        print("\n→ Testing GET /api/products")
        resp = requests.get(f"{BASE_URL}/products", timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            products = data.get('products', [])
            if len(products) == 6:
                print_result(True, f"Products returned: {len(products)} products")
                print(f"Product names: {[p.get('name') for p in products]}")
            else:
                print_result(False, f"Expected 6 products, got {len(products)}", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Products test failed: {str(e)}")
    
    try:
        # Test homepage sections with enriched products
        print("\n→ Testing GET /api/homepage (must have enriched featured_products)")
        resp = requests.get(f"{BASE_URL}/homepage", timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            sections = data.get('sections', [])
            print(f"Total sections: {len(sections)}")
            
            # Check if sections are sorted by order
            orders = [s.get('order', 0) for s in sections]
            is_sorted = orders == sorted(orders)
            
            # Find featured_products section
            featured_section = None
            for s in sections:
                if s.get('type') == 'featured_products':
                    featured_section = s
                    break
            
            if featured_section:
                products_in_section = featured_section.get('data', {}).get('products', [])
                if len(products_in_section) > 0:
                    print_result(True, f"Homepage sections returned: {len(sections)} sections (sorted: {is_sorted}), featured_products section has {len(products_in_section)} enriched products")
                else:
                    print_result(False, "featured_products section exists but has no enriched products", featured_section)
            else:
                print_result(False, "No featured_products section found in homepage", {'sections': [s.get('type') for s in sections]})
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Homepage test failed: {str(e)}")

def test_auth_flow():
    """Test 2: Auth flow"""
    global admin_token, admin_cookie, customer_token, customer_cookie
    print_test("2. Auth flow")
    
    try:
        # Register new customer
        print("\n→ Testing POST /api/auth/register")
        customer_email = f"test_customer_{int(requests.get(f'{BASE_URL}/').json().get('time', '0').replace(':', '').replace('-', '').replace('.', '').replace('T', '').replace('Z', '')[:14])}@test.com"
        register_data = {
            "email": customer_email,
            "password": "TestPass123!",
            "name": "Test Customer",
            "phone": "+90 555 123 4567"
        }
        resp = requests.post(f"{BASE_URL}/auth/register", json=register_data, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            user = data.get('user', {})
            token = data.get('token', '')
            cookie = resp.cookies.get('auth_token', '')
            if user and token and cookie:
                customer_token = token
                customer_cookie = cookie
                print_result(True, f"Customer registered: {user.get('email')}, role={user.get('role')}, token received, cookie set")
            else:
                print_result(False, "Registration response missing user/token/cookie", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Register test failed: {str(e)}")
    
    try:
        # Login with bad credentials
        print("\n→ Testing POST /api/auth/login (bad credentials)")
        resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "bad@test.com", "password": "wrong"}, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code in [401, 404]:
            print_result(True, f"Bad login rejected with status {resp.status_code}")
        else:
            print_result(False, f"Expected 401 or 404, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Bad login test failed: {str(e)}")
    
    try:
        # Login with admin credentials
        print("\n→ Testing POST /api/auth/login (admin credentials)")
        resp = requests.post(f"{BASE_URL}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            user = data.get('user', {})
            token = data.get('token', '')
            cookie = resp.cookies.get('auth_token', '')
            if user.get('role') == 'super_admin' and token and cookie:
                admin_token = token
                admin_cookie = cookie
                print_result(True, f"Admin logged in: {user.get('email')}, role={user.get('role')}, token received, cookie set")
            else:
                print_result(False, "Admin login response invalid", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Admin login test failed: {str(e)}")
    
    try:
        # Test /auth/me with cookie
        print("\n→ Testing GET /api/auth/me (with cookie)")
        cookies = {'auth_token': admin_cookie} if admin_cookie else {}
        resp = requests.get(f"{BASE_URL}/auth/me", cookies=cookies, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            user = data.get('user', {})
            if user and user.get('email') == ADMIN_EMAIL:
                print_result(True, f"/auth/me returned logged user: {user.get('email')}, role={user.get('role')}")
            else:
                print_result(False, "/auth/me returned wrong user", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"/auth/me test failed: {str(e)}")
    
    try:
        # Test /auth/me with Bearer token
        print("\n→ Testing GET /api/auth/me (with Bearer token)")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        resp = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            user = data.get('user', {})
            if user and user.get('email') == ADMIN_EMAIL:
                print_result(True, f"/auth/me with Bearer token returned logged user: {user.get('email')}")
            else:
                print_result(False, "/auth/me returned wrong user", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"/auth/me Bearer test failed: {str(e)}")
    
    try:
        # Test logout
        print("\n→ Testing POST /api/auth/logout")
        cookies = {'auth_token': admin_cookie} if admin_cookie else {}
        resp = requests.post(f"{BASE_URL}/auth/logout", cookies=cookies, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            cookie_cleared = resp.cookies.get('auth_token', '') == ''
            print_result(True, f"Logout successful, cookie cleared: {cookie_cleared}")
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Logout test failed: {str(e)}")

def test_admin_protection():
    """Test 3: Admin protection"""
    print_test("3. Admin protection")
    
    try:
        # Without auth: PUT /api/settings
        print("\n→ Testing PUT /api/settings (without auth)")
        resp = requests.put(f"{BASE_URL}/settings", json={"tagline": "TEST"}, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 401:
            print_result(True, "PUT /settings without auth rejected with 401")
        else:
            print_result(False, f"Expected 401, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Settings protection test failed: {str(e)}")
    
    try:
        # Without auth: POST /api/admin/products
        print("\n→ Testing POST /api/admin/products (without auth)")
        resp = requests.post(f"{BASE_URL}/admin/products", json={"name": "Test"}, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 401:
            print_result(True, "POST /admin/products without auth rejected with 401")
        else:
            print_result(False, f"Expected 401, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Products protection test failed: {str(e)}")
    
    try:
        # Without auth: GET /api/admin/stats
        print("\n→ Testing GET /api/admin/stats (without auth)")
        resp = requests.get(f"{BASE_URL}/admin/stats", timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 401:
            print_result(True, "GET /admin/stats without auth rejected with 401")
        else:
            print_result(False, f"Expected 401, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Stats protection test failed: {str(e)}")
    
    try:
        # With customer role: GET /api/admin/stats
        print("\n→ Testing GET /api/admin/stats (with customer role)")
        headers = {'Authorization': f'Bearer {customer_token}'} if customer_token else {}
        resp = requests.get(f"{BASE_URL}/admin/stats", headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 403:
            print_result(True, "GET /admin/stats with customer role rejected with 403 (forbidden)")
        else:
            print_result(False, f"Expected 403, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Customer stats test failed: {str(e)}")
    
    try:
        # With super_admin: GET /api/admin/stats
        print("\n→ Testing GET /api/admin/stats (with super_admin token)")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        resp = requests.get(f"{BASE_URL}/admin/stats", headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            required_fields = ['orderCount', 'productCount', 'userCount', 'totalSales']
            has_all = all(field in data for field in required_fields)
            if has_all:
                print_result(True, f"Admin stats returned: {data}")
            else:
                print_result(False, "Stats missing required fields", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Admin stats test failed: {str(e)}")

def test_site_settings():
    """Test 4: Site Settings"""
    print_test("4. Site Settings")
    
    try:
        # Update settings with admin token
        print("\n→ Testing PUT /api/settings (with admin token)")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        resp = requests.put(f"{BASE_URL}/settings", json={"tagline": "TEST_TAGLINE"}, headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            settings = data.get('settings', {})
            if settings.get('tagline') == "TEST_TAGLINE":
                print_result(True, f"Settings updated: tagline={settings.get('tagline')}")
            else:
                print_result(False, "Settings not updated correctly", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Settings update test failed: {str(e)}")
    
    try:
        # Verify settings reflect update
        print("\n→ Testing GET /api/settings (verify update)")
        resp = requests.get(f"{BASE_URL}/settings", timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            settings = data.get('settings', {})
            if settings.get('tagline') == "TEST_TAGLINE":
                print_result(True, f"Settings reflect update: tagline={settings.get('tagline')}")
            else:
                print_result(False, f"Expected tagline='TEST_TAGLINE', got '{settings.get('tagline')}'", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Settings verification test failed: {str(e)}")

def test_products_crud():
    """Test 5: Products CRUD (admin)"""
    global test_product_id
    print_test("5. Products CRUD (admin)")
    
    try:
        # GET /api/admin/products
        print("\n→ Testing GET /api/admin/products (with admin token)")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        resp = requests.get(f"{BASE_URL}/admin/products", headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            products = data.get('products', [])
            print_result(True, f"Admin products list returned: {len(products)} products")
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Admin products list test failed: {str(e)}")
    
    try:
        # POST /api/admin/products
        print("\n→ Testing POST /api/admin/products (create product)")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        product_data = {
            "name": "Test Kılıcı",
            "slug": "test-kilici",
            "price": 5000,
            "stock": 10,
            "description": "Test ürünü",
            "isFeatured": True
        }
        resp = requests.post(f"{BASE_URL}/admin/products", json=product_data, headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            product = data.get('product', {})
            test_product_id = product.get('id')
            if test_product_id and product.get('name') == "Test Kılıcı":
                print_result(True, f"Product created: id={test_product_id}, name={product.get('name')}")
            else:
                print_result(False, "Product creation response invalid", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Product creation test failed: {str(e)}")
    
    try:
        # PUT /api/admin/products/<id>
        print("\n→ Testing PUT /api/admin/products/<id> (update product)")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        resp = requests.put(f"{BASE_URL}/admin/products/{test_product_id}", json={"price": 6000}, headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            product = data.get('product', {})
            if product.get('price') == 6000:
                print_result(True, f"Product updated: price={product.get('price')}")
            else:
                print_result(False, "Product not updated correctly", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Product update test failed: {str(e)}")
    
    try:
        # GET /api/products/<slug> public
        print("\n→ Testing GET /api/products/<slug> (public)")
        resp = requests.get(f"{BASE_URL}/products/test-kilici", timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            product = data.get('product', {})
            if product.get('slug') == 'test-kilici':
                print_result(True, f"Public product endpoint returned: {product.get('name')}")
            else:
                print_result(False, "Product not found or wrong slug", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Public product test failed: {str(e)}")
    
    try:
        # DELETE /api/admin/products/<id>
        print("\n→ Testing DELETE /api/admin/products/<id>")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        resp = requests.delete(f"{BASE_URL}/admin/products/{test_product_id}", headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print_result(True, "Product deleted successfully")
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Product deletion test failed: {str(e)}")

def test_homepage_sections():
    """Test 6: Homepage section CRUD + reorder"""
    global test_section_id
    print_test("6. Homepage section CRUD + reorder")
    
    try:
        # GET /api/admin/homepage
        print("\n→ Testing GET /api/admin/homepage (with admin token)")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        resp = requests.get(f"{BASE_URL}/admin/homepage", headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            sections = data.get('sections', [])
            print_result(True, f"Admin homepage sections returned: {len(sections)} sections")
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Admin homepage list test failed: {str(e)}")
    
    try:
        # POST /api/admin/homepage
        print("\n→ Testing POST /api/admin/homepage (create section)")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        section_data = {
            "type": "story",
            "data": {
                "title": "Test Story Section",
                "content": "This is a test story"
            }
        }
        resp = requests.post(f"{BASE_URL}/admin/homepage", json=section_data, headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            section = data.get('section', {})
            test_section_id = section.get('id')
            if test_section_id and section.get('type') == 'story':
                print_result(True, f"Section created: id={test_section_id}, type={section.get('type')}")
            else:
                print_result(False, "Section creation response invalid", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Section creation test failed: {str(e)}")
    
    try:
        # PUT /api/admin/homepage/<id>
        print("\n→ Testing PUT /api/admin/homepage/<id> (toggle isActive)")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        resp = requests.put(f"{BASE_URL}/admin/homepage/{test_section_id}", json={"isActive": False}, headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            section = data.get('section', {})
            if section.get('isActive') == False:
                print_result(True, f"Section updated: isActive={section.get('isActive')}")
            else:
                print_result(False, "Section not updated correctly", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Section update test failed: {str(e)}")
    
    try:
        # POST /api/admin/homepage/reorder
        print("\n→ Testing POST /api/admin/homepage/reorder")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        # Get current sections to build reorder payload
        resp_sections = requests.get(f"{BASE_URL}/admin/homepage", headers=headers, timeout=10)
        if resp_sections.status_code == 200:
            sections = resp_sections.json().get('sections', [])
            reorder_data = {"order": [{"id": s.get('id'), "order": s.get('order')} for s in sections]}
            resp = requests.post(f"{BASE_URL}/admin/homepage/reorder", json=reorder_data, headers=headers, timeout=10)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                print_result(True, "Section reorder successful")
            else:
                print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
        else:
            print_result(False, "Could not get sections for reorder test")
    except Exception as e:
        print_result(False, f"Section reorder test failed: {str(e)}")
    
    try:
        # GET /api/homepage public (verify disabled section not shown)
        print("\n→ Testing GET /api/homepage (verify disabled section not shown)")
        resp = requests.get(f"{BASE_URL}/homepage", timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            sections = data.get('sections', [])
            section_ids = [s.get('id') for s in sections]
            if test_section_id not in section_ids:
                print_result(True, f"Public homepage does not show disabled section (total active: {len(sections)})")
            else:
                print_result(False, "Disabled section still appears in public homepage", {'section_ids': section_ids})
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Public homepage verification test failed: {str(e)}")
    
    try:
        # DELETE /api/admin/homepage/<id>
        print("\n→ Testing DELETE /api/admin/homepage/<id>")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        resp = requests.delete(f"{BASE_URL}/admin/homepage/{test_section_id}", headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print_result(True, "Section deleted successfully")
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Section deletion test failed: {str(e)}")

def test_products_filter():
    """Test 7: Products filter"""
    print_test("7. Products filter")
    
    try:
        # Filter by category
        print("\n→ Testing GET /api/products?kategori=osmanli-serisi")
        resp = requests.get(f"{BASE_URL}/products?kategori=osmanli-serisi", timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            products = data.get('products', [])
            # Check if all products are from osmanli-serisi category
            print_result(True, f"Category filter returned {len(products)} products")
            if products:
                print(f"Product names: {[p.get('name') for p in products]}")
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Category filter test failed: {str(e)}")
    
    try:
        # Search by query
        print("\n→ Testing GET /api/products?q=Alparslan")
        resp = requests.get(f"{BASE_URL}/products?q=Alparslan", timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            products = data.get('products', [])
            # Check if Alparslan product is in results
            has_alparslan = any('Alparslan' in p.get('name', '') for p in products)
            if has_alparslan:
                print_result(True, f"Search query returned {len(products)} products including Alparslan")
                print(f"Product names: {[p.get('name') for p in products]}")
            else:
                print_result(False, f"Search did not return Alparslan product", {'products': [p.get('name') for p in products]})
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Search query test failed: {str(e)}")

def test_orders():
    """Test 8: Orders"""
    global test_order_id
    print_test("8. Orders")
    
    try:
        # POST /api/orders
        print("\n→ Testing POST /api/orders (create order)")
        order_data = {
            "customer": {
                "name": "Mehmet Yılmaz",
                "email": "mehmet@test.com",
                "phone": "+90 555 999 8877"
            },
            "items": [
                {"productId": "test-id", "name": "Test Ürün", "price": 5000, "quantity": 2}
            ],
            "subtotal": 10000,
            "shipping": 50,
            "total": 10050,
            "shippingAddress": {
                "address": "Test Mahallesi Test Sokak No:1",
                "city": "İstanbul",
                "district": "Kadıköy",
                "postalCode": "34000"
            }
        }
        resp = requests.post(f"{BASE_URL}/orders", json=order_data, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            order = data.get('order', {})
            test_order_id = order.get('id')
            order_number = order.get('orderNumber', '')
            if test_order_id and order_number.startswith('ABK-'):
                print_result(True, f"Order created: id={test_order_id}, orderNumber={order_number}")
            else:
                print_result(False, "Order creation response invalid or orderNumber doesn't start with 'ABK-'", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Order creation test failed: {str(e)}")
    
    try:
        # GET /api/admin/orders
        print("\n→ Testing GET /api/admin/orders (verify order in list)")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        resp = requests.get(f"{BASE_URL}/admin/orders", headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            orders = data.get('orders', [])
            order_ids = [o.get('id') for o in orders]
            if test_order_id in order_ids:
                print_result(True, f"Admin orders list includes new order (total: {len(orders)} orders)")
            else:
                print_result(False, "New order not found in admin orders list", {'order_ids': order_ids})
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Admin orders list test failed: {str(e)}")

def test_upload():
    """Test 9: Upload (with fallback)"""
    print_test("9. Upload (with fallback)")
    
    try:
        # POST /api/upload with small base64 image
        print("\n→ Testing POST /api/upload (with admin token, fallback mode)")
        headers = {'Authorization': f'Bearer {admin_token}'} if admin_token else {}
        # Small 1x1 red pixel PNG
        small_png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        data_url = f"data:image/png;base64,{small_png}"
        upload_data = {"dataUrl": data_url}
        resp = requests.post(f"{BASE_URL}/upload", json=upload_data, headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            url = data.get('url', '')
            fallback = data.get('fallback', False)
            if url and fallback == True:
                print_result(True, f"Upload returned with fallback=true (Cloudinary keys empty), url returned: {url[:50]}...")
            else:
                print_result(False, "Upload response invalid or fallback not true", data)
        else:
            print_result(False, f"Expected 200, got {resp.status_code}", resp.json())
    except Exception as e:
        print_result(False, f"Upload test failed: {str(e)}")

def run_all_tests():
    """Run all test scenarios"""
    print("\n" + "="*80)
    print("AYINTAP BALTA KILIÇ BACKEND API TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    print("="*80)
    
    test_auto_seed()
    test_auth_flow()
    test_admin_protection()
    test_site_settings()
    test_products_crud()
    test_homepage_sections()
    test_products_filter()
    test_orders()
    test_upload()
    
    print("\n" + "="*80)
    print("ALL TESTS COMPLETED")
    print("="*80)

if __name__ == "__main__":
    run_all_tests()
