"use client";

import Header from "@/components/header";
import { useAuth } from "@/domains/user/hooks/use-auth";
import { User } from "@/domains/user/types/user.type";
import Link from "next/link";

const Home = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen items-center justify-center w-full bg-gray-50">
        <LoginStatusSection
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          user={user}
        />

        <Link href="/protected" className="text-blue-500">
          인증 보호 페이지
        </Link>
      </div>
    </>
  );
};

export default Home;

const LoginStatusSection = ({
  isAuthenticated,
  isLoading,
  user,
}: {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}) => {
  if (isLoading)
    return (
      <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
    );
  if (isAuthenticated) return <div>로그인 되었습니다. {user?.email}</div>;
  return <div>로그인 되지 않았습니다</div>;
};
