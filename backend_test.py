#!/usr/bin/env python3
"""
Backend API Testing for Ayıntap Balta Kılıç E-commerce
Tests Phase 2, 4, and 5 endpoints
"""
import requests
import json
import time
from pymongo import MongoClient
import os

# Configuration
BASE_URL = "https://osman-craft-market.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@ayintap.com"
ADMIN_PASSWORD = "Ayintap2025!"

# MongoDB connection for direct DB queries
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "ayintap_balta_kilic")

def get_db():
    client = MongoClient(MONGO_URL)
    return client[DB_NAME]

def print_test(name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if details:
        print(f"   {details}")

def admin_login():
    """Login as admin and return token"""
    resp = requests.post(f"{API_URL}/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if resp.status_code == 200:
        data = resp.json()
        return data.get("token"), resp.cookies.get("auth_token")
    return None, None

def customer_register():
    """Register a new customer and return token"""
    email = f"test_{int(time.time())}@test.com"
    resp = requests.post(f"{API_URL}/auth/register", json={
        "email": email,
        "password": "test123456",
        "name": "Test Customer",
        "phone": "+90 555 123 4567"
    })
    if resp.status_code == 200:
        data = resp.json()
        return data.get("token"), email, data.get("user", {}).get("id")
    return None, None, None

def get_product_id():
    """Get a valid product ID for testing"""
    resp = requests.get(f"{API_URL}/products")
    if resp.status_code == 200:
        products = resp.json().get("products", [])
        if products:
            return products[0]["id"]
    return None

print("\n" + "="*80)
print("BACKEND API TESTING - PHASE 2, 4, 5")
print("="*80 + "\n")

# ============================================================================
# AUTHENTICATION FLOW (Phase 2)
# ============================================================================
print("\n--- AUTHENTICATION FLOW (Phase 2) ---\n")

# Test 1: POST /api/auth/forgot-password with existing email
print("Test 1: Forgot password with existing email (anti-enumeration)")
resp = requests.post(f"{API_URL}/auth/forgot-password", json={"email": ADMIN_EMAIL})
test1_pass = resp.status_code == 200 and "message" in resp.json()
print_test("POST /api/auth/forgot-password (existing email)", test1_pass, 
           f"Status: {resp.status_code}, Response: {resp.json()}")

# Verify resetToken is stored in DB
db = get_db()
admin_user = db.users.find_one({"email": ADMIN_EMAIL})
reset_token = admin_user.get("resetToken") if admin_user else None
test1b_pass = reset_token is not None
print_test("Reset token stored in DB", test1b_pass, f"Token: {reset_token[:20] if reset_token else 'None'}...")

# Test 2: POST /api/auth/forgot-password with non-existent email
print("\nTest 2: Forgot password with non-existent email (anti-enumeration)")
resp = requests.post(f"{API_URL}/auth/forgot-password", json={"email": "nonexistent@test.com"})
test2_pass = resp.status_code == 200
print_test("POST /api/auth/forgot-password (non-existent email)", test2_pass, 
           f"Status: {resp.status_code}, Should still return 200")

# Test 3: POST /api/auth/reset-password with invalid token
print("\nTest 3: Reset password with invalid token")
resp = requests.post(f"{API_URL}/auth/reset-password", json={
    "token": "invalid-token-12345",
    "password": "newpass123"
})
test3_pass = resp.status_code == 400 and "token" in resp.json().get("error", "").lower()
print_test("POST /api/auth/reset-password (invalid token)", test3_pass, 
           f"Status: {resp.status_code}, Error: {resp.json().get('error', '')}")

# Test 4: POST /api/auth/reset-password with valid token
print("\nTest 4: Reset password with valid token")
if reset_token:
    resp = requests.post(f"{API_URL}/auth/reset-password", json={
        "token": reset_token,
        "password": "Ayintap2025!"  # Reset to same password
    })
    test4_pass = resp.status_code == 200
    print_test("POST /api/auth/reset-password (valid token)", test4_pass, 
               f"Status: {resp.status_code}, Response: {resp.json()}")
    
    # Verify token is cleared
    admin_user_after = db.users.find_one({"email": ADMIN_EMAIL})
    test4b_pass = admin_user_after.get("resetToken") is None
    print_test("Reset token cleared after use", test4b_pass)
else:
    print_test("POST /api/auth/reset-password (valid token)", False, "No reset token available")

# Test 5: POST /api/auth/reset-password with short password
print("\nTest 5: Reset password with too short password")
resp = requests.post(f"{API_URL}/auth/reset-password", json={
    "token": "any-token",
    "password": "123"
})
test5_pass = resp.status_code == 400
print_test("POST /api/auth/reset-password (short password)", test5_pass, 
           f"Status: {resp.status_code}, Error: {resp.json().get('error', '')}")

# Test 6: POST /api/auth/send-verification without auth
print("\nTest 6: Send verification without auth")
resp = requests.post(f"{API_URL}/auth/send-verification")
test6_pass = resp.status_code == 401
print_test("POST /api/auth/send-verification (no auth)", test6_pass, 
           f"Status: {resp.status_code}")

# Test 7: POST /api/auth/send-verification with auth
print("\nTest 7: Send verification with auth")
admin_token, _ = admin_login()
resp = requests.post(f"{API_URL}/auth/send-verification", 
                     headers={"Authorization": f"Bearer {admin_token}"})
test7_pass = resp.status_code == 200
print_test("POST /api/auth/send-verification (with auth)", test7_pass, 
           f"Status: {resp.status_code}")

# Verify verifyToken is stored
admin_user = db.users.find_one({"email": ADMIN_EMAIL})
verify_token = admin_user.get("verifyToken") if admin_user else None
test7b_pass = verify_token is not None
print_test("Verify token stored in DB", test7b_pass)

# Test 8: POST /api/auth/verify-email with invalid token
print("\nTest 8: Verify email with invalid token")
resp = requests.post(f"{API_URL}/auth/verify-email", json={"token": "invalid-token"})
test8_pass = resp.status_code == 400
print_test("POST /api/auth/verify-email (invalid token)", test8_pass, 
           f"Status: {resp.status_code}")

# Test 9: POST /api/auth/verify-email with valid token
print("\nTest 9: Verify email with valid token")
if verify_token:
    resp = requests.post(f"{API_URL}/auth/verify-email", json={"token": verify_token})
    test9_pass = resp.status_code == 200
    print_test("POST /api/auth/verify-email (valid token)", test9_pass, 
               f"Status: {resp.status_code}")
    
    # Verify emailVerified is set
    admin_user_after = db.users.find_one({"email": ADMIN_EMAIL})
    test9b_pass = admin_user_after.get("emailVerified") == True
    print_test("emailVerified set to true", test9b_pass)
else:
    print_test("POST /api/auth/verify-email (valid token)", False, "No verify token available")

# ============================================================================
# ME ENDPOINTS (Phase 2)
# ============================================================================
print("\n--- ME ENDPOINTS (Phase 2) ---\n")

# Register a customer for testing
customer_token, customer_email, customer_id = customer_register()
print(f"Registered test customer: {customer_email}")

# Test 10: All ME endpoints without auth should return 401
print("\nTest 10: ME endpoints without auth")
endpoints = [
    ("GET", "/me/orders"),
    ("PUT", "/me/profile"),
    ("POST", "/me/change-password"),
    ("GET", "/me/favorites"),
    ("POST", "/me/favorites"),
    ("GET", "/me/addresses"),
    ("POST", "/me/addresses"),
]
test10_pass = True
for method, endpoint in endpoints:
    if method == "GET":
        resp = requests.get(f"{API_URL}{endpoint}")
    elif method == "POST":
        resp = requests.post(f"{API_URL}{endpoint}", json={})
    elif method == "PUT":
        resp = requests.put(f"{API_URL}{endpoint}", json={})
    
    if resp.status_code != 401:
        test10_pass = False
        print(f"   ❌ {method} {endpoint} returned {resp.status_code} instead of 401")
    else:
        print(f"   ✅ {method} {endpoint} correctly returned 401")

print_test("All ME endpoints require auth", test10_pass)

# Test 11: PUT /api/me/profile
print("\nTest 11: Update profile")
resp = requests.put(f"{API_URL}/me/profile", 
                    headers={"Authorization": f"Bearer {customer_token}"},
                    json={"name": "Updated Name", "phone": "+90 555 999 8888"})
test11_pass = resp.status_code == 200
if test11_pass:
    user = resp.json().get("user", {})
    test11_pass = user.get("name") == "Updated Name" and user.get("phone") == "+90 555 999 8888"
    # Verify email NOT changed
    test11b_pass = user.get("email") == customer_email
    print_test("PUT /api/me/profile", test11_pass, f"Name and phone updated")
    print_test("Email field NOT changed", test11b_pass)
else:
    print_test("PUT /api/me/profile", False, f"Status: {resp.status_code}")

# Test 12: POST /api/me/change-password with wrong oldPassword
print("\nTest 12: Change password with wrong old password")
resp = requests.post(f"{API_URL}/me/change-password",
                     headers={"Authorization": f"Bearer {customer_token}"},
                     json={"oldPassword": "wrongpass", "newPassword": "newpass123"})
test12_pass = resp.status_code == 401 and "hatali" in resp.json().get("error", "").lower()
print_test("POST /api/me/change-password (wrong old password)", test12_pass, 
           f"Status: {resp.status_code}, Error: {resp.json().get('error', '')}")

# Test 13: POST /api/me/change-password with short newPassword
print("\nTest 13: Change password with short new password")
resp = requests.post(f"{API_URL}/me/change-password",
                     headers={"Authorization": f"Bearer {customer_token}"},
                     json={"oldPassword": "test123456", "newPassword": "123"})
test13_pass = resp.status_code == 400
print_test("POST /api/me/change-password (short password)", test13_pass, 
           f"Status: {resp.status_code}")

# Test 14: POST /api/me/change-password with correct oldPassword
print("\nTest 14: Change password with correct old password")
resp = requests.post(f"{API_URL}/me/change-password",
                     headers={"Authorization": f"Bearer {customer_token}"},
                     json={"oldPassword": "test123456", "newPassword": "newpass123456"})
test14_pass = resp.status_code == 200
print_test("POST /api/me/change-password (correct)", test14_pass, 
           f"Status: {resp.status_code}")

# Verify login works with new password
if test14_pass:
    resp = requests.post(f"{API_URL}/auth/login", json={
        "email": customer_email,
        "password": "newpass123456"
    })
    test14b_pass = resp.status_code == 200
    print_test("Login with new password works", test14b_pass)
    if test14b_pass:
        customer_token = resp.json().get("token")  # Update token

# Test 15: GET /api/me/orders
print("\nTest 15: Get user orders")
resp = requests.get(f"{API_URL}/me/orders",
                    headers={"Authorization": f"Bearer {customer_token}"})
test15_pass = resp.status_code == 200 and "orders" in resp.json()
print_test("GET /api/me/orders", test15_pass, 
           f"Status: {resp.status_code}, Orders: {len(resp.json().get('orders', []))}")

# ============================================================================
# FAVORITES (Phase 2)
# ============================================================================
print("\n--- FAVORITES (Phase 2) ---\n")

product_id = get_product_id()
print(f"Using product ID: {product_id}")

# Test 16: GET /api/me/favorites with no favorites
print("\nTest 16: Get favorites (empty)")
resp = requests.get(f"{API_URL}/me/favorites",
                    headers={"Authorization": f"Bearer {customer_token}"})
test16_pass = resp.status_code == 200 and resp.json().get("favorites") == []
print_test("GET /api/me/favorites (empty)", test16_pass, 
           f"Status: {resp.status_code}, Favorites: {resp.json().get('favorites', [])}")

# Test 17: POST /api/me/favorites to add
print("\nTest 17: Add favorite")
resp = requests.post(f"{API_URL}/me/favorites",
                     headers={"Authorization": f"Bearer {customer_token}"},
                     json={"productId": product_id})
test17_pass = resp.status_code == 200 and resp.json().get("added") == True
print_test("POST /api/me/favorites (add)", test17_pass, 
           f"Status: {resp.status_code}, Added: {resp.json().get('added')}")

# Test 18: POST /api/me/favorites again to toggle off
print("\nTest 18: Toggle favorite off")
resp = requests.post(f"{API_URL}/me/favorites",
                     headers={"Authorization": f"Bearer {customer_token}"},
                     json={"productId": product_id})
test18_pass = resp.status_code == 200 and resp.json().get("added") == False
print_test("POST /api/me/favorites (toggle off)", test18_pass, 
           f"Status: {resp.status_code}, Added: {resp.json().get('added')}")

# Test 19: GET /api/me/favorites after adding
print("\nTest 19: Get favorites with enriched product")
# Add it back
requests.post(f"{API_URL}/me/favorites",
              headers={"Authorization": f"Bearer {customer_token}"},
              json={"productId": product_id})
resp = requests.get(f"{API_URL}/me/favorites",
                    headers={"Authorization": f"Bearer {customer_token}"})
test19_pass = resp.status_code == 200 and len(resp.json().get("favorites", [])) > 0
if test19_pass:
    fav = resp.json()["favorites"][0]
    test19_pass = "name" in fav and "price" in fav and "images" in fav
print_test("GET /api/me/favorites (enriched)", test19_pass, 
           f"Status: {resp.status_code}, Has product details: {test19_pass}")

# ============================================================================
# ADDRESSES (Phase 2)
# ============================================================================
print("\n--- ADDRESSES (Phase 2) ---\n")

# Test 20: GET /api/me/addresses with no addresses
print("\nTest 20: Get addresses (empty)")
resp = requests.get(f"{API_URL}/me/addresses",
                    headers={"Authorization": f"Bearer {customer_token}"})
test20_pass = resp.status_code == 200 and resp.json().get("addresses") == []
print_test("GET /api/me/addresses (empty)", test20_pass, 
           f"Status: {resp.status_code}")

# Test 21: POST /api/me/addresses
print("\nTest 21: Create address")
resp = requests.post(f"{API_URL}/me/addresses",
                     headers={"Authorization": f"Bearer {customer_token}"},
                     json={
                         "title": "Ev",
                         "fullName": "Ali Yilmaz",
                         "phone": "0555 123 4567",
                         "city": "Istanbul",
                         "district": "Kadikoy",
                         "addressLine": "Test Sokak No:1",
                         "isDefault": True
                     })
test21_pass = resp.status_code == 200
address1_id = resp.json().get("address", {}).get("id") if test21_pass else None
print_test("POST /api/me/addresses", test21_pass, 
           f"Status: {resp.status_code}, ID: {address1_id}")

# Test 22: POST second address with isDefault=true
print("\nTest 22: Create second address with isDefault=true")
resp = requests.post(f"{API_URL}/me/addresses",
                     headers={"Authorization": f"Bearer {customer_token}"},
                     json={
                         "title": "Is",
                         "fullName": "Ali Yilmaz",
                         "phone": "0555 999 8888",
                         "city": "Ankara",
                         "district": "Cankaya",
                         "addressLine": "Is Sokak No:2",
                         "isDefault": True
                     })
test22_pass = resp.status_code == 200
address2_id = resp.json().get("address", {}).get("id") if test22_pass else None
print_test("POST /api/me/addresses (second)", test22_pass, 
           f"Status: {resp.status_code}")

# Verify first address now has isDefault=false
resp = requests.get(f"{API_URL}/me/addresses",
                    headers={"Authorization": f"Bearer {customer_token}"})
if resp.status_code == 200:
    addresses = resp.json().get("addresses", [])
    addr1 = next((a for a in addresses if a["id"] == address1_id), None)
    test22b_pass = addr1 and addr1.get("isDefault") == False
    print_test("Previous address isDefault set to false", test22b_pass)

# Test 23: PUT /api/me/addresses/:id
print("\nTest 23: Update address")
if address1_id:
    resp = requests.put(f"{API_URL}/me/addresses/{address1_id}",
                        headers={"Authorization": f"Bearer {customer_token}"},
                        json={"title": "Ev (Guncellendi)"})
    test23_pass = resp.status_code == 200
    if test23_pass:
        addr = resp.json().get("address", {})
        test23_pass = addr.get("title") == "Ev (Guncellendi)" and addr.get("city") == "Istanbul"
    print_test("PUT /api/me/addresses/:id", test23_pass, 
               f"Status: {resp.status_code}, Title updated, other fields preserved")
else:
    print_test("PUT /api/me/addresses/:id", False, "No address ID available")

# Test 24: DELETE /api/me/addresses/:id
print("\nTest 24: Delete address")
if address2_id:
    resp = requests.delete(f"{API_URL}/me/addresses/{address2_id}",
                          headers={"Authorization": f"Bearer {customer_token}"})
    test24_pass = resp.status_code == 200
    print_test("DELETE /api/me/addresses/:id", test24_pass, 
               f"Status: {resp.status_code}")
    
    # Verify it's gone
    resp = requests.get(f"{API_URL}/me/addresses",
                        headers={"Authorization": f"Bearer {customer_token}"})
    if resp.status_code == 200:
        addresses = resp.json().get("addresses", [])
        test24b_pass = not any(a["id"] == address2_id for a in addresses)
        print_test("Address removed from list", test24b_pass)
else:
    print_test("DELETE /api/me/addresses/:id", False, "No address ID available")

# Test 25: DELETE address belonging to another user (should not delete)
print("\nTest 25: Delete address belonging to another user")
# Create address as admin
admin_token, _ = admin_login()
resp = requests.post(f"{API_URL}/me/addresses",
                     headers={"Authorization": f"Bearer {admin_token}"},
                     json={
                         "title": "Admin Address",
                         "fullName": "Admin",
                         "phone": "0555",
                         "city": "Istanbul",
                         "district": "Test",
                         "addressLine": "Test",
                         "isDefault": True
                     })
admin_address_id = resp.json().get("address", {}).get("id") if resp.status_code == 200 else None

# Try to delete as customer
if admin_address_id:
    resp = requests.delete(f"{API_URL}/me/addresses/{admin_address_id}",
                          headers={"Authorization": f"Bearer {customer_token}"})
    # Should return 200 but not actually delete (filtered by userId)
    test25_pass = resp.status_code == 200
    
    # Verify admin address still exists
    resp = requests.get(f"{API_URL}/me/addresses",
                        headers={"Authorization": f"Bearer {admin_token}"})
    if resp.status_code == 200:
        addresses = resp.json().get("addresses", [])
        test25b_pass = any(a["id"] == admin_address_id for a in addresses)
        print_test("DELETE address of another user (filtered by userId)", test25b_pass, 
                   "Address not deleted due to userId filter")
else:
    print_test("DELETE address of another user", False, "Could not create admin address")

# ============================================================================
# ORDERS (Phase 2 + Phase 4)
# ============================================================================
print("\n--- ORDERS (Phase 2 + Phase 4) ---\n")

# Test 26: POST /api/orders as guest
print("\nTest 26: Create order as guest")
resp = requests.post(f"{API_URL}/orders", json={
    "customer": {"name": "Guest User", "email": "guest@test.com", "phone": "0555 123 4567"},
    "items": [{"id": product_id, "name": "Test Product", "price": 1000, "qty": 1}],
    "subtotal": 1000,
    "shipping": 89,
    "extraFee": 0,
    "total": 1089,
    "shippingMethod": "standard",
    "shippingAddress": {
        "fullName": "Guest User",
        "city": "Istanbul",
        "district": "Kadikoy",
        "addressLine": "Test Sokak No:1"
    },
    "paymentMethod": "iyzico"
})
test26_pass = resp.status_code == 200
guest_order_id = None
if test26_pass:
    order = resp.json().get("order", {})
    test26_pass = (order.get("userId") is None and 
                   order.get("status") == "pending_payment" and
                   len(order.get("statusHistory", [])) == 1 and
                   order.get("shippingMethod") == "standard")
    guest_order_id = order.get("id")
    guest_order_number = order.get("orderNumber")
print_test("POST /api/orders (guest)", test26_pass, 
           f"Status: {resp.status_code}, userId=null, status=pending_payment, statusHistory has 1 entry")

# Test 27: POST /api/orders as authenticated user
print("\nTest 27: Create order as authenticated user")
resp = requests.post(f"{API_URL}/orders",
                     headers={"Authorization": f"Bearer {customer_token}"},
                     json={
                         "customer": {"name": "Customer", "email": customer_email, "phone": "0555"},
                         "items": [{"id": product_id, "name": "Test", "price": 500, "qty": 2}],
                         "subtotal": 1000,
                         "shipping": 89,
                         "extraFee": 50,
                         "total": 1139,
                         "shippingMethod": "express",
                         "shippingAddress": {"fullName": "Customer", "city": "X", "district": "Y", "addressLine": "Z"},
                         "paymentMethod": "iyzico"
                     })
test27_pass = resp.status_code == 200
auth_order_id = None
if test27_pass:
    order = resp.json().get("order", {})
    test27_pass = order.get("userId") == customer_id
    auth_order_id = order.get("id")
print_test("POST /api/orders (authenticated)", test27_pass, 
           f"Status: {resp.status_code}, userId populated with customer ID")

# Test 28: GET /api/orders/:orderNumber (public)
print("\nTest 28: Get order by orderNumber (public)")
if guest_order_number:
    resp = requests.get(f"{API_URL}/orders/{guest_order_number}")
    test28_pass = resp.status_code == 200 and resp.json().get("order", {}).get("orderNumber") == guest_order_number
    print_test("GET /api/orders/:orderNumber", test28_pass, 
               f"Status: {resp.status_code}")
else:
    print_test("GET /api/orders/:orderNumber", False, "No order number available")

# ============================================================================
# ADMIN ORDERS (Phase 4)
# ============================================================================
print("\n--- ADMIN ORDERS (Phase 4) ---\n")

# Test 29: PUT /api/admin/orders/:id without auth
print("\nTest 29: Update order without auth")
if guest_order_id:
    resp = requests.put(f"{API_URL}/admin/orders/{guest_order_id}", json={"status": "shipped"})
    test29_pass = resp.status_code == 401
    print_test("PUT /api/admin/orders/:id (no auth)", test29_pass, 
               f"Status: {resp.status_code}")
else:
    print_test("PUT /api/admin/orders/:id (no auth)", False, "No order ID available")

# Test 30: PUT /api/admin/orders/:id as customer
print("\nTest 30: Update order as customer")
if guest_order_id:
    resp = requests.put(f"{API_URL}/admin/orders/{guest_order_id}",
                        headers={"Authorization": f"Bearer {customer_token}"},
                        json={"status": "shipped"})
    test30_pass = resp.status_code == 403
    print_test("PUT /api/admin/orders/:id (customer)", test30_pass, 
               f"Status: {resp.status_code}")
else:
    print_test("PUT /api/admin/orders/:id (customer)", False, "No order ID available")

# Test 31: PUT /api/admin/orders/:id as admin
print("\nTest 31: Update order as admin")
admin_token, _ = admin_login()
if guest_order_id:
    resp = requests.put(f"{API_URL}/admin/orders/{guest_order_id}",
                        headers={"Authorization": f"Bearer {admin_token}"},
                        json={
                            "status": "shipped",
                            "trackingCode": "ABC123",
                            "trackingCarrier": "Yurtici Kargo",
                            "note": "Paketlendi ve kargoya verildi"
                        })
    test31_pass = resp.status_code == 200
    if test31_pass:
        order = resp.json().get("order", {})
        test31_pass = (order.get("status") == "shipped" and
                       order.get("trackingCode") == "ABC123" and
                       order.get("trackingCarrier") == "Yurtici Kargo" and
                       len(order.get("statusHistory", [])) == 2)
    print_test("PUT /api/admin/orders/:id (admin)", test31_pass, 
               f"Status: {resp.status_code}, statusHistory now has 2 entries, tracking fields updated")
else:
    print_test("PUT /api/admin/orders/:id (admin)", False, "No order ID available")

# Test 32: PUT /api/admin/orders/:id with same status (no change)
print("\nTest 32: Update order with same status (statusHistory should not grow)")
if guest_order_id:
    resp = requests.put(f"{API_URL}/admin/orders/{guest_order_id}",
                        headers={"Authorization": f"Bearer {admin_token}"},
                        json={"trackingCode": "XYZ789"})
    test32_pass = resp.status_code == 200
    if test32_pass:
        order = resp.json().get("order", {})
        test32_pass = len(order.get("statusHistory", [])) == 2  # Should still be 2
    print_test("PUT /api/admin/orders/:id (same status)", test32_pass, 
               f"Status: {resp.status_code}, statusHistory did not grow")
else:
    print_test("PUT /api/admin/orders/:id (same status)", False, "No order ID available")

# ============================================================================
# BLOG (Phase 5)
# ============================================================================
print("\n--- BLOG (Phase 5) ---\n")

# Test 33: GET /api/blog (public)
print("\nTest 33: Get published blog posts")
resp = requests.get(f"{API_URL}/blog")
test33_pass = resp.status_code == 200 and "posts" in resp.json()
if test33_pass:
    posts = resp.json().get("posts", [])
    # All should be published
    test33_pass = all(p.get("isPublished") == True for p in posts)
print_test("GET /api/blog (public)", test33_pass, 
           f"Status: {resp.status_code}, All posts are published: {test33_pass}")

# Test 34: POST /api/admin/blog as admin
print("\nTest 34: Create blog post as admin")
resp = requests.post(f"{API_URL}/admin/blog",
                     headers={"Authorization": f"Bearer {admin_token}"},
                     json={
                         "title": "Test Blog Post",
                         "slug": "test-blog-post",
                         "content": "This is a test blog post content.",
                         "excerpt": "Test excerpt",
                         "isPublished": True,
                         "category": "Test"
                     })
test34_pass = resp.status_code == 200
blog_id = None
blog_slug = None
if test34_pass:
    post = resp.json().get("post", {})
    test34_pass = post.get("publishedAt") is not None  # Should be set
    blog_id = post.get("id")
    blog_slug = post.get("slug")
print_test("POST /api/admin/blog (admin)", test34_pass, 
           f"Status: {resp.status_code}, publishedAt set: {test34_pass}")

# Test 35: GET /api/blog/:slug (public)
print("\nTest 35: Get blog post by slug")
if blog_slug:
    resp = requests.get(f"{API_URL}/blog/{blog_slug}")
    test35_pass = resp.status_code == 200 and resp.json().get("post", {}).get("slug") == blog_slug
    print_test("GET /api/blog/:slug", test35_pass, 
               f"Status: {resp.status_code}")
else:
    print_test("GET /api/blog/:slug", False, "No blog slug available")

# Test 36: POST /api/admin/blog without auth
print("\nTest 36: Create blog post without auth")
resp = requests.post(f"{API_URL}/admin/blog", json={"title": "Test"})
test36_pass = resp.status_code == 401
print_test("POST /api/admin/blog (no auth)", test36_pass, 
           f"Status: {resp.status_code}")

# Test 37: POST /api/admin/blog as customer
print("\nTest 37: Create blog post as customer")
resp = requests.post(f"{API_URL}/admin/blog",
                     headers={"Authorization": f"Bearer {customer_token}"},
                     json={"title": "Test"})
test37_pass = resp.status_code == 403
print_test("POST /api/admin/blog (customer)", test37_pass, 
           f"Status: {resp.status_code}")

# Test 38: PUT /api/admin/blog/:id toggling isPublished false->true
print("\nTest 38: Toggle blog post isPublished false->true")
# First create unpublished post
resp = requests.post(f"{API_URL}/admin/blog",
                     headers={"Authorization": f"Bearer {admin_token}"},
                     json={
                         "title": "Unpublished Post",
                         "slug": "unpublished-post",
                         "content": "Content",
                         "isPublished": False
                     })
unpublished_id = resp.json().get("post", {}).get("id") if resp.status_code == 200 else None

if unpublished_id:
    # Verify publishedAt is null
    resp = requests.get(f"{API_URL}/admin/blog",
                        headers={"Authorization": f"Bearer {admin_token}"})
    posts = resp.json().get("posts", [])
    unpub_post = next((p for p in posts if p["id"] == unpublished_id), None)
    test38a_pass = unpub_post and unpub_post.get("publishedAt") is None
    print(f"   Unpublished post has publishedAt=null: {test38a_pass}")
    
    # Now toggle to published
    resp = requests.put(f"{API_URL}/admin/blog/{unpublished_id}",
                        headers={"Authorization": f"Bearer {admin_token}"},
                        json={"isPublished": True})
    test38_pass = resp.status_code == 200
    if test38_pass:
        post = resp.json().get("post", {})
        test38_pass = post.get("publishedAt") is not None
    print_test("PUT /api/admin/blog/:id (toggle published)", test38_pass, 
               f"Status: {resp.status_code}, publishedAt now set: {test38_pass}")
else:
    print_test("PUT /api/admin/blog/:id (toggle published)", False, "Could not create unpublished post")

# Test 39: PUT /api/admin/blog/:id updating title
print("\nTest 39: Update blog post title")
if blog_id:
    resp = requests.put(f"{API_URL}/admin/blog/{blog_id}",
                        headers={"Authorization": f"Bearer {admin_token}"},
                        json={"title": "Updated Test Blog Post"})
    test39_pass = resp.status_code == 200
    if test39_pass:
        post = resp.json().get("post", {})
        test39_pass = post.get("title") == "Updated Test Blog Post"
    print_test("PUT /api/admin/blog/:id (update title)", test39_pass, 
               f"Status: {resp.status_code}")
else:
    print_test("PUT /api/admin/blog/:id (update title)", False, "No blog ID available")

# Test 40: DELETE /api/admin/blog/:id
print("\nTest 40: Delete blog post")
if blog_id:
    resp = requests.delete(f"{API_URL}/admin/blog/{blog_id}",
                          headers={"Authorization": f"Bearer {admin_token}"})
    test40_pass = resp.status_code == 200
    print_test("DELETE /api/admin/blog/:id", test40_pass, 
               f"Status: {resp.status_code}")
    
    # Verify it's gone
    if blog_slug:
        resp = requests.get(f"{API_URL}/blog/{blog_slug}")
        test40b_pass = resp.status_code == 404
        print_test("Blog post removed (404 on GET)", test40b_pass)
else:
    print_test("DELETE /api/admin/blog/:id", False, "No blog ID available")

# ============================================================================
# SEO ROUTES (Phase 5)
# ============================================================================
print("\n--- SEO ROUTES (Phase 5) ---\n")

# Test 41: GET /sitemap.xml
print("\nTest 41: Get sitemap.xml")
resp = requests.get(f"{BASE_URL}/sitemap.xml")
test41_pass = resp.status_code == 200
if test41_pass:
    content_type = resp.headers.get("Content-Type", "")
    body = resp.text
    test41_pass = ("xml" in content_type.lower() and
                   "<?xml" in body and
                   "<urlset" in body and
                   "<url>" in body and
                   "<loc>" in body)
print_test("GET /sitemap.xml", test41_pass, 
           f"Status: {resp.status_code}, Content-Type: {resp.headers.get('Content-Type')}, Has XML structure: {test41_pass}")

# Test 42: GET /robots.txt
print("\nTest 42: Get robots.txt")
resp = requests.get(f"{BASE_URL}/robots.txt")
test42_pass = resp.status_code == 200
if test42_pass:
    content_type = resp.headers.get("Content-Type", "")
    body = resp.text
    test42_pass = ("text/plain" in content_type.lower() and
                   "Disallow: /admin" in body and
                   "Sitemap:" in body)
print_test("GET /robots.txt", test42_pass, 
           f"Status: {resp.status_code}, Content-Type: {resp.headers.get('Content-Type')}, Has Disallow rules: {test42_pass}")

print("\n" + "="*80)
print("BACKEND TESTING COMPLETE")
print("="*80 + "\n")
