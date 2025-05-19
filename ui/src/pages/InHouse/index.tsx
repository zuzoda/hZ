import "./index.sass";
import Header from "./Partials/Header";
import { useTranslation } from "react-i18next";
import { LeftBar } from "./Partials/LeftBar";
import { Indicators } from "./Partials/Indicators";
import { Permissions } from "./Partials/Permissions";
import { useEffect } from "react";
import { isEnvBrowser } from "@/utils/misc";
import { fetchNui } from "@/utils/fetchNui";
import { useVisibility } from "@/hooks/useVisibility";

export const InHouse: React.FC = () => {
  const { t } = useTranslation();
  const { visible, setVisible } = useVisibility();

  useEffect(() => {
    if (!visible) return;
    const keyHandler = (e: KeyboardEvent) => {
      if (!isEnvBrowser() && ["Escape"].includes(e.code)) {
        fetchNui("nui:hideFrame", true, true);
        setVisible(false);
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [visible, setVisible]);

  return (
    <>
      <div className="w-full h-full px-4 py-4 md:py-8 lg:py-14 md:px-10 lg:px-20 bg-242732/25">
        <div className="flex flex-col max-w-screen-xl mx-auto w-full h-full z-10 relative">
          <Header />
          <div className="bg-242732 mt-4 rounded-lg w-full h-full p-4 overflow-auto">
            <div className="flex max-lg:flex-col gap-6 h-full overflow-auto scrollbar-hide">
              <div className="w-full lg:h-full h-min lg:max-w-[405px] bg-1E212C rounded">
                <LeftBar />
              </div>
              <div className="flex flex-col flex-1">
                <h1 className="text-2xl font-DMSans font-bold -mb-3">
                  {t("house_system")}
                </h1>
                <Indicators />
                <h1 className="mt-4 text-2xl font-DMSans font-bold">
                  {t("permissions")}
                </h1>
                <Permissions />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
