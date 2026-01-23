export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    email: params.get("email"),
    productGroup: params.get("productGroup"),
  };
}
