import { Outlet } from "react-router-dom";
import DarkVeil from "../components/DarkVeil";

const ProfileLayout = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      <DarkVeil
        hueShift={48}        
        speed={0.5}
        noiseIntensity={0}
        scanlineIntensity={0}
        scanlineFrequency={0}
        warpAmount={0}
      />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
