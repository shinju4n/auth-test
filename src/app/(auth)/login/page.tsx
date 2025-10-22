"use client";

import { useLogin } from "./service/use-login";

const LoginPage = () => {
  const {
    email,
    password,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
  } = useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        className="flex flex-col gap-4 max-w-md w-full"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <input
          type="text"
          placeholder="Email"
          className="border border-gray-300 rounded-md p-2"
          value={email}
          onChange={handleEmailChange}
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 rounded-md p-2"
          value={password}
          onChange={handlePasswordChange}
        />
        <button type="submit" className="bg-blue-500 text-white rounded-md p-2">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
