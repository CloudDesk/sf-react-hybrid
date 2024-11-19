import { useEffect, useState } from "react";
import { faSalesforce } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SalesforceComponent } from "./SalesforceComponent";

const SF_Oauth = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [instanceUrl, setInstanceUrl] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const clientId = import.meta.env.VITE_SF_CLIENT_ID;

  const handleLogin = (): void => {
    setIsLoading(true);
    const authUri = import.meta.env.VITE_SF_AUTH_URI;
    const responseType = "token";
    const redirectUri = "http://localhost:5173";
    const scope = "full";

    const loginUrl = `${authUri}?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = loginUrl;
  };

  const checkConnection = async (token: string, url: string) => {
    try {
      const response = await fetch(`${url}/services/data/v53.0/sobjects/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsConnected(true);
        setIsLoading(false);
      } else {
        throw new Error("Connection test failed");
      }
    } catch (error) {
      console.error("Error checking Salesforce connection:", error);
      handleLogout();
    }
  };

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    console.log(hash, "hash");
    const params = new URLSearchParams(hash);
    const newAccessToken = params.get("access_token");
    const newInstanceUrl = params.get("instance_url");

    if (newAccessToken && newInstanceUrl) {
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("instanceUrl", newInstanceUrl);
      setAccessToken(newAccessToken);
      setInstanceUrl(newInstanceUrl);
      checkConnection(newAccessToken, newInstanceUrl);

      // Remove the access token from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedInstanceUrl = localStorage.getItem("instanceUrl");
      if (storedAccessToken && storedInstanceUrl) {
        setAccessToken(storedAccessToken);
        setInstanceUrl(storedInstanceUrl);
        checkConnection(storedAccessToken, storedInstanceUrl);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("instanceUrl");
    setAccessToken("");
    setInstanceUrl("");
    setIsConnected(false);
    setIsLoading(false);

    // Remove any Salesforce-related parameters from the URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="flex flex-col w-full items-start p-4">
      {!isConnected && (
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`flex items-center justify-center px-5 py-2 font-semibold text-white rounded-lg shadow-md transition duration-300 ease-in-out transform ${
            isLoading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1"
          }`}
        >
          <FontAwesomeIcon size="2xl" icon={faSalesforce} className="mr-2" />
          {isLoading ? "Connecting..." : "Connect to Salesforce"}
        </button>
      )}
      {isConnected && (
        <div>
          <SalesforceComponent
            instanceUrl={instanceUrl}
            accessToken={accessToken}
          />
          <button
            onClick={handleLogout}
            className="mt-4 px-5 py-2 font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
          >
            Disconnect from Salesforce
          </button>
        </div>
      )}
    </div>
  );
};

export default SF_Oauth;
