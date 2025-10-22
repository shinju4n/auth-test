const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="flex flex-col gap-4 max-w-md w-full">
        <input
          type="text"
          placeholder="Email"
          className="border border-gray-300 rounded-md p-2"
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 rounded-md p-2"
        />
        <button type="submit" className="bg-blue-500 text-white rounded-md p-2">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
