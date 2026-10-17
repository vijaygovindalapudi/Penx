import React, { useEffect, useState } from "react";
import {
  FolderOpen,
  Copy,
  Scissors,
  ClipboardPaste,
  Pencil,
  Trash2,
  FolderPlus,
  FilePlus,
  Lock,
  Unlock,
  Info,
  RefreshCw,
} from "lucide-react";

const MENU_WIDTH = 224;
const MENU_ESTIMATED_HEIGHT = 520;
const VIEWPORT_PADDING = 10;

const ExplorerContextMenu = ({
  visible,
  x,
  y,
  file,
  onOpen,
  onCopy,
  onCut,
  onPaste,
  onRename,
  onDelete,
  onEncrypt,
  onDecrypt,
  onNewFolder,
  onRefresh,
  onClose,
}) => {
  const [position, setPosition] = useState({
    top: y,
    left: x,
  });

  const isBackgroundMenu = file === null;

  /*
   * -------------------------------------------------------
   * SMART MENU POSITIONING
   * -------------------------------------------------------
   *
   * Click bottom/right side lo unte menu viewport bayata
   * vellakunda automatic ga opposite direction ki move avuthundi.
   */
  useEffect(() => {
    if (!visible) return;

    const updatePosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      /*
       * Background menu and file menu heights different.
       * File menu has more options.
       */
      const estimatedHeight = isBackgroundMenu
        ? 180
        : MENU_ESTIMATED_HEIGHT;

      let nextLeft = x;
      let nextTop = y;

      // -----------------------------------------
      // RIGHT EDGE
      // -----------------------------------------
      if (nextLeft + MENU_WIDTH > viewportWidth - VIEWPORT_PADDING) {
        nextLeft =
          viewportWidth - MENU_WIDTH - VIEWPORT_PADDING;
      }

      // -----------------------------------------
      // LEFT EDGE
      // -----------------------------------------
      if (nextLeft < VIEWPORT_PADDING) {
        nextLeft = VIEWPORT_PADDING;
      }

      // -----------------------------------------
      // BOTTOM EDGE
      // -----------------------------------------
      if (
        nextTop + estimatedHeight >
        viewportHeight - VIEWPORT_PADDING
      ) {
        nextTop = y - estimatedHeight;
      }

      // -----------------------------------------
      // TOP EDGE
      // -----------------------------------------
      if (nextTop < VIEWPORT_PADDING) {
        nextTop = VIEWPORT_PADDING;
      }

      setPosition({
        top: nextTop,
        left: nextLeft,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [visible, x, y, isBackgroundMenu]);

  if (!visible) return null;

  const handleAction = (action) => {
    action?.();
    onClose?.();
  };

  const itemClass =
    "flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-200 transition-colors duration-150 hover:bg-cyan-400/10 hover:text-cyan-300";

  return (
    <div
      className="
        penx-context-menu
        fixed
        z-[9999]
        w-56
        overflow-hidden
        rounded-xl
        border
        border-slate-700/80
        bg-slate-900
        text-white
        shadow-2xl
        shadow-black/50
      "
      style={{
        top: position.top,
        left: position.left,
        maxHeight: "calc(100vh - 20px)",
      }}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    >
      {isBackgroundMenu ? (
        <>
          <button
            type="button"
            onClick={() => handleAction(onPaste)}
            className={itemClass}
          >
            <ClipboardPaste
              size={18}
              strokeWidth={1.8}
              className="text-cyan-400"
            />
            <span>Paste</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onNewFolder)}
            className={itemClass}
          >
            <FolderPlus
              size={18}
              strokeWidth={1.8}
              className="text-cyan-400"
            />
            <span>New Folder</span>
          </button>

          <div className="my-1 border-t border-slate-700/70" />

          <button
            type="button"
            onClick={() => handleAction(onRefresh)}
            className={itemClass}
          >
            <RefreshCw
              size={18}
              strokeWidth={1.8}
              className="text-slate-400"
            />
            <span>Refresh</span>
          </button>
        </>
      ) : (
        <>
          {/* OPEN */}
          <button
            type="button"
            onClick={() => handleAction(onOpen)}
            className={itemClass}
          >
            <FolderOpen
              size={18}
              strokeWidth={1.8}
              className="text-cyan-400"
            />
            <span>Open</span>
          </button>

          {/* COPY */}
          <button
            type="button"
            onClick={() => handleAction(onCopy)}
            className={itemClass}
          >
            <Copy
              size={18}
              strokeWidth={1.8}
              className="text-slate-400"
            />
            <span>Copy</span>
          </button>

          {/* CUT */}
          <button
            type="button"
            onClick={() => handleAction(onCut)}
            className={itemClass}
          >
            <Scissors
              size={18}
              strokeWidth={1.8}
              className="text-slate-400"
            />
            <span>Cut</span>
          </button>

          {/* PASTE */}
          <button
            type="button"
            onClick={() => handleAction(onPaste)}
            className={itemClass}
          >
            <ClipboardPaste
              size={18}
              strokeWidth={1.8}
              className="text-slate-400"
            />
            <span>Paste</span>
          </button>

          <div className="my-1 border-t border-slate-700/70" />

          {/* RENAME */}
          <button
            type="button"
            onClick={() => handleAction(onRename)}
            className={itemClass}
          >
            <Pencil
              size={18}
              strokeWidth={1.8}
              className="text-slate-400"
            />
            <span>Rename</span>
          </button>

          {/* DELETE */}
          <button
            type="button"
            onClick={() => handleAction(onDelete)}
            className="
              flex
              w-full
              items-center
              gap-3
              px-4
              py-2.5
              text-sm
              text-red-400
              transition-colors
              duration-150
              hover:bg-red-400/10
              hover:text-red-300
            "
          >
            <Trash2
              size={18}
              strokeWidth={1.8}
            />
            <span>Delete</span>
          </button>

          <div className="my-1 border-t border-slate-700/70" />

          {/* NEW FOLDER */}
          <button
            type="button"
            onClick={() => handleAction(onNewFolder)}
            className={itemClass}
          >
            <FolderPlus
              size={18}
              strokeWidth={1.8}
              className="text-slate-400"
            />
            <span>New Folder</span>
          </button>

          {/* NEW FILE */}
          <button
            type="button"
            className={itemClass}
          >
            <FilePlus
              size={18}
              strokeWidth={1.8}
              className="text-slate-400"
            />
            <span>New File</span>
          </button>

          <div className="my-1 border-t border-slate-700/70" />

          {/* ENCRYPT / DECRYPT */}
          {file?.name
            ?.toLowerCase()
            .endsWith(".penx") ? (
            <button
              type="button"
              onClick={() => handleAction(onDecrypt)}
              className={itemClass}
            >
              <Unlock
                size={18}
                strokeWidth={1.8}
                className="text-cyan-400"
              />
              <span>Decrypt</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleAction(onEncrypt)}
              className={itemClass}
            >
              <Lock
                size={18}
                strokeWidth={1.8}
                className="text-cyan-400"
              />
              <span>Encrypt</span>
            </button>
          )}

          {/* PROPERTIES */}
          <button
            type="button"
            className={itemClass}
          >
            <Info
              size={18}
              strokeWidth={1.8}
              className="text-slate-400"
            />
            <span>Properties</span>
          </button>
        </>
      )}
    </div>
  );
};

export default ExplorerContextMenu;