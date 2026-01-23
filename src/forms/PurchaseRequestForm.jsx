import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import "./PurchaseRequestForm.css";

export default function PurchaseRequestForm({ email, productGroup }) {
  const [isItemOpen, setIsItemOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      stage: "S1",
      loggedInUser: "1",
      email: email || "",
      productGroup: productGroup || "",

      /* PURCHASE BASICS */
      vendor: "",
      currency: "",
      productSubgroup: "",
      editSubmission: false,

      /* WAREHOUSE */
      billingWarehouse: "",
      shippingWarehouse: "",
      billTo: "",
      shipTo: "",
      directShipAddress: "",

      /* ITEM ENTRY MODE */
      addItemThrough: "",

      /* ANALYSIS */
      itemCount: "",
      discount: "",
      discountDetails: "",
      purchaseTotal: "",
      updateAnalysis: false,
      itemAnalysis: "",

      /* PAYMENT */
      paymentTerms: "",
      poRemarks: "",

      /* ITEM SUBFORM */
      items: [
        {
          itemNo: "",
          productName: "",
          quantity: "",
          unitRate: "",
          discount: "",
          totalAmount: "",
          salesPrice: "",
          salesMargin: "",
          projectDetails: "",
          purchaseType: "",
          productLeadRemarks: "",
          currentStock: "",
          avgSales12M: "",
          maxSales12M: "",
          avgSales3M: "",
          salesMTD: "",
          openSOQty: "",
          openPOQty: "",
          landedCost: "",
          lastPurchasePrice: "",
          scmLeadRemarks: "",
        },
      ],
    },
    onSubmit: ({ value }) => {
      console.log("FINAL PAYLOAD:", value);
    },
  });

  return (
    <div className="prf-page">
      <form
        className="prf-form"
        onSubmit={(e) => {
          e.preventDefault();
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
            <form.Field
              name="vendor"
              validators={{ onChange: ({ value }) => !value && "Required" }}
            >
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">Vendor *</label>
                  <input
                    className="prf-input"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                  {f.state.meta.errors && (
                    <div className="prf-error">{f.state.meta.errors}</div>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="currency"
              validators={{ onChange: ({ value }) => !value && "Required" }}
            >
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">Currency *</label>
                  <select
                    className="prf-select"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>USD</option>
                    <option>INR</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                  {f.state.meta.errors && (
                    <div className="prf-error">{f.state.meta.errors}</div>
                  )}
                </div>
              )}
            </form.Field>
          </div>
        </div>

        {/* ================= WAREHOUSE ================= */}
        <div className="prf-section">
          <h3>Warehouse Details</h3>
          <div className="prf-field-group">
            {[
              ["billingWarehouse", "Billing Warehouse"],
              ["shippingWarehouse", "Shipping Warehouse"],
              ["billTo", "Bill To"],
              ["shipTo", "Ship To"],
              ["directShipAddress", "Direct Ship Address"],
            ].map(([name, label]) => (
              <form.Field key={name} name={name}>
                {(f) => (
                  <div className="prf-field">
                    <label className="prf-label">{label}</label>
                    <input
                      className="prf-input"
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
            ))}
          </div>
        </div>

        {/* ================= ITEM ENTRY MODE ================= */}
        <div className="prf-section">
          <h3>Item Entry Mode</h3>
          <div className="prf-field">
            <label className="prf-label">Add Item Data Through *</label>
            <form.Field
              name="addItemThrough"
              validators={{ onChange: ({ value }) => !value && "Required" }}
            >
              {(f) => (
                <>
                  <div className="prf-options">
                    {["Manual Entry", "File Upload"].map((v) => (
                      <label key={v}>
                        <input
                          type="radio"
                          value={v}
                          checked={f.state.value === v}
                          onChange={(e) => f.handleChange(e.target.value)}
                        />{" "}
                        {v}
                      </label>
                    ))}
                  </div>
                  {f.state.meta.errors && (
                    <div className="prf-error">{f.state.meta.errors}</div>
                  )}
                </>
              )}
            </form.Field>
          </div>
        </div>

        {/* ================= ITEMS ================= */}
        <div className="prf-section">
          <h3>Items</h3>
          <button
            type="button"
            className="prf-add-item-btn"
            onClick={() => setIsItemOpen(true)}
          >
            ➕ Add Item
          </button>
        </div>

        {/* ================= ITEM SUBFORM ================= */}
        {isItemOpen && (
          <div
            className="prf-section"
            style={{
              background: "#111",
              border: "1px solid #333",
              padding: "20px",
            }}
          >
            <h3>Add Item Details</h3>
            <div className="prf-field-group">
              {[
                ["itemNo", "Item No"],
                ["productName", "Product Name"],
                ["quantity", "Quantity *"],
                ["unitRate", "Unit Rate *"],
                ["discount", "Discount *"],
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
              ].map(([name, label]) => (
                <form.Field key={name} name={`items[0].${name}`}>
                  {(f) => (
                    <div className="prf-field">
                      <label className="prf-label">{label}</label>
                      {name.includes("Remarks") ||
                      name.includes("Details") ? (
                        <textarea
                          className="prf-textarea"
                          value={f.state.value}
                          onChange={(e) => f.handleChange(e.target.value)}
                        />
                      ) : (
                        <input
                          className="prf-input"
                          value={f.state.value}
                          onChange={(e) => f.handleChange(e.target.value)}
                        />
                      )}
                    </div>
                  )}
                </form.Field>
              ))}
            </div>

            <div className="prf-submit-wrapper">
              <button
                type="button"
                className="prf-submit-btn"
                onClick={() => setIsItemOpen(false)}
              >
                Save Item
              </button>
            </div>
          </div>
        )}

        {/* ================= PAYMENT ================= */}
        <div className="prf-section">
          <h3>Payment</h3>
          <div className="prf-field-group">
            <form.Field
              name="paymentTerms"
              validators={{ onChange: ({ value }) => !value && "Required" }}
            >
              {(f) => (
                <div className="prf-field">
                  <label className="prf-label">Payment Terms *</label>
                  <textarea
                    className="prf-textarea"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                  {f.state.meta.errors && (
                    <div className="prf-error">{f.state.meta.errors}</div>
                  )}
                </div>
              )}
            </form.Field>

            <div className="prf-field">
              <label className="prf-label">PO Remarks</label>
              <textarea
                className="prf-textarea"
                onChange={(e) =>
                  form.setFieldValue("poRemarks", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* ================= SUBMIT ================= */}
        <div className="prf-submit-wrapper">
          <button type="submit" className="prf-submit-btn">
            Submit Purchase Request
          </button>
        </div>
      </form>
    </div>
  );
}
