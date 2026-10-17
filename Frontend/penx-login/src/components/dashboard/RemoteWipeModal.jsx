import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  LockKeyhole,
  ShieldAlert,
  Usb,
  X,
} from "lucide-react";


// =======================================================
// REMOTE WIPE MODAL
// =======================================================

export default function RemoteWipeModal({
  isOpen,
  onClose,
  device = null,
  user = null,
  onSuccess,
}) {

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const [confirmation, setConfirmation] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);


  // =====================================================
  // RESET STATE
  // =====================================================

  useEffect(() => {

    if (!isOpen) {

      setFullName("");
      setPassword("");
      setConfirmation(false);
      setLoading(false);
      setError("");
      setSuccess(false);

    }

  }, [isOpen]);


  // =====================================================
  // EXPECTED NAME
  // =====================================================

  const expectedName =
    user?.full_name?.trim() || "";


  // =====================================================
  // NAME MATCH
  // =====================================================

  const nameMatches = useMemo(() => {

    if (!expectedName || !fullName.trim()) {
      return false;
    }

    return (
      fullName.trim() ===
      expectedName
    );

  }, [
    expectedName,
    fullName,
  ]);


  // =====================================================
  // DEVICE NAME
  // =====================================================

  const deviceName =
    device?.usb_model ||
    device?.model ||
    device?.Model ||
    "PenX USB Device";


  const deviceId =
    device?.id ||
    device?.device_id ||
    "";


  // =====================================================
  // WIPE READY
  // =====================================================

  const canSubmit =
    nameMatches &&
    password.trim().length > 0 &&
    confirmation &&
    !loading;


  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {

    if (loading) {
      return;
    }

    onClose?.();

  };


  // =====================================================
  // REQUEST REMOTE WIPE
  // =====================================================

  const handleWipe = async () => {

    setError("");

    // ---------------------------------------------------
    // Full name validation
    // ---------------------------------------------------

    if (!nameMatches) {

      setError(
        "Enter your full name exactly as shown in your PenX account."
      );

      return;

    }


    // ---------------------------------------------------
    // Password validation
    // ---------------------------------------------------

    if (!password.trim()) {

      setError(
        "Enter your PenX account password to continue."
      );

      return;

    }


    // ---------------------------------------------------
    // Final confirmation
    // ---------------------------------------------------

    if (!confirmation) {

      setError(
        "You must confirm that you understand the consequences."
      );

      return;

    }


    // ---------------------------------------------------
    // Device validation
    // ---------------------------------------------------

    if (!deviceId) {

      setError(
        "No valid PenX device was selected."
      );

      return;

    }


    try {

      setLoading(true);


      // =================================================
      // BACKEND REQUEST
      // =================================================

      const token =
        localStorage.getItem(
          "access_token"
        );


      if (!token) {

        throw new Error(
          "Your PenX session has expired. Please log in again."
        );

      }


      const apiBase =
        import.meta.env.VITE_API_URL ||
        "http://localhost:8000";


      const response =
        await fetch(
          `${apiBase}/security/remote-wipe`,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,

            },

            body: JSON.stringify({

              device_id:
                deviceId,

              full_name:
                fullName.trim(),

              password:
                password,

            }),

          }
        );


      // =================================================
      // RESPONSE
      // =================================================

      const data =
        await response
          .json()
          .catch(
            () => ({})
          );


      if (!response.ok) {

        throw new Error(

          data?.detail ||
          data?.message ||
          "Unable to request remote wipe."

        );

      }


      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(true);

      setPassword("");

      setConfirmation(false);


      onSuccess?.(data);


    } catch (err) {

      console.error(
        "Remote wipe request failed:",
        err
      );


      setError(
        err?.message ||
        "Remote wipe request failed."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // MODAL CLOSED
  // =====================================================

  if (!isOpen) {
    return null;
  }


  // =====================================================
  // SUCCESS SCREEN
  // =====================================================

  if (success) {

    return (

      <div
        className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-black/70
          px-4
          backdrop-blur-md
        "
      >

        <div
          className="
            w-full
            max-w-lg
            overflow-hidden
            rounded-2xl
            border
            border-cyan/20
            bg-[#07111f]
            shadow-2xl
          "
        >

          <div
            className="
              flex
              flex-col
              items-center
              px-8
              py-12
              text-center
            "
          >

            <div
              className="
                mb-6
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                border
                border-cyan/30
                bg-cyan/10
              "
            >

              <CheckCircle2
                size={34}
                className="text-cyan"
              />

            </div>


            <h2
              className="
                text-2xl
                font-semibold
                text-white
              "
            >
              Remote Wipe Requested
            </h2>


            <p
              className="
                mt-3
                max-w-md
                text-sm
                leading-6
                text-slate-400
              "
            >
              Your wipe request has been securely
              submitted for this device.
            </p>


            <div
              className="
                mt-6
                w-full
                rounded-xl
                border
                border-cyan/10
                bg-cyan/5
                px-5
                py-4
                text-left
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                <ShieldAlert
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                    text-cyan
                  "
                />

                <p
                  className="
                    text-xs
                    leading-5
                    text-slate-400
                  "
                >
                  The device will execute the wipe
                  when it securely reconnects to PenX.
                  Your PenX account is not being deleted.
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={handleClose}
              className="
                mt-8
                w-full
                rounded-xl
                bg-cyan
                px-5
                py-3
                text-sm
                font-semibold
                text-[#04101c]
                transition
                hover:bg-cyan/90
              "
            >
              Done
            </button>

          </div>

        </div>

      </div>

    );

  }


  // =====================================================
  // MAIN MODAL
  // =====================================================

  return (

    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/75
        px-4
        py-8
        backdrop-blur-md
      "
    >

      <div
        className="
          w-full
          max-w-2xl
          overflow-hidden
          rounded-2xl
          border
          border-red-500/20
          bg-[#07111f]
          shadow-2xl
        "
      >

        {/* =================================================
             HEADER
        ================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-white/5
            bg-red-500/[0.04]
            px-7
            py-6
          "
        >

          <div
            className="
              flex
              items-start
              gap-4
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-red-500/30
                bg-red-500/10
              "
            >

              <ShieldAlert
                size={22}
                className="text-red-400"
              />

            </div>


            <div>

              <h2
                className="
                  text-xl
                  font-semibold
                  text-white
                "
              >
                Remote Wipe
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-400
                "
              >
                Permanently remove PenX data
                from a selected device.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="
              rounded-lg
              p-2
              text-slate-500
              transition
              hover:bg-white/5
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >

            <X size={19} />

          </button>

        </div>


        {/* =================================================
             WARNING
        ================================================== */}

        <div
          className="
            mx-7
            mt-6
            rounded-xl
            border
            border-red-500/25
            bg-red-500/[0.06]
            p-5
          "
        >

          <div
            className="
              flex
              items-start
              gap-3
            "
          >

            <AlertTriangle
              size={20}
              className="
                mt-0.5
                shrink-0
                text-red-400
              "
            />


            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-red-300
                "
              >
                This action is destructive.
              </p>


              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-slate-400
                "
              >
                Remote Wipe will remove the selected
                PenX vault data from the device.
                Files removed by the wipe may not be
                recoverable.
              </p>


              <p
                className="
                  mt-2
                  text-xs
                  font-medium
                  leading-5
                  text-slate-300
                "
              >
                If you need any of these files,
                make a backup before continuing.
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
             DEVICE
        ================================================== */}

        <div
          className="
            px-7
            pt-6
          "
        >

          <p
            className="
              mb-3
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-slate-500
            "
          >
            Selected Device
          </p>


          <div
            className="
              flex
              items-center
              gap-4
              rounded-xl
              border
              border-white/10
              bg-white/[0.025]
              px-5
              py-4
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                bg-cyan/10
              "
            >

              <Usb
                size={19}
                className="text-cyan"
              />

            </div>


            <div className="min-w-0">

              <p
                className="
                  truncate
                  text-sm
                  font-medium
                  text-white
                "
              >
                {deviceName}
              </p>


              <p
                className="
                  mt-1
                  truncate
                  text-xs
                  text-slate-500
                "
              >
                Device ID:{" "}
                {deviceId || "Unavailable"}
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
             WIPE SCOPE
        ================================================== */}

        <div
          className="
            px-7
            pt-6
          "
        >

          <p
            className="
              mb-3
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-slate-500
            "
          >
            Data affected
          </p>


          <div
            className="
              grid
              grid-cols-1
              gap-2
              sm:grid-cols-2
            "
          >

            {[
              "Vault files",
              "Vault metadata",
              "Local key material",
              "Security logs",
              "PenX device identity",
              "Local device credentials",
            ].map(
              (item) => (

                <div
                  key={item}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-white/5
                    bg-white/[0.02]
                    px-3
                    py-2.5
                  "
                >

                  <CircleAlert
                    size={13}
                    className="text-red-400"
                  />

                  <span
                    className="
                      text-xs
                      text-slate-400
                    "
                  >
                    {item}
                  </span>

                </div>

              )
            )}

          </div>

        </div>


        {/* =================================================
             FULL NAME
        ================================================== */}

        <div
          className="
            px-7
            pt-6
          "
        >

          <label
            className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-300
            "
          >
            Confirm your full name
          </label>


          <p
            className="
              mb-3
              text-xs
              leading-5
              text-slate-500
            "
          >
            Type your full name exactly as it appears
            on your PenX account.
          </p>


          <input
            type="text"
            value={fullName}
            onChange={(event) => {

              setFullName(
                event.target.value
              );

              setError("");

            }}
            placeholder={
              expectedName ||
              "Your full name"
            }
            disabled={loading}
            autoComplete="name"
            className="
              w-full
              rounded-xl
              border
              border-white/10
              bg-black/20
              px-4
              py-3
              text-sm
              text-white
              outline-none
              placeholder:text-slate-600
              focus:border-red-500/40
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />


          {fullName.trim() && (

            <p
              className={`
                mt-2
                text-xs
                ${
                  nameMatches
                    ? "text-cyan"
                    : "text-red-400"
                }
              `}
            >

              {nameMatches
                ? "✓ Name confirmed"
                : "Name does not match your PenX account."}

            </p>

          )}

        </div>


        {/* =================================================
             PASSWORD
        ================================================== */}

        <div
          className="
            px-7
            pt-5
          "
        >

          <label
            className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-300
            "
          >
            Enter your password
          </label>


          <div
            className="
              relative
            "
          >

            <LockKeyhole
              size={17}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-600
              "
            />


            <input
              type="password"
              value={password}
              onChange={(event) => {

                setPassword(
                  event.target.value
                );

                setError("");

              }}
              placeholder="Enter your PenX password"
              disabled={loading}
              autoComplete="current-password"
              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-black/20
                py-3
                pl-11
                pr-4
                text-sm
                text-white
                outline-none
                placeholder:text-slate-600
                focus:border-red-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />

          </div>

        </div>


        {/* =================================================
             FINAL CONFIRMATION
        ================================================== */}

        <div
          className="
            px-7
            pt-5
          "
        >

          <label
            className="
              flex
              cursor-pointer
              items-start
              gap-3
              rounded-xl
              border
              border-white/10
              bg-white/[0.02]
              p-4
              transition
              hover:border-red-500/20
            "
          >

            <input
              type="checkbox"
              checked={confirmation}
              onChange={(event) =>
                setConfirmation(
                  event.target.checked
                )
              }
              disabled={loading}
              className="
                mt-0.5
                h-4
                w-4
                accent-red-500
              "
            />


            <span
              className="
                text-xs
                leading-5
                text-slate-400
              "
            >
              I understand that Remote Wipe will
              permanently remove the selected PenX
              device data and that this action cannot
              be undone through PenX.
            </span>

          </label>

        </div>


        {/* =================================================
             ERROR
        ================================================== */}

        {error && (

          <div
            className="
              mx-7
              mt-5
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-red-500/20
              bg-red-500/[0.06]
              px-4
              py-3
            "
          >

            <CircleAlert
              size={17}
              className="
                mt-0.5
                shrink-0
                text-red-400
              "
            />


            <p
              className="
                text-xs
                leading-5
                text-red-300
              "
            >
              {error}
            </p>

          </div>

        )}


        {/* =================================================
             FOOTER ACTIONS
        ================================================== */}

        <div
          className="
            mt-7
            flex
            flex-col-reverse
            gap-3
            border-t
            border-white/5
            px-7
            py-6
            sm:flex-row
            sm:justify-end
          "
        >

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="
              rounded-xl
              border
              border-white/10
              px-5
              py-3
              text-sm
              font-medium
              text-slate-400
              transition
              hover:bg-white/5
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Cancel
          </button>


          <button
            type="button"
            onClick={handleWipe}
            disabled={!canSubmit}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-500
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-600
              disabled:cursor-not-allowed
              disabled:opacity-35
            "
          >

            {loading ? (

              <>
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/30
                    border-t-white
                  "
                />

                Requesting Wipe...

              </>

            ) : (

              <>
                <ShieldAlert size={16} />

                Request Remote Wipe
              </>

            )}

          </button>

        </div>

      </div>

    </div>

  );
}