import React from "react";
import { FaGoogle } from "react-icons/fa";
const Login = () => {
  const loginThroughGoogle = () => {
    const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;
    window.open(`${BACKEND_URL}/auth/google`, "_self");
  }
  return (
    <div className="container bg-stone-700 w-400 mx-auto p-10 rounded-lg shadow-xl space-y-16 mt-40 border border-solid border-stone-500">
      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-2 text-gray-200 text-2xl font-semibold">
          Login
        </span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
      <div>
        <button
          className="flex gap-2 items-center justify-center w-full bg-gray-950 p-4 rounded-lg shadow-sm"
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
