import { Outlet } from "react-router-dom";
import DarkVeil from "../components/DarkVeil";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      <DarkVeil
        hueShift={0}       // Blue theme
        speed={0.5}
        noiseIntensity={0}
        scanlineIntensity={0}
        warpAmount={0}
      />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
