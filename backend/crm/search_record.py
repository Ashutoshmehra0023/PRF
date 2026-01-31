import requests
import json

print("🔥 search_record.py FILE LOADED")

# =========================
# ZOHO CONFIG
# =========================
ACCOUNTS_URL = "https://accounts.zoho.com/oauth/v2/token"
API_DOMAIN = "https://www.zohoapis.com"

CLIENT_ID = "1000.ATYQ0KSXQ58G7EWKHFSQPMSYSEFOUT"
CLIENT_SECRET = "4cd951021120f317e8b19a0d3858bdb1180f993711"
REFRESH_TOKEN = "1000.906d7c4dc62654af7b06e8c42edac538.6d35cda994b422fec318b6d430854785"


# =========================
# GET ACCESS TOKEN
# =========================
def get_access_token():
    payload = {
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": REFRESH_TOKEN,
    }

    res = requests.post(ACCOUNTS_URL, data=payload)
    data = res.json()

    if "access_token" not in data:
        raise Exception("❌ Failed to get access token")

    return data["access_token"]


# =========================
# ✅ NEW: GET PRODUCT GROUP ID BY NAME
# =========================
def get_product_group_id(group_name):
    """
    Lookup Product_Group ID by name from Zoho CRM Product_Groups module
    
    Args:
        group_name (str): Product group name like "IT", "VERACITY PRODUCTS", etc.
    
    Returns:
        str: Product_Group ID or None if not found
    
    Example:
        get_product_group_id("VERACITY PRODUCTS") → "4730012000047947131"
    """
    try:
        print(f"\n🔍 Looking up Product_Group ID for: '{group_name}'")
        
        access_token = get_access_token()
        headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}

        group_name = group_name.strip()

        # Search Product_Groups module by Name
        search_url = (
            f"{API_DOMAIN}/crm/v8/Product_Groups/search"
            f"?word={group_name}"
        )

        print(f"   📡 API URL: {search_url}")

        response = requests.get(search_url, headers=headers)
        print(f"   📊 Status: {response.status_code}")

        if response.status_code != 200:
            print(f"   ❌ API Error: {response.text}")
            return None

        data = response.json()

        # Check if we got results
        if data.get("data") and len(data["data"]) > 0:
            # Get the first matching Product_Group
            product_group = data["data"][0]
            group_id = product_group.get("id")
            group_name_from_api = product_group.get("Name")
            
            print(f"   ✅ Found Product_Group:")
            print(f"      Name: {group_name_from_api}")
            print(f"      ID: {group_id}")
            
            return group_id
        else:
            print(f"   ⚠️  No Product_Group found with name: '{group_name}'")
            return None

    except Exception as e:
        print(f"   ❌ Lookup error: {e}")
        import traceback
        print(traceback.format_exc())
        return None


# =========================
# PRODUCT SEARCH BY PRODUCT GROUP (FOR CACHING)
# =========================
def search_products_by_group(product_group):
    """
    Search all products by Product_Group for caching
    Returns: List of all products in that group with code and name
    """
    try:
        print(f"\n🔍 Fetching ALL products for group: '{product_group}'")
        
        access_token = get_access_token()
        headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}

        product_group = product_group.strip()

        # Search by Product_Group field
        search_url = (
            f"{API_DOMAIN}/crm/v8/Products/search"
            f"?criteria=(Product_Group:equals:{product_group})"
        )

        print(f"   📡 API URL: {search_url}")

        response = requests.get(search_url, headers=headers)
        print(f"   📊 Status: {response.status_code}")

        if response.status_code != 200:
            print(f"   ❌ API Error: {response.text}")
            return []

        data = response.json()

        results = []
        for rec in data.get("data", []):
            results.append({
                "id": rec.get("id"),
                "product_code": rec.get("Product_Code"),
                "product_name": rec.get("Product_Name"),
                "product_group": rec.get("Product_Group"),
            })

        print(f"   ✅ Found {len(results)} products in group '{product_group}'")
        
        return results

    except Exception as e:
        print(f"   ❌ Search error: {e}")
        return []


# =========================
# PRODUCT SEARCH BY CODE (FOR API)
# =========================
def search_product_by_code(product_code):
    """
    Search products by Product_Code (starts_with)
    Returns: List of matching products with id, code, and name
    """
    try:
        print(f"\n🔍 Searching products for code: '{product_code}'")
        
        access_token = get_access_token()
        headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}

        product_code = product_code.strip()

        search_url = (
            f"{API_DOMAIN}/crm/v8/Products/search"
            f"?criteria=(Product_Code:starts_with:{product_code})"
        )

        print(f"   📡 API URL: {search_url}")

        response = requests.get(search_url, headers=headers)
        print(f"   📊 Status: {response.status_code}")

        if response.status_code != 200:
            print(f"   ❌ API Error: {response.text}")
            return []

        data = response.json()

        results = []
        for rec in data.get("data", []):
            results.append({
                "id": rec.get("id"),
                "product_code": rec.get("Product_Code"),
                "product_name": rec.get("Product_Name"),
            })

        print(f"   ✅ Found {len(results)} matches")
        for r in results:
            print(f"      • {r['product_code']} → {r['product_name']}")

        return results

    except Exception as e:
        print(f"   ❌ Search error: {e}")
        return []


# =========================
# PRODUCT SEARCH (LEGACY - FOR TESTING)
# =========================
def search_product(search_text):
    print(f"\n🔍 USER SEARCH TEXT: '{search_text}'")

    access_token = get_access_token()
    headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}

    search_text = search_text.strip()

    search_url = (
        f"{API_DOMAIN}/crm/v8/Products/search"
        f"?criteria=(Product_Code:starts_with:{search_text})"
    )

    print("\n📡 SEARCH URL:")
    print(search_url)

    response = requests.get(search_url, headers=headers)
    print("📊 STATUS:", response.status_code)

    try:
        data = response.json()
    except Exception:
        print("❌ Non-JSON response from Zoho")
        print(response.text)
        return []

    print("\n📄 RESPONSE:")
    print(json.dumps(data, indent=2))

    results = []
    for rec in data.get("data", []):
        results.append({
            "id": rec.get("id"),
            "Product_Code": rec.get("Product_Code"),
            "Product_Name": rec.get("Product_Name"),
        })

    print(f"\n✅ TOTAL MATCHES: {len(results)}")
    for r in results:
        print(f"✔ {r['Product_Code']} → {r['Product_Name']}")

    return results


# =========================
# MAIN (FOR TESTING)
# =========================
if __name__ == "__main__":
    print("\n===============================")
    print("🧪 TESTING PRODUCT GROUP ID LOOKUP")
    print("===============================")

    # Test 1: Get Product_Group ID
    print("\n📦 TEST 1: Get Product_Group ID")
    group_id = get_product_group_id("VERACITY PRODUCTS")
    print(f"✅ Product_Group 'VERACITY PRODUCTS' → ID: {group_id}")

    # Test 2: Try another group
    print("\n📦 TEST 2: Try another group")
    group_id2 = get_product_group_id("SYSTEM INTEGRATION")
    print(f"✅ Product_Group 'SYSTEM INTEGRATION' → ID: {group_id2}")

    print("\n===============================")
    print("🧪 TESTING PRODUCT SEARCH")
    print("===============================")

    # Test 3: Search by Product Group
    print("\n📦 TEST 3: Search products by group")
    products = search_products_by_group("VERACITY PRODUCTS")
    print(f"✅ Returned {len(products)} products")

    # Test 4: Search by Code (LEGACY)
    print("\n📦 TEST 4: Search by Product_Code")
    search_product("SI0011912")

    print("\n✅ SCRIPT FINISHED")