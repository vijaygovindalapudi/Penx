import SidebarContent from './SidebarContent';

/**
 * Static glass sidebar shown on lg+ screens. On smaller screens the
 * MobileDrawer variant is used instead (toggled from the header).
 */
export default function Sidebar() {
  return (
    <aside className="relative hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-surface/80 px-4 py-6 backdrop-blur-xl lg:flex">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />
      <SidebarContent />
    </aside>
  );
}
