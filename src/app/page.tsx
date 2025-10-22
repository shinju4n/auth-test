import Link from "next/link";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center w-full bg-gray-50">
      <Link href="/login" className="text-blue-500">
        로그인 페이지
      </Link>
      <Link href="/protected" className="text-blue-500">
        인증 보호 페이지
      </Link>
    </div>
  );
};

export default Home;
