import { useEffect, useState } from "react";
import HomeButton from "./HomeButton";
import { useNavigate, useLocation } from "react-router-dom";
import SalesforceComponent from "../SF";
import { fetchOrgLocaleInfo } from "../../services/salesforceService";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [instanceUrl, setInstanceUrl] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [localeInfo, setLocaleInfo] = useState<any>();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse the URL hash fragment for access_token and instance_url
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const instanceUrl = params.get("instance_url");
    console.log(hash, params, accessToken, instanceUrl, "********");
    if (accessToken && instanceUrl) {
      // Store tokens in localStorage
      localStorage.setItem("sf_access_token", accessToken);
      localStorage.setItem("sf_instance_url", instanceUrl);
      setAccessToken(accessToken);
      setInstanceUrl(instanceUrl);
      checkConnection(accessToken, instanceUrl);
      // Clear the URL hash and navigate to a clean route
      window.history.replaceState({}, document.title, location.pathname);
      navigate("/", { replace: true });
    } else {
      const storedAccessToken = localStorage.getItem("sf_access_token");
      const storedInstanceUrl = localStorage.getItem("sf_instance_url");
      if (storedAccessToken && storedInstanceUrl) {
        setAccessToken(storedAccessToken);
        setInstanceUrl(storedInstanceUrl);
        checkConnection(storedAccessToken, storedInstanceUrl);
      } else {
        setIsLoading(false);
      }
    }
  }, [location, navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem("sf_access_token");
    localStorage.removeItem("sf_instance_url");
    setAccessToken("");
    setInstanceUrl("");
    setIsConnected(false);
    setIsLoading(false);

    // Remove any Salesforce-related parameters from the URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const getLocaleInfo = async () => {
    try {
      const response = await fetchOrgLocaleInfo(instanceUrl, accessToken);
      console.log(response, "response");
      setLocaleInfo(response);
      return response;
    } catch (error) {
      console.error("Error fetching organization locale information:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (accessToken && instanceUrl) {
      getLocaleInfo();
    }
  }, [accessToken, instanceUrl]);

  return (
    <div className=" w-full h-full">
      {isConnected ? (
        <div>
          <div>
            <SalesforceComponent
              instanceUrl={instanceUrl}
              accessToken={accessToken}
              localeInfo={localeInfo}
            />
          </div>
          {/* <div>
            <button
              onClick={handleLogout}
              className="mt-4 px-5 py-2 font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
            >
              Disconnect from Salesforce
            </button>
          </div> */}
        </div>
      ) : (
        <HomeButton isLoading={isLoading} />
      )}
    </div>
  );
}
