import PurchaseRequestForm from "./forms/PurchaseRequestForm";

export default function App() {
  const params = new URLSearchParams(window.location.search);

  const email = params.get("email");
  const productGroup = params.get("productGroup");

  // 🚫 BLOCK DIRECT ACCESS
  if (!email || !productGroup) {
    return (
      <div
        style={{
          background: "#000",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
        }}
      >
        ❌ Unauthorized Access  
        <br />
        Please open this form from CRM only.
      </div>
    );
  }

  // ✅ ALLOW CRM REDIRECT
  return (
    <PurchaseRequestForm
      email={email}
      productGroup={productGroup}
    />
  );
}
