import { useEffect } from "react";
import HomeButton from "./HomeButton";
import { useNavigate, useLocation } from "react-router-dom";

export default function HomePage() {
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

      // Clear the URL hash and navigate to a clean route
      window.history.replaceState({}, document.title, location.pathname);
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <HomeButton />
    </div>
  );
}
