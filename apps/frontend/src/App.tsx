import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Game from "./pages/Game";
import { Toaster } from "sonner";
import { useUser } from "@repo/store/useUser";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import Loader from "./components/Loader/Loader";
import { Suspense, useEffect } from "react";
import Login from "./pages/Login";
import Layout from "./components/layout";
import { boardThemeAtom, themeAtom } from "@repo/store/theme";
const App = () => {
  return (
    <div className={`text-white `}>
      <RecoilRoot>
        <Suspense fallback={<Loader />}>
          <AuthApp />
        </Suspense>
      </RecoilRoot>
    </div>
  );
};

const AuthApp = () => {
  const [boardTheme, setBoardTheme] = useRecoilState(boardThemeAtom);
  useEffect(() => {
    const localBoardTheme = localStorage.getItem(
      "boardTheme"
    ) as typeof boardTheme;
    if (localBoardTheme) {
      setBoardTheme(localBoardTheme);
    } else {
      setBoardTheme("brown");
      localStorage.setItem("boardTheme", boardTheme);
    }
  }, []);
  const user = useUser();
  const theme = useRecoilValue(themeAtom);

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <BrowserRouter>
        <Toaster richColors />
        <Routes>
          <Route path="/" element={<Layout children={<Landing />} />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/play/:roomId"
            element={<Layout children={<Game />} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
