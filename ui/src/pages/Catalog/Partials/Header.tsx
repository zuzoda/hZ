import useData from "@/hooks/useData";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { t } = useTranslation();
  const { availableHouses } = useData();

  return (
    <>
      <div className="rounded-lg bg-1E212C min-h-[132px] max-h-[132px] overflow-hidden">
        <div className="relative flex h-full">
          <div className="relative">
            <div className="absolute">
              <div className="w-40 h-40 -translate-x-1 -translate-y-4 border border-5AE1FF1A rounded-full flex items-center justify-center">
                <div className="w-28 h-28 border border-5AFFCE rounded-full opacity-30"></div>
              </div>
            </div>
            <img className="-translate-x-4 min-w-[180p x] max-w-[180px]" src="images/core/building-full.png" alt="header-image-building" />
          </div>
          <div className="my-auto">
            <img src="images/icons/catalog-title.svg" alt="catalog-title" />
          </div>
          <div className="my-auto ml-auto mr-14">
            <div className="flex">
              <div className="flex flex-col items-end mr-9">
                <h1 className="font-DMSans font-medium text-[#FFFFFF]/60">{t("available_houses")}</h1>
                <span className="text-white font-bold font-DMSans">{availableHouses.length}</span>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute flex items-center justify-center">
                  <div className="w-16 h-16 border rounded-full border-white opacity-30"></div>
                  <div className="absolute w-12 h-12 border rounded-full border-white opacity-80"></div>
                </div>
                <img className="min-w-6 max-w-6" src="images/icons/house-building.svg" alt="house-building" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
