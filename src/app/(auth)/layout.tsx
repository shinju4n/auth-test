import { Suspense } from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense>{children}</Suspense>;
};

export default AuthLayout;
