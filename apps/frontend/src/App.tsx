import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Game from "./pages/Game";
import { Toaster } from "sonner";
import { useUser } from "@repo/store/useUser";
import { RecoilRoot } from "recoil";
import Loader from "./components/Loader/Loader";
import { Suspense } from "react";
import Login from "./pages/Login";
const App = () => {
  return (
    <div className="h-screen p-2 text-white relative">
      <RecoilRoot>
        <Suspense fallback={<Loader />}>
          <AuthApp />
        </Suspense>
      </RecoilRoot>
    </div>
  );
};

const AuthApp = () => {
  // const user = useUser();
  // console.log(user);
  return (
    <BrowserRouter>
      <Toaster richColors />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/play/:roomId" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
