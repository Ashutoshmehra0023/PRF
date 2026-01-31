import requests
import json
import uuid
from datetime import date

# Import the new Product_Group ID lookup function
from .search_record import get_product_group_id

# =========================
# ZOHO CONFIG
# =========================
ACCOUNTS_URL = "https://accounts.zoho.com/oauth/v2/token"
CRM_URL = "https://www.zohoapis.com/crm/v8/Purchase_Orders"

CLIENT_ID = "1000.ATYQ0KSXQ58G7EWKHFSQPMSYSEFOUT"
CLIENT_SECRET = "4cd951021120f317e8b19a0d3858bdb1180f993711"
REFRESH_TOKEN = "1000.906d7c4dc62654af7b06e8c42edac538.6d35cda994b422fec318b6d430854785"


# =========================
# HELPER FUNCTIONS
# =========================
def safe_float(value, default=0.0):
    """
    Safely convert value to float, handling empty strings and invalid values
    """
    if value is None or value == "":
        return default
    
    try:
        return float(value)
    except (ValueError, TypeError):
        print(f"   ⚠️  Could not convert '{value}' to float, using default: {default}")
        return default


def safe_int(value, default=1):
    """
    Safely convert value to int, handling empty strings and invalid values
    """
    if value is None or value == "":
        return default
    
    try:
        return int(value)
    except (ValueError, TypeError):
        print(f"   ⚠️  Could not convert '{value}' to int, using default: {default}")
        return default


# =========================
# ACCESS TOKEN
# =========================
def get_access_token():
    print("\n" + "="*60)
    print("🔐 GETTING ZOHO ACCESS TOKEN")
    print("="*60)
    
    payload = {
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": REFRESH_TOKEN
    }

    res = requests.post(ACCOUNTS_URL, data=payload)
    data = res.json()
    
    print(f"✅ Token Request Status: {res.status_code}")
    print(f"📄 Token Response: {json.dumps(data, indent=2)}")

    if "access_token" not in data:
        print("❌ FAILED to generate access token")
        raise Exception("Failed to generate access token")
    
    print("✅ Access Token Generated Successfully")
    return data["access_token"]


# =========================
# SEARCH PRODUCT BY NAME OR ID
# =========================
def get_product_id_by_name(product_name, access_token):
    """Search Zoho for product by name or validate and use ID directly"""
    
    # If product_name is empty, use default
    if not product_name or product_name.strip() == "":
        print(f"\n⚠️  Empty product name, using default ID")
        return "4730012000032914734"
    
    # Check if it's an ID (all digits)
    if str(product_name).isdigit():
        print(f"\n🔍 Validating Product ID: {product_name}")
        
        # Validate the ID by fetching the product
        validate_url = f"https://www.zohoapis.com/crm/v8/Products/{product_name}"
        headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}
        
        try:
            res = requests.get(validate_url, headers=headers)
            data = res.json()
            
            print(f"   Status: {res.status_code}")
            
            if res.status_code == 200 and data.get("data"):
                product_info = data["data"][0]
                print(f"   ✅ Product ID is valid: {product_info.get('Product_Name', 'Unknown')}")
                return str(product_name)
            else:
                print(f"   ❌ Product ID not found in Zoho CRM, using default")
                print(f"   Response: {json.dumps(data, indent=2)}")
                return "4730012000032914734"  # fallback default
                
        except Exception as e:
            print(f"   ❌ Error validating product ID: {e}")
            return "4730012000032914734"
    
    # Otherwise, search by name
    print(f"\n🔍 Searching for product by name: '{product_name}'")
    
    # URL encode the product name for search
    search_url = f"https://www.zohoapis.com/crm/v8/Products/search?criteria=(Product_Name:equals:{product_name})"
    headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}
    
    try:
        res = requests.get(search_url, headers=headers)
        data = res.json()
        
        print(f"   Status: {res.status_code}")
        print(f"   Response: {json.dumps(data, indent=2)}")
        
        if data.get("data"):
            product_id = data["data"][0]["id"]
            print(f"   ✅ Found Product ID: {product_id}")
            return product_id
        else:
            print(f"   ⚠️  Product not found, using default ID")
            return "4730012000032914734"  # fallback default
            
    except Exception as e:
        print(f"   ❌ Error searching product: {e}")
        return "4730012000032914734"


# =========================
# SEARCH VENDOR BY NAME OR ID
# =========================
def get_vendor_id_by_name(vendor_name, access_token):
    """Search Zoho for vendor by name or validate and use ID directly"""
    
    # If vendor_name is empty, return None
    if not vendor_name or vendor_name.strip() == "":
        print(f"\n⚠️  Empty vendor name")
        return None
    
    # Check if it's an ID (all digits)
    if str(vendor_name).isdigit():
        print(f"\n🔍 Validating Vendor ID: {vendor_name}")
        
        # Validate the ID by fetching the vendor
        validate_url = f"https://www.zohoapis.com/crm/v8/Vendors/{vendor_name}"
        headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}
        
        try:
            res = requests.get(validate_url, headers=headers)
            data = res.json()
            
            print(f"   Status: {res.status_code}")
            
            if res.status_code == 200 and data.get("data"):
                vendor_info = data["data"][0]
                print(f"   ✅ Vendor ID is valid: {vendor_info.get('Vendor_Name', 'Unknown')}")
                return str(vendor_name)
            else:
                print(f"   ❌ Vendor ID not found in Zoho CRM")
                print(f"   Response: {json.dumps(data, indent=2)}")
                return None
                
        except Exception as e:
            print(f"   ❌ Error validating vendor ID: {e}")
            return None
    
    # Otherwise, search by name
    print(f"\n🔍 Searching for vendor by name: '{vendor_name}'")
    
    search_url = f"https://www.zohoapis.com/crm/v8/Vendors/search?criteria=(Vendor_Name:equals:{vendor_name})"
    headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}
    
    try:
        res = requests.get(search_url, headers=headers)
        data = res.json()
        
        print(f"   Status: {res.status_code}")
        print(f"   Response: {json.dumps(data, indent=2)}")
        
        if data.get("data"):
            vendor_id = data["data"][0]["id"]
            print(f"   ✅ Found Vendor ID: {vendor_id}")
            return vendor_id
        else:
            print(f"   ⚠️  Vendor not found")
            return None
            
    except Exception as e:
        print(f"   ❌ Error searching vendor: {e}")
        return None


# =========================
# MAIN INSERT FUNCTION
# =========================
def insert_prf_to_crm(prf):
    """
    prf = FULL payload received from React form
    """
    
    print("\n" + "="*60)
    print("🚀 STARTING PRF INSERTION TO ZOHO CRM")
    print("="*60)
    
    print("\n📦 RECEIVED PAYLOAD FROM FRONTEND:")
    print(json.dumps(prf, indent=2))
    
    # Get access token
    access_token = get_access_token()

    headers = {
        "Authorization": f"Zoho-oauthtoken {access_token}",
        "Content-Type": "application/json"
    }

    # =========================
    # UNIQUE PRF / PO NUMBER
    # =========================
    unique_prf_no = f"PRF-{uuid.uuid4().hex[:8].upper()}"
    print(f"\n🆔 Generated PRF Number: {unique_prf_no}")

    # =========================
    # ✅ NEW: CONVERT PRODUCT_GROUP STRING TO ID
    # =========================
    product_group_name = prf.get("productGroup", "")
    product_group_id = None
    
    print("\n" + "="*60)
    print("🔄 CONVERTING PRODUCT_GROUP TO ID")
    print("="*60)
    print(f"📦 Product Group from frontend: '{product_group_name}'")
    
    if product_group_name and product_group_name.strip() != "":
        try:
            product_group_id = get_product_group_id(product_group_name)
            
            if product_group_id:
                print(f"   ✅ Successfully converted to ID: {product_group_id}")
            else:
                print(f"   ⚠️  Could not find Product_Group ID, will use string as fallback")
                product_group_id = product_group_name  # Fallback to original string
        except Exception as e:
            print(f"   ❌ Error looking up Product_Group ID: {e}")
            print(f"   ⚠️  Using original string as fallback")
            product_group_id = product_group_name  # Fallback to original string
    else:
        print(f"   ⚠️  No Product_Group provided")
        product_group_id = None

    # =========================
    # BUILD LINE ITEMS
    # =========================
    print("\n" + "="*60)
    print("📋 PROCESSING LINE ITEMS")
    print("="*60)
    purchase_items = []

    for idx, item in enumerate(prf.get("items", []), 1):
        print(f"\n   Item {idx}:")
        print(f"   - Product Name: {item.get('productName', 'N/A')}")
        print(f"   - Quantity: {item.get('quantity', 0)}")
        print(f"   - Unit Rate: {item.get('unitRate', 0)}")
        print(f"   - Discount: {item.get('discount', 0)}")
        
        # Get product ID dynamically
        product_id = get_product_id_by_name(item.get("productName", ""), access_token)
        
        purchase_items.append({
            "Product_Name": {
                "id": product_id
            },
            "Quantity": safe_int(item.get("quantity"), 1),
            "Rate": safe_float(item.get("unitRate"), 0),
            "Discount": safe_float(item.get("discount"), 0)
        })

    print(f"\n✅ Total Items Processed: {len(purchase_items)}")

    # =========================
    # GET VENDOR ID (COMMENTED OUT AS PER ORIGINAL)
    # =========================
    # vendor_name = prf.get("vendor", "")
    # vendor_id = None
    
    # if vendor_name:
    #     vendor_id = get_vendor_id_by_name(vendor_name, access_token)
    
    # if not vendor_id:
    #     error_msg = f"Vendor '{vendor_name}' not found in Zoho CRM. Please provide a valid vendor name or ID."
    #     print(f"\n❌ ERROR: {error_msg}")
    #     return {
    #         "status_code": 400,
    #         "zoho_response": {"error": error_msg},
    #         "generated_prf_no": unique_prf_no,
    #         "success": False
    #     }

    # =========================
    # FINAL ZOHO PAYLOAD
    # =========================

    FIXED_VENDOR_LOOKUP_ID = "4730012000032844003"

    print("\n" + "="*60)
    print("📤 BUILDING ZOHO CRM PAYLOAD")
    print("="*60)
    
    payload = {
        "data": [
            {
                # ===== BASIC =====
                "Subject": f"PRF from {prf.get('email', 'Unknown')}",
                "PO_Number": unique_prf_no,
                "Requisition_No": unique_prf_no,
                "PO_Date": str(date.today()),
                
                # ✅ UPDATED: Use Product_Group ID instead of string
                "Product_Group": product_group_id,  # Now sends ID like "4730012000047947131"

                # ===== VENDOR (FINAL CORRECT MAPPING) =====
                "Vendor_Name": {
                    "id": FIXED_VENDOR_LOOKUP_ID   # 🔒 FIXED LOOKUP
                },
                "Vendor": prf.get("vendor", ""),  # 🧾 SAP dropdown selected value

                # ===== FINANCIALS =====
                "Discount": safe_float(prf.get("bulkDiscount"), 0),
                "Terms_and_Conditions": prf.get("paymentTerms", ""),
                "Description": prf.get("poRemarks", ""),
                "Adjustment": safe_float(prf.get("purchaseTotal"), 0),

                # ===== BILLING / SHIPPING =====
                "Billing_Street": prf.get("directShipAddress", ""),
                "Billing_City": prf.get("warehouseBillingLocation", ""),
                "Billing_State": "",
                "Billing_Country": "India",
                
                "Shipping_Street": prf.get("directShipAddress", ""),
                "Shipping_City": prf.get("warehouseShippingLocation", ""),
                "Shipping_State": "",
                "Shipping_Country": "India",

                # ===== ITEMS =====
                "Purchase_Items": purchase_items,

                # ===== LAYOUT =====
                "Layout": {
                    "id": "4730012000047658039"
                }
            }
        ]
    }

    print("\n📄 FINAL ZOHO PAYLOAD:")
    print(json.dumps(payload, indent=2))

    # =========================
    # SEND TO ZOHO CRM
    # =========================
    print("\n" + "="*60)
    print("📡 SENDING REQUEST TO ZOHO CRM")
    print("="*60)
    print(f"URL: {CRM_URL}")
    
    response = requests.post(CRM_URL, headers=headers, json=payload)
    
    print(f"\n📊 RESPONSE STATUS CODE: {response.status_code}")
    print(f"\n📄 ZOHO CRM RESPONSE:")
    print(json.dumps(response.json(), indent=2))

    # =========================
    # RETURN RESULT
    # =========================
    result = {
        "status_code": response.status_code,
        "zoho_response": response.json(),
        "generated_prf_no": unique_prf_no,
        "success": response.status_code in [200, 201]
    }
    
    print("\n" + "="*60)
    if result["success"]:
        print("✅ PRF SUCCESSFULLY INSERTED INTO ZOHO CRM")
    else:
        print("❌ PRF INSERTION FAILED")
    print("="*60)
    
    return result


# =========================
# MANUAL TEST (OPTIONAL)
# =========================
if __name__ == "__main__":
    dummy = {
        "email": "test@company.com",
        "productGroup": "VERACITY PRODUCTS",  # ✅ Updated to match real Product_Group name
        "vendor": "Test Vendor",
        "currency": "INR",
        "bulkDiscount": "50",
        "paymentTerms": "Pay in 30 days",
        "purchaseTotal": "5000",
        "directShipAddress": "123 Test Street, Test City",
        "warehouseBillingLocation": "Mumbai",
        "warehouseShippingLocation": "Delhi",
        "items": [
            {
                "productName": "Test Product 1",
                "quantity": "2",
                "unitRate": "2000",
                "discount": "10"
            },
            {
                "productName": "Test Product 2",
                "quantity": "5",
                "unitRate": "500",
                "discount": "5"
            }
        ]
    }

    print("\n🧪 RUNNING MANUAL TEST")
    result = insert_prf_to_crm(dummy)
    
    print("\n" + "="*60)
    print("🎯 FINAL RESULT:")
    print("="*60)
    print(json.dumps(result, indent=2))