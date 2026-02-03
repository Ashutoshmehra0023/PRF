console.log("🔥 PURCHASE REQUEST FORM LOADED FROM src/forms");

import { useForm } from "@tanstack/react-form";
import { useState, useEffect } from "react";
import "./PurchaseRequestForm.css";

export default function PurchaseRequestForm({ email, productGroup }) {
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ Vendor autocomplete states
  const [vendorSuggestions, setVendorSuggestions] = useState([]);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [isSearchingVendors, setIsSearchingVendors] = useState(false);
  
  // ✅ Product cache states (loaded once when opening item form)
  const [cachedProducts, setCachedProducts] = useState([]);
  const [isCacheLoaded, setIsCacheLoaded] = useState(false);
  const [isLoadingCache, setIsLoadingCache] = useState(false);
  
  // ✅ Item No dropdown states
  const [showItemNoDropdown, setShowItemNoDropdown] = useState(false);
  const [itemNoSuggestions, setItemNoSuggestions] = useState([]);  // For multiple matches
  
  // ✅ Product Name dropdown states (for multiple matches)
  const [productNameSuggestions, setProductNameSuggestions] = useState([]);
  const [showProductNameDropdown, setShowProductNameDropdown] = useState(false);

  // Sales Margin and Sales Price
  const [salesPriceDisabled, setSalesPriceDisabled] = useState(false);
  const [salesMarginDisabled, setSalesMarginDisabled] = useState(false);

  // ✅ Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const form = useForm({
    defaultValues: {
      stage: "S1",
      loggedInUser: "1",

      // ===== CONTEXT =====
      email: email || "",
      productGroup: productGroup || "",
      prfNumber: "",

      // ===== PURCHASE / WAREHOUSE =====
      vendor: "",
      currency: "",
      warehouseBillingLocation: "",
      warehouseShippingLocation: "",
      warehouseBillTo: "",
      warehouseShipTo: "",
      directShipAddress: "",

      // ===== ANALYSIS =====
      itemCount: "",
      bulkDiscount: "",
      discountDetails: "",
      purchaseTotal: "",

      // ===== PAYMENT =====
      paymentTerms: "",
      poRemarks: "",

      // ===== ITEMS =====
      items: [],
    },

    onSubmit: async ({ value }) => {
      console.log("\n" + "🚀".repeat(30));
      console.log("📤 SUBMITTING PRF FORM");
      console.log("🚀".repeat(30));
      
      console.log("\n📦 FORM DATA TO BE SENT:");
      console.log("=".repeat(60));
      console.log(JSON.stringify(value, null, 2));
      console.log("=".repeat(60));

      setIsSubmitting(true);

      try {
        console.log("\n🔗 API ENDPOINT: http://127.0.0.1:8080/api/prf/create/");
        console.log("📡 Sending POST request...");

        const startTime = performance.now();

        const res = await fetch("http://127.0.0.1:8080/api/prf/create/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(value),
        });

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        console.log(`\n⏱️  Request completed in ${duration}ms`);
        console.log(`📊 Response Status: ${res.status} ${res.statusText}`);

        const data = await res.json();

        console.log("\n📥 BACKEND RESPONSE:");
        console.log("=".repeat(60));
        console.log(JSON.stringify(data, null, 2));
        console.log("=".repeat(60));

        if (data.success) {
          console.log("\n✅ SUCCESS!");
          console.log(`   PRF Number: ${data.prf_number || data.crm_response?.generated_prf_no || "N/A"}`);
          console.log(`   Zoho Status: ${data.zoho_status || data.crm_response?.status_code || "N/A"}`);
          
          if (data.crm_response) {
            console.log("\n📋 ZOHO CRM RESPONSE DETAILS:");
            console.log(JSON.stringify(data.crm_response, null, 2));
          }

          alert(
            `✅ PRF submitted successfully!\n\n` +
            `PRF No: ${data.prf_number || data.crm_response?.generated_prf_no || "Generated"}\n` +
            `Status: ${data.zoho_status || data.crm_response?.status_code || "200"}\n\n` +
            `Check console for detailed response.`
          );

          // Reset form after successful submission
          console.log("\n🔄 Resetting form...");
          form.reset();
          
        } else {
          console.log("\n❌ SUBMISSION FAILED");
          console.log("Error:", data.error || data.message || "Unknown error");
          
          if (data.error_details) {
            console.log("\n📋 ERROR DETAILS:");
            console.log(JSON.stringify(data.error_details, null, 2));
          }

          alert(
            `❌ Submission failed!\n\n` +
            `Error: ${data.error || data.message || "Unknown error"}\n\n` +
            `Check console for detailed error information.`
          );
        }

      } catch (err) {
        console.log("\n💥 NETWORK / SERVER ERROR");
        console.log("=".repeat(60));
        console.error("Error Type:", err.name);
        console.error("Error Message:", err.message);
        console.error("Full Error:", err);
        console.log("=".repeat(60));

        alert(
          `💥 Network / Server Error!\n\n` +
          `${err.message}\n\n` +
          `Please check:\n` +
          `1. Django server is running on port 8080\n` +
          `2. CORS is properly configured\n` +
          `3. Backend is accessible\n\n` +
          `Check console for more details.`
        );
      } finally {
        setIsSubmitting(false);
        console.log("\n" + "🏁".repeat(30));
        console.log("REQUEST COMPLETED");
        console.log("🏁".repeat(30) + "\n");
      }
    },
  });

  // Save item (new or update existing)
  const handleSaveItem = () => {
    if (!newItem.productName || !newItem.quantity || !newItem.unitRate) {
      alert("Please fill required fields (Product Name, Quantity, Unit Rate)");
      return;
    }

    const currentItems = [...form.state.values.items];

    if (editingIndex !== null) {
      currentItems[editingIndex] = newItem;
      console.log(`✏️ Updated item at index ${editingIndex}:`, newItem);
    } else {
      currentItems.push(newItem);
      console.log("➕ Added new item:", newItem);
    }

    form.setFieldValue("items", currentItems);
    form.setFieldValue("itemCount", currentItems.length);
    console.log(`📋 Total items: ${currentItems.length}`);
    
    setNewItem({});
    setIsItemOpen(false);
    setEditingIndex(null);
  };

  // ✅ Handle delete item - show confirmation popup
  const handleDeleteClick = (index, e) => {
    // Prevent card click event from firing
    e.stopPropagation();
    
    console.log(`🗑️ Delete requested for item at index ${index}`);
    setItemToDelete(index);
    setShowDeleteConfirm(true);
  };

  // ✅ Confirm delete - actually remove the item
  const confirmDelete = () => {
    if (itemToDelete === null) {
      console.log("⚠️ No item to delete");
      return;
    }

    const currentItems = [...form.state.values.items];
    const deletedItem = currentItems[itemToDelete];
    
    console.log(`🗑️ Deleting item at index ${itemToDelete}:`, deletedItem);
    
    // Remove the item from array
    currentItems.splice(itemToDelete, 1);
    
    // Update form values
    form.setFieldValue("items", currentItems);
    form.setFieldValue("itemCount", currentItems.length);
    
    console.log(`✅ Item deleted. Remaining items: ${currentItems.length}`);
    
    // Close popup and reset state
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // ✅ Cancel delete - just close the popup
  const cancelDelete = () => {
    console.log("❌ Delete cancelled");
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Click card to edit
  const handleEditItem = (index) => {
    console.log(`✏️ Editing item at index ${index}`);
    setNewItem(form.state.values.items[index]);
    setEditingIndex(index);
    setIsItemOpen(true);
  };

  // ✅ Search vendors from SAP
  const searchVendors = async (query) => {
    if (!query || query.length < 3) {
      setVendorSuggestions([]);
      setShowVendorDropdown(false);
      return;
    }

    setIsSearchingVendors(true);
    console.log(`🔍 Searching vendors for: "${query}"`);

    try {
      const res = await fetch(
        `http://127.0.0.1:8080/api/vendors/search/?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      
      if (data.success) {
        setVendorSuggestions(data.vendors);
        setShowVendorDropdown(true);
        console.log(`✅ Found ${data.count} vendors for "${query}"`);
      }
    } catch (err) {
      console.error("❌ Vendor search error:", err);
      setVendorSuggestions([]);
    } finally {
      setIsSearchingVendors(false);
    }
  };

  // ✅ Fetch and cache ALL products by Product Group (called once when opening item form)
  const fetchAndCacheProducts = async (productGroup) => {
    if (!productGroup) {
      console.log("⚠️  No Product Group specified");
      return;
    }

    if (isCacheLoaded) {
      console.log("✅ Cache already loaded, skipping fetch");
      return;
    }

    setIsLoadingCache(true);
    console.log(`\n📦 Fetching ALL products for group: "${productGroup}"`);

    try {
      const res = await fetch(
        `http://127.0.0.1:8080/api/products/by-group/?group=${encodeURIComponent(productGroup)}`
      );
      const data = await res.json();
      
      if (data.success) {
        setCachedProducts(data.products);
        setIsCacheLoaded(true);
        console.log(`✅ Cached ${data.count} products for group "${productGroup}"`);
        console.log("   Products:", data.products);
      } else {
        console.error("❌ Failed to load products:", data.error);
      }
    } catch (err) {
      console.error("❌ Cache loading error:", err);
    } finally {
      setIsLoadingCache(false);
    }
  };

  // ✅ Get unique product codes from cache (for Item No dropdown)
  const getUniqueProductCodes = () => {
    const codes = [...new Set(cachedProducts.map(p => p.product_code))];
    return codes.sort();
  };

  // ✅ Get all product names from cache (for Product Name dropdown)
  const getAllProductNames = () => {
    const names = cachedProducts.map(p => p.product_name).filter(Boolean);
    return [...new Set(names)].sort();
  };

  // ✅ Handle Item No selection
  const handleItemNoSelection = (selectedCode) => {
    console.log(`\n✅ Selected Item Code: ${selectedCode}`);
    
    // Find all products with this code in cache
    const matchingProducts = cachedProducts.filter(p => p.product_code === selectedCode);
    
    console.log(`   Found ${matchingProducts.length} product(s) with code "${selectedCode}"`);
    
    if (matchingProducts.length === 1) {
      // Single match - auto-fill both fields
      console.log(`   ✅ Single match - Auto-filling Product Name: "${matchingProducts[0].product_name}"`);
      setNewItem({
        ...newItem,
        itemNo: selectedCode,
        productName: matchingProducts[0].product_name
      });
    } else if (matchingProducts.length > 1) {
      // Multiple matches - show dropdown in Product Name field
      console.log(`   ⚠️  Multiple matches - Showing dropdown in Product Name field`);
      setNewItem({
        ...newItem,
        itemNo: selectedCode
      });
      setProductNameSuggestions(matchingProducts);
      setShowProductNameDropdown(true);
    }
    
    setShowItemNoDropdown(false);
  };

  // ✅ Handle Product Name selection
  const handleProductNameSelection = (selectedName) => {
    console.log(`\n✅ Selected Product Name: ${selectedName}`);
    
    // Find all products with this name in cache
    const matchingProducts = cachedProducts.filter(p => p.product_name === selectedName);
    
    console.log(`   Found ${matchingProducts.length} product(s) with name "${selectedName}"`);
    
    if (matchingProducts.length === 1) {
      // Single match - auto-fill both fields
      console.log(`   ✅ Single match - Auto-filling Item No: "${matchingProducts[0].product_code}"`);
      setNewItem({
        ...newItem,
        itemNo: matchingProducts[0].product_code,
        productName: selectedName
      });
    } else if (matchingProducts.length > 1) {
      // Multiple matches - show dropdown in Item No field
      console.log(`   ⚠️  Multiple matches - Showing dropdown in Item No field`);
      setNewItem({
        ...newItem,
        productName: selectedName
      });
      // Create suggestions with just codes for Item No dropdown
      const itemNoOptions = matchingProducts.map(p => p.product_code);
      setItemNoSuggestions(itemNoOptions);
      setShowItemNoDropdown(true);
    }
    
    setShowProductNameDropdown(false);
  };

  // Calculate Sales Margin from Sales Price
  const calculateSalesMargin = (unitRate, salesPrice) => {
    if (!unitRate || !salesPrice || unitRate === 0) return "";
    const margin = ((salesPrice - unitRate) / unitRate) * 100;
    return margin.toFixed(2);
  };

  // Calculate Sales Price from Sales Margin
  const calculateSalesPrice = (unitRate, salesMargin) => {
    if (!unitRate || salesMargin === "") return "";
    const price = unitRate * (1 + salesMargin / 100);
    return price.toFixed(2);
  };

  // Handle Sales Price change
  const handleSalesPriceChange = (value) => {
    const unitRate = parseFloat(newItem.unitRate) || 0;
    const salesPrice = parseFloat(value) || 0;
    
    if (value === "" || value === null) {
      setNewItem({ ...newItem, salesPrice: "", salesMargin: "" });
      setSalesPriceDisabled(false);
      setSalesMarginDisabled(false);
    } else if (unitRate > 0 && salesPrice > 0) {
      const margin = calculateSalesMargin(unitRate, salesPrice);
      setNewItem({ ...newItem, salesPrice: value, salesMargin: margin });
      setSalesMarginDisabled(true);
      setSalesPriceDisabled(false);
    } else {
      setNewItem({ ...newItem, salesPrice: value });
    }
  };

  // Handle Sales Margin change
  const handleSalesMarginChange = (value) => {
    const unitRate = parseFloat(newItem.unitRate) || 0;
    const salesMargin = parseFloat(value);
    
    if (value === "" || value === null) {
      setNewItem({ ...newItem, salesMargin: "", salesPrice: "" });
      setSalesPriceDisabled(false);
      setSalesMarginDisabled(false);
    } else if (unitRate > 0 && !isNaN(salesMargin)) {
      const price = calculateSalesPrice(unitRate, salesMargin);
      setNewItem({ ...newItem, salesMargin: value, salesPrice: price });
      setSalesPriceDisabled(true);
      setSalesMarginDisabled(false);
    } else {
      setNewItem({ ...newItem, salesMargin: value });
    }
  };

  // ✅ Handle Item No selection from multiple matches
  const handleItemNoSelectionFromMultiple = (selectedCode) => {
    console.log(`\n✅ Selected Item Code from multiple: ${selectedCode}`);
    
    setNewItem({
      ...newItem,
      itemNo: selectedCode
    });
    
    setShowItemNoDropdown(false);
    setItemNoSuggestions([]);
  };

  // ✅ useEffect: Load cache when item form opens
  useEffect(() => {
    if (isItemOpen && !isCacheLoaded && !isLoadingCache) {
      console.log("\n🔄 Item form opened - Loading product cache...");
      fetchAndCacheProducts(form.state.values.productGroup);
    }
  }, [isItemOpen]);

  // ✅ useEffect: Reset cache when product group changes
  useEffect(() => {
    if (isCacheLoaded) {
      console.log("🔄 Product Group changed - Resetting cache");
      setCachedProducts([]);
      setIsCacheLoaded(false);
    }
  }, [form.state.values.productGroup]);

  return (
    <>
      {/* ✅ Delete Confirmation Popup (outside form) */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
          }}
          onClick={cancelDelete}
        >
          <div
            style={{
              backgroundColor: "#2c2c2c",
              padding: "30px",
              borderRadius: "8px",
              border: "1px solid #444",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#fff", marginTop: 0, marginBottom: "20px" }}>
              🗑️ Confirm Delete
            </h3>
            <p style={{ color: "#ccc", marginBottom: "30px", fontSize: "15px" }}>
              Are you sure you want to delete this item?
              <br />
              <strong style={{ color: "#ff6b6b" }}>This action cannot be undone.</strong>
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={cancelDelete}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#444",
                  color: "#fff",
                  border: "1px solid #666",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#555")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#444")}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ff4444",
                  color: "#fff",
                  border: "1px solid #ff6666",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#ff6666")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#ff4444")}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="prf-page">

      <form
        className="prf-form"
        onSubmit={(e) => {
          e.preventDefault();
          console.log("📝 Form submit triggered");
          form.handleSubmit();
        }}
      >
        {/* ================= CONTEXT ================= */}
        <div className="prf-section">
          <h3>Request Context</h3>
          <div className="prf-field-group">
            <div className="prf-field">
              <label className="prf-label">Email</label>
              <input
                className="prf-input"
                value={form.state.values.email}
                disabled
              />
            </div>
            <div className="prf-field">
              <label className="prf-label">Product Group</label>
              <input
                className="prf-input"
                value={form.state.values.productGroup}
                disabled
              />
            </div>
          </div>
        </div>

        {/* ================= PURCHASE BASICS ================= */}
        <div className="prf-section">
          <h3>Purchase Basics</h3>
          <div className="prf-field-group">
            
            {/* ✅ Vendor field with dark dropdown autocomplete */}
            <form.Field name="vendor">
              {(f) => (
                <div className="prf-field" style={{ position: "relative" }}>
                  <label className="prf-label">Vendor *</label>
                  <input
                    className="prf-input"
                    value={f.state.value}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      f.handleChange(newValue);
                      if (showVendorDropdown || newValue.length >= 3) {
                        searchVendors(newValue);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
                    onFocus={() => {
                      if (f.state.value.length >= 3 && vendorSuggestions.length > 0) {
                        setShowVendorDropdown(true);
                      }
                    }}
                    placeholder="Type at least 3 characters to search..."
                    required
                  />
                  
                  {isSearchingVendors && (
                    <div style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#666",
                      fontSize: "14px"
                    }}>
                      ⏳ Searching...
                    </div>
                  )}
                  
                  {showVendorDropdown && vendorSuggestions.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        maxHeight: "200px",
                        overflowY: "auto",
                        backgroundColor: "#2c2c2c",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        zIndex: 1000,
                        marginTop: "2px"
                      }}
                    >
                      {vendorSuggestions.map((vendor, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            f.handleChange(vendor);
                            setShowVendorDropdown(false);
                            setVendorSuggestions([]);
                            console.log(`✅ Selected vendor: ${vendor}`);
                          }}
                          style={{
                            padding: "10px 12px",
                            cursor: "pointer",
                            borderBottom: idx < vendorSuggestions.length - 1 ? "1px solid #444" : "none",
                            fontSize: "14px",
                            color: "#ffffff",
                            backgroundColor: "#2c2c2c"
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = "#444444")}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = "#2c2c2c")}
                        >
                          {vendor}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showVendorDropdown && vendorSuggestions.length === 0 && !isSearchingVendors && f.state.value.length >= 3 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        padding: "10px",
                        backgroundColor: "#2c2c2c",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        zIndex: 1000,
                        marginTop: "2px",
                        color: "#cccccc",
                        fontSize: "14px"
                      }}
                    >
                      No vendors found for "{f.state.value}"
                    </div>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="currency">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">Currency *</label>
                  <select
                    className="prf-select"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    required
                  >
                    <option value="">Select</option>
                    <option>USD</option>
                    <option>INR</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </div>
              )}
            </form.Field>
          </div>
        </div>

        {/* ================= ITEM ENTRY MODE ================= */}
        <div className="prf-section">
          <h3>Item Entry</h3>

          {/* Add Item Button */}
          {!isItemOpen && (
            <button
              type="button"
              className="prf-add-item-btn"
              onClick={() => {
                console.log("➕ Opening item form (Add mode)");
                setNewItem({});
                setEditingIndex(null);
                setIsItemOpen(true);
                setSalesPriceDisabled(false);
                setSalesMarginDisabled(false);
              }}
            >
              ➕ Add Item
            </button>
          )}

          {/* Item Add/Edit Form */}
          {isItemOpen && (
            <div className="prf-item-form">
              <h4>{editingIndex !== null ? "Edit Item" : "Add Item"}</h4>

              <div className="prf-field-group">
                {[
                  ["itemNo", "Item No"],
                  ["productName", "Product Name *"],
                  ["quantity", "Quantity *"],
                  ["unitRate", "Unit Rate *"],
                  ["discount", "Discount"],
                  ["totalAmount", "Total Amount"],
                  ["salesPrice", "Sales Price *"],
                  ["salesMargin", "Sales Margin *"],
                  ["projectDetails", "Project Name / Details"],
                  ["purchaseType", "Purchase Type"],
                  ["productLeadRemarks", "Product Lead Remarks *"],
                  ["currentStock", "Current Stock"],
                  ["avgSales12M", "Avg Sales (12 Months)"],
                  ["maxSales12M", "Max Sales (12 Months)"],
                  ["avgSales3M", "Avg Sales (3 Months)"],
                  ["salesMTD", "Sales MTD"],
                  ["openSOQty", "Open SO Qty"],
                  ["openPOQty", "Open PO Qty"],
                  ["landedCost", "Landed Cost"],
                  ["lastPurchasePrice", "Last Purchase Price"],
                  ["scmLeadRemarks", "SCM Lead Remarks"],
                ].map(([key, label]) => {

                  // ================= ITEM NO =================
                  if (key === "itemNo") {
                    const uniqueCodes = getUniqueProductCodes();
                    const codesToShow =
                      itemNoSuggestions.length > 0 ? itemNoSuggestions : uniqueCodes;
                    const isFilteredList = itemNoSuggestions.length > 0;

                    return (
                      <div className="prf-field" key={key} style={{ position: "relative" }}>
                        <label className="prf-label">{label}</label>

                        <input
                          className="prf-input"
                          value={newItem[key] || ""}
                          onChange={(e) =>
                            setNewItem({ ...newItem, [key]: e.target.value })
                          }
                          onFocus={() => {
                            if (!isLoadingCache && isCacheLoaded && codesToShow.length > 0) {
                              setShowItemNoDropdown(true);
                            }
                          }}
                          onBlur={() =>
                            setTimeout(() => setShowItemNoDropdown(false), 200)
                          }
                          placeholder={
                            isLoadingCache
                              ? "Loading products..."
                              : "Click to see item codes"
                          }
                          disabled={isLoadingCache}
                        />

                        {isLoadingCache && (
                          <div
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: "12px",
                              color: "#666",
                            }}
                          >
                            ⏳ Loading...
                          </div>
                        )}

                        {showItemNoDropdown && codesToShow.length > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              maxHeight: "200px",
                              overflowY: "auto",
                              backgroundColor: "#2c2c2c",
                              border: "1px solid #444",
                              borderRadius: "4px",
                              zIndex: 1000,
                            }}
                          >
                            {codesToShow.map((code, idx) => (
                              <div
                                key={idx}
                                onClick={() =>
                                  isFilteredList
                                    ? handleItemNoSelectionFromMultiple(code)
                                    : handleItemNoSelection(code)
                                }
                                style={{
                                  padding: "10px",
                                  cursor: "pointer",
                                  color: "#fff",
                                }}
                              >
                                {code}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ================= PRODUCT NAME =================
                  if (key === "productName") {
                    const allProductNames = getAllProductNames();
                    const namesToShow =
                      productNameSuggestions.length > 0
                        ? productNameSuggestions.map((p) => p.product_name)
                        : allProductNames;
                    const isFilteredList = productNameSuggestions.length > 0;

                    return (
                      <div className="prf-field" key={key} style={{ position: "relative" }}>
                        <label className="prf-label">{label}</label>

                        <input
                          className="prf-input"
                          value={newItem[key] || ""}
                          onChange={(e) =>
                            setNewItem({ ...newItem, [key]: e.target.value })
                          }
                          onFocus={() => {
                            if (!isLoadingCache && isCacheLoaded) {
                              setShowProductNameDropdown(true);
                            }
                          }}
                          onBlur={() =>
                            setTimeout(() => setShowProductNameDropdown(false), 200)
                          }
                        />

                        {showProductNameDropdown && (
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              maxHeight: "200px",
                              overflowY: "auto",
                              backgroundColor: "#2c2c2c",
                              border: "1px solid #444",
                              zIndex: 1000,
                            }}
                          >
                            {namesToShow.map((name, idx) => (
                              <div
                                key={idx}
                                onClick={() =>
                                  isFilteredList
                                    ? setNewItem({
                                        ...newItem,
                                        productName: name,
                                      })
                                    : handleProductNameSelection(name)
                                }
                                style={{
                                  padding: "10px",
                                  cursor: "pointer",
                                  color: "#fff",
                                }}
                              >
                                {name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ================= PURCHASE TYPE (DROPDOWN) =================
                  if (key === "purchaseType") {
                    return (
                      <div className="prf-field" key={key}>
                        <label className="prf-label">{label}</label>
                        <select
                          className="prf-input"
                          value={newItem[key] || ""}
                          onChange={(e) =>
                            setNewItem({ ...newItem, [key]: e.target.value })
                          }
                        >
                          <option value="">Select Purchase Type</option>
                          <option value="B2B">B2B</option>
                          <option value="Stock">Stock</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                    );
                  }

                  // ✅ Special handling for Sales Price
                  if (key === "salesPrice") {
                    return (
                      <div className="prf-field" key={key}>
                        <label className="prf-label">{label}</label>
                        <input
                          className={salesPriceDisabled ? "" : "prf-input"}
                          type="number"
                          step="0.01"
                          value={newItem[key] || ""}
                          onChange={(e) => handleSalesPriceChange(e.target.value)}
                          disabled={salesPriceDisabled}
                          style={salesPriceDisabled ? {
                            width: "100%",
                            padding: "8px 12px",
                            fontSize: "14px",
                            border: "1px solid #444",
                            borderRadius: "4px",
                            backgroundColor: "#2c2c2c",
                            color: "#ffffff",
                            cursor: "not-allowed"
                          } : {}}
                          placeholder={salesPriceDisabled ? "Auto-calculated from Sales Margin" : ""}
                        />
                        {salesPriceDisabled && (
                          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
                            ✓ Auto-calculated (clear Sales Margin to edit)
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  // ✅ Special handling for Sales Margin
                  if (key === "salesMargin") {
                    return (
                      <div className="prf-field" key={key}>
                        <label className="prf-label">{label} (%)</label>
                        <input
                          className={salesMarginDisabled ? "" : "prf-input"}
                          type="number"
                          step="0.01"
                          value={newItem[key] || ""}
                          onChange={(e) => handleSalesMarginChange(e.target.value)}
                          disabled={salesMarginDisabled}
                          style={salesMarginDisabled ? {
                            width: "100%",
                            padding: "8px 12px",
                            fontSize: "14px",
                            border: "1px solid #444",
                            borderRadius: "4px",
                            backgroundColor: "#2c2c2c",
                            color: "#ffffff",
                            cursor: "not-allowed"
                          } : {}}
                          placeholder={salesMarginDisabled ? "Auto-calculated from Sales Price" : "%"}
                        />
                        {salesMarginDisabled && (
                          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
                            ✓ Auto-calculated (clear Sales Price to edit)
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ================= ALL OTHER FIELDS =================
                  return (
                    <div className="prf-field" key={key}>
                      <label className="prf-label">{label}</label>

                      {key.includes("Remarks") || key.includes("Details") ? (
                        <textarea
                          className="prf-textarea"
                          value={newItem[key] || ""}
                          onChange={(e) =>
                            setNewItem({ ...newItem, [key]: e.target.value })
                          }
                        />
                      ) : (
                        <input
                          className="prf-input"
                          value={newItem[key] || ""}
                          onChange={(e) =>
                            setNewItem({ ...newItem, [key]: e.target.value })
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="prf-submit-wrapper">
                <button
                  type="button"
                  className="prf-submit-btn"
                  onClick={handleSaveItem}
                >
                  {editingIndex !== null ? "Update Item" : "Save Item"}
                </button>
              </div>
            </div>
          )}

          {/* ✅ Render Saved Item Cards with Delete Button */}
          {form.state.values.items.length > 0 && (
            <div className="prf-item-card-list">
              {form.state.values.items.map((item, idx) => (
                <div
                  key={idx}
                  className="prf-item-card"
                  style={{ 
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  {/* Card Content (clickable for edit) */}
                  <div
                    className="prf-item-card-content"
                    onClick={() => handleEditItem(idx)}
                    style={{ flex: 1 }}
                  >
                    <strong>{item.productName || "Unnamed Item"}</strong>
                    <p>
                      Qty: {item.quantity || "—"} | Rate:{" "}
                      {item.unitRate || "—"} | Total:{" "}
                      {item.totalAmount || "—"}
                    </p>
                  </div>

                  {/* ✅ CRITICAL FIX: Delete Button with type="button" */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(idx, e)}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "1px solid #666",
                      backgroundColor: "#333",
                      color: "#ff6b6b",
                      fontSize: "18px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#ff4444";
                      e.target.style.color = "#fff";
                      e.target.style.borderColor = "#ff6666";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#333";
                      e.target.style.color = "#ff6b6b";
                      e.target.style.borderColor = "#666";
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= ITEM SUMMARY / ANALYSIS ================= */}
        <div className="prf-section">
          <h3>Item Summary & Discounts</h3>

          <div className="prf-field-group">
            <form.Field name="itemCount">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">Item Count</label>
                  <input
                    type="number"
                    className="prf-input"
                    value={f.state.value || 0}
                    disabled={true}
                    style={{
                      backgroundColor: "#2c2c2c",
                      color: "#ffffff",
                      cursor: "not-allowed"
                    }}
                    placeholder="Auto-calculated from items"
                  />
                  <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
                    ✓ Auto-calculated from saved items
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="bulkDiscount">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">
                    Discount (Bulk / Cash / Others)
                  </label>
                  <input
                    className="prf-input"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="discountDetails">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">Discount Details</label>
                  <textarea
                    className="prf-textarea"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="purchaseTotal">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">Purchase Total</label>
                  <input
                    className="prf-input"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>

        {/* ================= PRF & WAREHOUSE ================= */}
        <div className="prf-section">
          <h3>PRF & Warehouse Details</h3>

          <div className="prf-field-group">
            <form.Field name="prfNumber">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">PRF No.</label>
                  <input
                    className="prf-input"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="warehouseBillingLocation">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">
                    Warehouse – Billing Location
                  </label>
                  <input
                    className="prf-input"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="warehouseShippingLocation">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">
                    Warehouse – Shipping Location
                  </label>
                  <input
                    className="prf-input"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="warehouseBillTo">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">Warehouse – Bill To</label>
                  <input
                    className="prf-input"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="warehouseShipTo">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">Warehouse – Ship To</label>
                  <input
                    className="prf-input"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="directShipAddress">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">
                    Warehouse Address – Direct Ship to Customer
                  </label>
                  <textarea
                    className="prf-textarea"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>

        {/* ================= PAYMENT ================= */}
        <div className="prf-section">
          <h3>Payment</h3>

          <div className="prf-field-group">
            <form.Field name="paymentTerms">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">Payment Terms *</label>
                  <textarea
                    className="prf-textarea"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="poRemarks">
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">PO Remarks</label>
                  <textarea
                    className="prf-textarea"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>

        {/* ================= SUBMIT ================= */}
        <div className="prf-submit-wrapper">
          <button 
            type="submit" 
            className="prf-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "⏳ Submitting..." : "Submit Purchase Request"}
          </button>
        </div>
      </form>
      </div>
    </>
  );
}