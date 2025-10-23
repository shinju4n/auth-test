"use client";
import { useAuth } from "@/domains/user/hooks/use-auth";
import { useLogout } from "@/domains/user/hooks/use-logout";
import Link from "next/link";

const Header = () => {
  return (
    <header className="w-full flex justify-between items-center p-4">
      <div className="flex items-center gap-4 text-blue-500">
        <Link href="/">Home</Link>
        <Link href="/protected">Protected</Link>
      </div>
      <AuthButton />
    </header>
  );
};
export default Header;

const AuthButton = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const { handleLogout } = useLogout();
  if (isLoading)
    return (
      <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
    );
  if (isAuthenticated) return <button onClick={handleLogout}>로그아웃</button>;
  return <Link href="/login">로그인</Link>;
};
