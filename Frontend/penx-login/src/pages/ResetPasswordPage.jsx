import { useLocation, useNavigate } from "react-router-dom";

import Logo from "../components/auth/Logo";
import BrandPanel from "../components/auth/BrandPanel";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  const handleSuccess = () => {
    alert("Password changed successfully.");

    navigate("/login", {
      replace: true,
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

        <ResetPasswordForm
          email={email}
          resetToken={resetToken}
          onSuccess={handleSuccess}
        />

        <p className="mt-10 text-[12px] text-ink-faint">
          © {new Date().getFullYear()} PenX Security Inc.
        </p>

      </div>
    </div>
  );
}