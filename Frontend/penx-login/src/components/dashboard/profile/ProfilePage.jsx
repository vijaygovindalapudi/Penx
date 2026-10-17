import ProfileHeader from "./ProfileHeader";
import ProfileOverview from "./ProfileOverview";
import DevicesSection from "./DevicesSection";
import USBSection from "./USBSection";
import VaultSection from "./VaultSection";
import AccountSection from "./AccountSection";
import ProfileActions from "./ProfileActions";

export default function ProfilePage({
  user,
  devices = [],
  vaultLocked,
  onLockVault,
}) {
  return (
    <div className="space-y-8">

      {/* ========================= */}
      {/* Digital Identity */}
      {/* ========================= */}

      <ProfileHeader
        user={user}
        securityScore={98}
      />

      {/* ========================= */}
      {/* Overview */}
      {/* ========================= */}

      <ProfileOverview
        devices={devices}
        usbCount={1}
        vaultStatus={vaultLocked ? "Locked" : "Protected"}
        cloudStatus="Connected"
      />

      {/* ========================= */}
      {/* Devices + USB */}
      {/* ========================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <DevicesSection
          devices={devices}
        />

        <USBSection />

      </div>

      {/* ========================= */}
      {/* Vault + Timeline */}
      {/* ========================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <VaultSection />

        <AccountSection />

      </div>

      {/* ========================= */}
      {/* Quick Actions */}
      {/* ========================= */}

      <ProfileActions
        vaultLocked={vaultLocked}
        onLockVault={onLockVault}
      />

    </div>
  );
}