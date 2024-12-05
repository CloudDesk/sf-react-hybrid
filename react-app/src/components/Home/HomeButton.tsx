import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSalesforce } from "@fortawesome/free-brands-svg-icons";

export default function HomeButton({ isLoading }: { isLoading: boolean }) {
  const handleConnect = () => {
    const authUri = import.meta.env.VITE_SF_AUTH_URI;
    const clientId = import.meta.env.VITE_SF_CLIENT_ID;
    const responseType = "token";
    const redirectUri = import.meta.env.VITE_SF_REDIRECT_URI || window.origin;
    const scope = "full";

    const loginUrl = `${authUri}?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = loginUrl;
  };

  return (
    <div className="p-4 w-full h-full grid place-content-center place-items-center">

      <button
        disabled={isLoading}
        onClick={handleConnect}
        className="flex items-center justify-center px-6 py-3 bg-[#00A1E0] text-white rounded-lg shadow-lg hover:bg-[#0089BD] transition-colors duration-300 font-semibold text-lg"
      >
        <FontAwesomeIcon icon={faSalesforce} className="mr-3 text-2xl" />
        {isLoading ? "Connecting..." : "Connect to Salesforce"}
      </button>
    </div>
  );
}
