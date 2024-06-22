import { useRecoilState } from "recoil";
import { boardThemeAtom, themeMapping } from "@repo/store/theme";
const Settings = () => {
  const [boardTheme, setBoardTheme] = useRecoilState(boardThemeAtom);
  const arr: number[][] = [
    [1, 2],
    [4, 5],
  ];
  const handleThemeChange = (theme: typeof boardTheme) => {
    setBoardTheme(theme);
    localStorage.setItem("boardTheme", theme);
  };
  return (
    <div className="absolute  bg-black bg-opacity-25 p-3 -top-20 -right-56 rounded-lg">
      <div className="flex gap-2 justify-between items-center">
        <div>
          <div className="dropdown dropdown-hover dropdown-top">
            <div tabIndex={0} role="button" className="btn no-animation  m-1">
              Board Theme
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-stone-800 rounded-box space-y-2 border-b-[1]"
            >
              <button
                className="btn"
                onClick={() => handleThemeChange("brown")}
              >
                Brown
              </button>
              <button className="btn" onClick={() => handleThemeChange("neo")}>
                Neo
              </button>
              <button className="btn" onClick={() => handleThemeChange("gray")}>
                Gray
              </button>
            </ul>
          </div>
        </div>
        <div className="flex flex-col">
          {arr.map((row, i) => {
            return (
              <div key={i} className="flex">
                {row.map((_, j) => {
                  const isBlackSquare = (i + j) % 2;
                  return (
                    <div
                      key={_}
                      style={{
                        backgroundColor: isBlackSquare ? themeMapping[boardTheme].black : themeMapping[boardTheme].white
                      }}
                      className={`size-10 transition-colors duration-500`}
                    ></div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Settings;
