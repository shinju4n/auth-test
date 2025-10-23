import Header from "@/components/header";

const ProtectedPage = () => {
  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen items-center justify-center w-full bg-gray-50">
        보호된 페이지
      </div>
    </>
  );
};

export default ProtectedPage;
