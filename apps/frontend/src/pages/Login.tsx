import React from "react";
import { FaGoogle } from "react-icons/fa";
const Login = () => {
  const loginThroughGoogle = () => {
    const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;
    window.open(`${BACKEND_URL}/auth/google`, "_self");
  };
  return (
    <div className="container mx-auto mt-40 w-400 space-y-16 rounded-lg border border-solid border-stone-500 bg-stone-700 p-10 shadow-xl">
      <div className="relative flex items-center py-5">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="mx-2 flex-shrink text-2xl font-semibold text-gray-200">
          Login
        </span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
      <div>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-950 p-4 shadow-sm"
          onClick={() => loginThroughGoogle()}
        >
          <div className="text-lg">
            <FaGoogle />
          </div>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
