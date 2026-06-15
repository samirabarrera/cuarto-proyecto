import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function ApiCall() {
  const { getAccessTokenSilently } = useAuth0();
  const [apiResponse, setApiResponse] = useState(null);

  const callProtectedApi = async () => {
    if (!isAuthenticated) {
      console.warn('Debes iniciar sesión primero');
      return;
    }
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch("/api/protected", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  return (
    <div>
      <button onClick={callProtectedApi}>Call API</button>
      {apiResponse && <pre>{JSON.stringify(apiResponse, null, 2)}</pre>}
    </div>
  );
}

export default ApiCall;
