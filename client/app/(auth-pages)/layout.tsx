import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="w-full flex justify-center flex-col gap-12 items-center">
        {children}
      </div>
      <Footer />
    </>
  );
}
