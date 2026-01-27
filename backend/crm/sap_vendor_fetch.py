import requests
from requests.exceptions import RequestException

# === CONFIG ===
TOKEN_URL = "http://sap.cavitak.in:5050/api/tokens"
DATA_URL = "http://sap.cavitak.in:5050/api/zohocrm/getviewsdatas"

LOGIN_BODY = {
    "email": "zohocrm@sapdata",
    "password": "9JBLPa$$word!",
}

LOGIN_HEADERS = {
    "Content-Type": "application/json",
    "tenant": "root",
}


def fetch_final_vendor_list():
    try:
        # 🔐 Step 1: Get Token
        token_res = requests.post(
            TOKEN_URL,
            json=LOGIN_BODY,
            headers=LOGIN_HEADERS,
            timeout=20,
        )
        token_res.raise_for_status()

        token = token_res.json().get("token")
        if not token:
            raise ValueError("Token not received")

        print("✅ Token received")

        # 📦 Step 2: Fetch Vendor Master Data
        body = {
            "companyIdName": "CMPL",
            "viewName": "CSK_API_ALLCOMPANYVENDORMASTER",
            "filters": "$Company$ = 'CMPL'",
        }

        data_res = requests.post(
            DATA_URL,
            json=body,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "tenant": "root",
            },
            timeout=60,
        )
        data_res.raise_for_status()

        raw_data = data_res.json()

        # 📊 Normalize response
        if isinstance(raw_data, list):
            records = raw_data
        elif isinstance(raw_data, dict) and isinstance(raw_data.get("data"), list):
            records = raw_data["data"]
        else:
            records = []

        print("📊 Total raw records:", len(records))

        # ===============================
        # ✅ FINAL FILTER FOR DROPDOWN
        # ===============================
        vendor_set = set()

        for rec in records:
            if not isinstance(rec, dict):
                continue

            name = rec.get("Bp_Name")
            if not name:
                continue

            name_str = str(name).strip()

            if "-SI" in name_str.upper():
                vendor_set.add(name_str)

        vendor_list = sorted(vendor_set)

        print("📊 Total vendors for dropdown:", len(vendor_list))

        return vendor_list

    except (RequestException, ValueError) as exc:
        print("❌ Fetch failed:", str(exc))
        return []


def search_vendors(search_query):
    """
    Search vendors by keyword from SAP
    Applies ALL existing filters:
    - Company = CMPL
    - Contains -SI
    - No duplicates
    - Then filters by search keyword
    
    Returns: List of matching vendor names
    """
    try:
        # ✅ STEP 1: Get Token
        print(f"\n🔍 Starting vendor search for: '{search_query}'")
        
        token_res = requests.post(
            TOKEN_URL,
            json=LOGIN_BODY,
            headers=LOGIN_HEADERS,
            timeout=20,
        )
        token_res.raise_for_status()

        token = token_res.json().get("token")
        if not token:
            raise ValueError("Token not received")

        print("   ✅ Token received")

        # ✅ STEP 2: Fetch Vendor Master Data with CMPL filter
        body = {
            "companyIdName": "CMPL",  # ← Keep CMPL filter
            "viewName": "CSK_API_ALLCOMPANYVENDORMASTER",
            "filters": "$Company$ = 'CMPL'",  # ← Keep company filter
        }

        data_res = requests.post(
            DATA_URL,
            json=body,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "tenant": "root",
            },
            timeout=60,
        )
        data_res.raise_for_status()

        raw_data = data_res.json()

        # ✅ STEP 3: Normalize response
        if isinstance(raw_data, list):
            records = raw_data
        elif isinstance(raw_data, dict) and isinstance(raw_data.get("data"), list):
            records = raw_data["data"]
        else:
            records = []

        print(f"   📊 Total raw records: {len(records)}")

        # ✅ STEP 4: Apply existing filters (CMPL, -SI, no duplicates)
        vendor_set = set()  # ← Removes duplicates automatically

        for rec in records:
            if not isinstance(rec, dict):
                continue

            name = rec.get("Bp_Name")
            if not name:
                continue

            name_str = str(name).strip()

            # ✅ Keep -SI filter
            if "-SI" in name_str.upper():
                vendor_set.add(name_str)

        print(f"   📊 After -SI filter: {len(vendor_set)} vendors")

        # ✅ STEP 5: NOW apply search filter
        if not search_query or len(search_query) < 3:
            # If query too short, return first 20 vendors
            vendor_list = sorted(vendor_set)[:20]
            print(f"   ⚠️  Query too short, returning first 20 vendors")
        else:
            # Filter by search query (case-insensitive)
            search_lower = search_query.lower()
            matched_vendors = [
                vendor for vendor in vendor_set 
                if search_lower in vendor.lower()
            ]
            vendor_list = sorted(matched_vendors)[:20]  # Max 20 results
            print(f"   ✅ Search results: {len(matched_vendors)} matches, returning {len(vendor_list)}")
        
        return vendor_list
        
    except (RequestException, ValueError) as exc:
        print(f"   ❌ Search failed: {exc}")
        return []


# ===============================
# 🔥 DIRECT SCRIPT EXECUTION
# ===============================
if __name__ == "__main__":
    print("🚀 Script started")

    vendors = fetch_final_vendor_list()

    print("\n📦 FINAL VENDOR LIST (FOR DROPDOWN):")
    for i, name in enumerate(vendors, start=1):
        print(f"{i}. {name}")

    print("\n✅ Script finished")