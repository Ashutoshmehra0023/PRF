import { getUrlParams } from "../utils/getUrlParams";
import PurchaseRequestForm from "../forms/PurchaseRequestForm";

export default function PurchaseRequest() {
  const { email, productGroup } = getUrlParams();

  console.log("URL PARAMS:", email, productGroup); // 👈 ADD THIS

  if (!email || !productGroup) {
    return (
      <div style={{ padding: "40px", color: "red" }}>
        <h2>Invalid Access</h2>
        <p>Email or Product Group missing</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Purchase Request</h1>

      <PurchaseRequestForm
        email={email}
        productGroup={productGroup}
      />
    </div>
  );
}
