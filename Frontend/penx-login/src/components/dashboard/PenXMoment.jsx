import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Heart,
  X,
  ArrowRight,
} from "lucide-react";

import {
  getPenXMoment,
} from "../../utils/penxMomentEngine";

// ======================================================
// PenX Moment
// ======================================================
//
// Small, warm message shown when the Dashboard opens.
//
// Responsibilities:
// - Get a fresh PenX Moment
// - Display it beautifully
// - Support close / continue
// - Support optional user name
// - Keep the component independent from Dashboard logic
//
// ======================================================

const PenXMoment = ({
  userName = "",
  open = true,
  onClose,
}) => {

  // ====================================================
  // State
  // ====================================================

  const [moment, setMoment] =
    useState(null);

  const [visible, setVisible] =
    useState(false);

  const [closing, setClosing] =
    useState(false);

  // ====================================================
  // Load Moment
  // ====================================================

  useEffect(() => {

    if (!open) {
      return;
    }

    try {

      const selectedMoment =
        getPenXMoment(
          userName
        );

      setMoment(
        selectedMoment
      );

      // Small delay gives the popup
      // a smooth entrance animation.

      const timer =
        setTimeout(() => {

          setVisible(true);

        }, 80);

      return () => {
        clearTimeout(timer);
      };

    } catch (error) {

      console.error(
        "PenX Moment Error:",
        error
      );

      setMoment(null);

    }

  }, [open, userName]);

  // ====================================================
  // Close Handler
  // ====================================================

  const handleClose = () => {

    setClosing(true);

    setVisible(false);

    // Allow exit animation to complete
    // before removing the component.

    setTimeout(() => {

      setClosing(false);

      if (typeof onClose === "function") {
        onClose();
      }

    }, 220);

  };

  // ====================================================
  // Don't Render
  // ====================================================

  if (!open) {
    return null;
  }

  if (!moment) {
    return null;
  }

  if (closing && !visible) {
    // Keep mounted during animation.
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <div
      className={`
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        px-4
        transition-all
        duration-300
        ${
          visible
            ? "bg-black/55 backdrop-blur-[3px]"
            : "bg-black/0"
        }
      `}
    >

      {/* ==================================================
          Popup Card
          ================================================== */}

      <div
        className={`
          relative
          w-full
          max-w-[500px]
          overflow-hidden
          rounded-3xl
          border
          border-slate-700/70
          bg-slate-900
          shadow-2xl
          transition-all
          duration-300
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-5 scale-95 opacity-0"
          }
        `}
      >

        {/* ==================================================
            Decorative Glow
            ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-48
            w-48
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            -left-20
            h-52
            w-52
            rounded-full
            bg-blue-500/10
            blur-3xl
          "
        />

        {/* ==================================================
            Close Button
            ================================================== */}

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close PenX Moment"
          className="
            absolute
            right-4
            top-4
            z-10
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-slate-700
            bg-slate-800/80
            text-slate-400
            transition
            hover:border-slate-600
            hover:bg-slate-700
            hover:text-white
          "
        >
          <X size={18} />
        </button>

        {/* ==================================================
            Content
            ================================================== */}

        <div
          className="
            relative
            px-7
            pb-7
            pt-8
            sm:px-9
            sm:pb-8
            sm:pt-9
          "
        >

          {/* ==================================================
              Icon
              ================================================== */}

          <div
            className="
              mx-auto
              mb-5
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-cyan-400/20
              bg-cyan-400/10
              shadow-lg
              shadow-cyan-500/5
            "
          >
            <Sparkles
              size={28}
              className="text-cyan-400"
            />
          </div>

          {/* ==================================================
              Small Label
              ================================================== */}

          <div className="mb-2 text-center">

            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.22em]
                text-cyan-400
              "
            >
              PenX Moment
            </span>

          </div>

          {/* ==================================================
              Title
              ================================================== */}

          <h2
            className="
              text-center
              text-2xl
              font-bold
              tracking-tight
              text-white
              sm:text-[26px]
            "
          >
            {moment.title ||
              "A little something for you"}
          </h2>

          {/* ==================================================
              Message
              ================================================== */}

          <div
            className="
              mx-auto
              mt-6
              max-w-[420px]
            "
          >

            <p
              className="
                text-center
                text-[16px]
                leading-7
                text-slate-300
                sm:text-[17px]
              "
            >
              “{moment.message}”
            </p>

          </div>

          {/* ==================================================
              PenX Signature
              ================================================== */}

          <div
            className="
              mt-5
              flex
              items-center
              justify-center
              gap-2
            "
          >

            <div
              className="
                h-px
                w-8
                bg-slate-700
              "
            />

            <span
              className="
                text-xs
                font-medium
                text-slate-500
              "
            >
              — PenX
            </span>

            <div
              className="
                h-px
                w-8
                bg-slate-700
              "
            />

          </div>

          {/* ==================================================
              Action Area
              ================================================== */}

          <div
            className="
              mt-7
              flex
              items-center
              justify-center
            "
          >

            <button
              type="button"
              onClick={handleClose}
              className="
                group
                flex
                items-center
                gap-2
                rounded-xl
                bg-cyan-400
                px-6
                py-3
                text-sm
                font-semibold
                text-slate-950
                shadow-lg
                shadow-cyan-500/10
                transition-all
                duration-200
                hover:bg-cyan-300
                hover:shadow-cyan-500/20
                active:scale-[0.98]
              "
            >

              <span>
                Continue to PenX
              </span>

              <ArrowRight
                size={17}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              />

            </button>

          </div>

          {/* ==================================================
              Small Footer
              ================================================== */}

          <div
            className="
              mt-5
              flex
              items-center
              justify-center
              gap-1.5
              text-xs
              text-slate-600
            "
          >

            <Heart
              size={11}
              className="fill-current"
            />

            <span>
              A small reminder from PenX
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PenXMoment;