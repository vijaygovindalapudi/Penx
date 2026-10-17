import { useLocation, useNavigate } from "react-router-dom";

import Logo from "../components/auth/Logo";
import BrandPanel from "../components/auth/BrandPanel";
import VerifyResetOTPForm from "../components/auth/VerifyResetOTPForm";

export default function VerifyResetOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const handleVerified = (resetToken) => {
    if (!resetToken) {
      console.error("Reset token was not received.");
      return;
    }

    navigate("/reset-password", {
      state: {
        email,
        resetToken,
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-void">
      <BrandPanel />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">

        <div className="mb-10 lg:hidden">
          <Logo />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-grid-fade lg:hidden" />

        <VerifyResetOTPForm
          email={email}
          onSuccess={handleVerified}
        />

        <p className="mt-10 text-[12px] text-ink-faint">
          © {new Date().getFullYear()} PenX Security Inc.
        </p>

      </div>
    </div>
  );
}