import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .test_insert import insert_prf_to_crm


@csrf_exempt
def create_prf(request):
    """
    API endpoint to create Purchase Request Form in Zoho CRM
    """
    
    print("\n" + "🌟"*30)
    print("🔔 NEW PRF REQUEST RECEIVED")
    print("🌟"*30)
    
    # ❌ Only POST allowed
    if request.method != "POST":
        print(f"❌ Invalid Method: {request.method}")
        return JsonResponse(
            {"error": "Only POST allowed"},
            status=405
        )

    try:
        # Parse JSON from React
        payload = json.loads(request.body)

        print("\n📥 REQUEST DETAILS:")
        print(f"   - Method: {request.method}")
        print(f"   - Content-Type: {request.content_type}")
        print(f"   - Content-Length: {len(request.body)} bytes")
        
        print("\n📦 PAYLOAD RECEIVED FROM FRONTEND:")
        print("="*60)
        print(json.dumps(payload, indent=2))
        print("="*60)

        # Validate required fields
        print("\n✅ VALIDATING PAYLOAD:")
        required_fields = ["email", "vendor", "currency"]
        missing_fields = [field for field in required_fields if not payload.get(field)]
        
        if missing_fields:
            print(f"❌ Missing required fields: {missing_fields}")
            return JsonResponse({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }, status=400)
        
        print("   ✅ All required fields present")

        # Call CRM insert function
        print("\n🚀 CALLING ZOHO CRM INTEGRATION...")
        crm_response = insert_prf_to_crm(payload)

        print("\n📨 CRM RESPONSE RECEIVED:")
        print("="*60)
        print(json.dumps(crm_response, indent=2))
        print("="*60)

        # Check if insertion was successful
        if crm_response.get("success"):
            print("\n✅ PRF CREATED SUCCESSFULLY")
            
            response_data = {
                "success": True,
                "message": "PRF created successfully in Zoho CRM",
                "crm_response": crm_response,
                "prf_number": crm_response.get("generated_prf_no"),
                "zoho_status": crm_response.get("status_code")
            }
            
            print("\n📤 SENDING SUCCESS RESPONSE TO FRONTEND:")
            print(json.dumps(response_data, indent=2))
            
            return JsonResponse(response_data)
        else:
            print("\n❌ PRF CREATION FAILED")
            
            error_response = {
                "success": False,
                "message": "Failed to create PRF in Zoho CRM",
                "crm_response": crm_response,
                "error_details": crm_response.get("zoho_response", {})
            }
            
            print("\n📤 SENDING ERROR RESPONSE TO FRONTEND:")
            print(json.dumps(error_response, indent=2))
            
            return JsonResponse(error_response, status=400)

    except json.JSONDecodeError as e:
        print(f"\n❌ JSON DECODE ERROR: {e}")
        return JsonResponse({
            "success": False,
            "error": "Invalid JSON format",
            "details": str(e)
        }, status=400)
        
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        print(f"   Error Type: {type(e).__name__}")
        
        import traceback
        print("\n📋 FULL TRACEBACK:")
        print(traceback.format_exc())
        
        return JsonResponse({
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }, status=500)
    
    finally:
        print("\n" + "🌟"*30)
        print("🏁 REQUEST PROCESSING COMPLETED")
        print("🌟"*30 + "\n")


@csrf_exempt
def search_vendors(request):
    """
    API endpoint to search vendors by keyword from SAP
    GET /api/vendors/search/?q=search_keyword
    """
    
    print("\n" + "🔍"*30)
    print("🔔 VENDOR SEARCH REQUEST RECEIVED")
    print("🔍"*30)
    
    if request.method != "GET":
        print(f"❌ Invalid Method: {request.method}")
        return JsonResponse(
            {"error": "Only GET allowed"},
            status=405
        )
    
    try:
        from .sap_vendor_fetch import search_vendors as sap_search
        
        # Get search query from URL parameter
        query = request.GET.get('q', '')
        
        print(f"\n📥 Search Query: '{query}'")
        print(f"   Query Length: {len(query)} characters")
        
        if len(query) < 3:
            print("   ⚠️  Query too short (minimum 3 characters)")
            return JsonResponse({
                "success": True,
                "vendors": [],
                "count": 0,
                "message": "Please enter at least 3 characters"
            })
        
        # Search SAP
        print("\n🚀 Calling SAP vendor search...")
        vendors = sap_search(query)
        
        print(f"\n✅ Search completed: {len(vendors)} vendors found")
        
        response_data = {
            "success": True,
            "vendors": vendors,
            "count": len(vendors)
        }
        
        print("\n📤 SENDING RESPONSE TO FRONTEND:")
        print(json.dumps(response_data, indent=2))
        
        return JsonResponse(response_data)
        
    except Exception as e:
        print(f"\n❌ SEARCH ERROR: {e}")
        print(f"   Error Type: {type(e).__name__}")
        
        import traceback
        print("\n📋 FULL TRACEBACK:")
        print(traceback.format_exc())
        
        return JsonResponse({
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }, status=500)
    
    finally:
        print("\n" + "🔍"*30)
        print("🏁 SEARCH REQUEST COMPLETED")
        print("🔍"*30 + "\n")