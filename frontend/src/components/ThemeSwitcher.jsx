import { useTheme } from "../context/ThemeContext";
import LightIcon from "../assets/light.png";
import DarkIcon from "../assets/night-mode.png";

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-center">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          onChange={toggleTheme}
          checked={theme === "dark"}
        />
        <div className="w-14 h-7 border border-black dark:bg-gray-700 dark:border-none rounded-full peer transition-colors"></div>
        <div
          className={`absolute left-1 top-1 w-5 h-5 rounded-full shadow-md transform transition-transform ${
            theme === "dark" ? "translate-x-7" : "translate-x-0"
          } flex items-center justify-center text-sm`}
        >
          {theme === "dark" ? <img src={DarkIcon} alt="" className="h-full" /> : <img src={LightIcon} alt="" className="h-full" />}
        </div>
      </label>
    </div>
  );
};

export default ThemeSwitcher;
