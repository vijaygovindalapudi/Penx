import { useNavigate } from "react-router-dom";

import Logo from "../components/auth/Logo";
import BrandPanel from "../components/auth/BrandPanel";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const handleSuccess = (email) => {
    navigate("/verify-reset-otp", {
      state: { email },
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-void">
      <BrandPanel />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">

        {/* Mobile Logo */}
        <div className="mb-10 lg:hidden">
          <Logo />
        </div>

        {/* Mobile Background */}
        <div className="pointer-events-none absolute inset-0 bg-grid-fade lg:hidden" />

        <ForgotPasswordForm
          onSuccess={handleSuccess}
        />

        <p className="mt-10 text-[12px] text-ink-faint">
          © {new Date().getFullYear()} PenX Security Inc.
          All rights reserved.
        </p>

      </div>
    </div>
  );
}