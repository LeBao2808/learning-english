import SiteFooter from "@/components/SiteFooter";

// Content pages get the footer; the full-screen practice chat does not.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
