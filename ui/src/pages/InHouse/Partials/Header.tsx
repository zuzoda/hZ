import useData from "@/hooks/useData";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { t } = useTranslation();
  const { inHouse, defaultHouses } = useData();

  const HouseDetails = defaultHouses.find((v) => v.houseId == inHouse?.houseId);

  return (
    <>
      <div className="rounded-lg bg-1E212C min-h-[132px] max-h-[132px] overflow-hidden">
        <div className="relative flex h-full">
          <div className="relative">
            <div className="absolute">
              <div className="w-40 h-40 -translate-x-1 -translate-y-4 border border-5AE1FF1A rounded-full flex items-center justify-center">
                <div className="w-28 h-28 border border-[#CF4E5B] rounded-full opacity-30"></div>
              </div>
            </div>
            <img
              className="-translate-x-4 min-w-[180p x] max-w-[180px]"
              src="images/core/building-full.png"
              alt="header-image-building"
            />
          </div>
          <div className="my-auto text-xl font-bold">
            <h1 className="uppercase font-DMSans font-bold -mb-2">
              {t("house")}
            </h1>
            <h1 className="uppercase font-DMSans font-bold text-4xl">
              {t("security")}
            </h1>
          </div>
          <div className="my-auto ml-auto mr-6">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <h1 className="font-DMSans font-bold">
                  {HouseDetails?.label}{" "}
                  <span>#{inHouse?.houseId}</span>
                </h1>
                <h1 className="text-white opacity-50 text-sm">
                  {HouseDetails?.coords_label}
                </h1>
              </div>
              <div className="ml-2">
                <img
                  className="w-6"
                  src="images/icons/location-2.svg"
                  alt="location-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
