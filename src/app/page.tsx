"use client";

import { useAuth } from "@/domains/user/hooks/use-auth";
import { useLogout } from "@/domains/user/hooks/use-logout";
import { User } from "@/domains/user/types/user.type";
import Link from "next/link";

const Home = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { handleLogout } = useLogout();

  console.log(isAuthenticated ? "로그인" : "로그아웃");
  console.log("user", user);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center w-full bg-gray-50">
      <LoginSection
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        user={user}
      />

      {!isAuthenticated ? (
        <div>
          <Link href="/login" className="text-blue-500">
            로그인 페이지
          </Link>
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              handleLogout();
            }}
          >
            로그아웃
          </button>
        </div>
      )}

      <Link href="/protected" className="text-blue-500">
        인증 보호 페이지
      </Link>
    </div>
  );
};

export default Home;

const LoginSection = ({
  isAuthenticated,
  isLoading,
  user,
}: {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}) => {
  if (isLoading) return <div>로그인 검증 중</div>;
  if (isAuthenticated) return <div>로그인 되었습니다. {user?.email}</div>;
  return <div>로그인 되지 않았습니다</div>;
};
