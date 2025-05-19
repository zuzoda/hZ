import Modal from "@/components/Modal";
import useData from "@/hooks/useData";
import { indicatorsTypes } from "@/types/BasicTypes";
import { fetchNui } from "@/utils/fetchNui";
import classNames from "classnames";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChartPie } from "react-icons/fa";
import { GiTwoCoins } from "react-icons/gi";
import { ImFire } from "react-icons/im";

export const Indicators = () => {
  const { inHouse, indicatorSettings } = useData();
  const { t } = useTranslation();

  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);

  const handleBuyIndicator = (type: indicatorsTypes) => {
    fetchNui("nui:buyIndicatorByType", type, true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-medium text-md text-white/50">{t("indicators")}</h1>
        <button onClick={() => setIsShopOpen(true)} className="-mt-5 p-2.5 bg-white/10 rounded-xl border border-white/35 hover:border-white group">
          <FaChartPie className="text-white group-hover:rotate-90 transition duration-1000" />
        </button>
      </div>
      <div className="mt-4 grid gap-2 grid-cols-4 max-xl:grid-cols-2">
        <div className="bg-1E212C rounded-md pr-4 h-[50px] flex items-center">
          <img src="images/icons/electric.svg" alt="electric" />
          <div className="w-full">
            <div className="w-full flex items-center justify-between">
              <h1 className="text-white/70 text-sm 2k:text-base font-bold font-DMSans uppercase">{t("electricity")}</h1>
              <span
                className={classNames("text-xs 2k:text-base font-bold font-DMSans", {
                  "animate-pulse": inHouse?.indicators?.electricity == 0,
                })}
              >
                {inHouse?.indicators?.electricity}
              </span>
            </div>
            <div className="mt-1 relative h-1 bg-[#D9D9D9]/10 rounded overflow-hidden">
              <div
                className="absolute h-1 bg-[#AAD84A] rounded-md"
                style={{
                  width: `${(inHouse?.indicators?.electricity / indicatorSettings?.electricity?.maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="bg-1E212C rounded-md pr-4 h-[50px] flex items-center">
          <img src="images/icons/power.svg" alt="power" />
          <div className="w-full">
            <div className="w-full flex items-center justify-between">
              <h1 className="text-white/70 text-sm 2k:text-base font-bold font-DMSans uppercase">{t("power")}</h1>
              <span
                className={classNames("text-xs 2k:text-base font-bold font-DMSans", {
                  "animate-pulse": inHouse?.indicators?.power == 0,
                })}
              >
                {inHouse?.indicators?.power}
              </span>
            </div>
            <div className="mt-1 relative h-1 bg-[#D9D9D9]/10 rounded overflow-hidden">
              <div
                className="absolute h-1 bg-[#5CE382] rounded-md"
                style={{
                  width: `${(inHouse?.indicators?.power / indicatorSettings?.power?.maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="bg-1E212C rounded-md pr-4 h-[50px] flex items-center">
          <div className="w-10 h-10 p-2.5">
            <ImFire className="text-[#FFD74A] w-full h-full" />
          </div>
          <div className="w-full">
            <div className="w-full flex items-center justify-between">
              <h1 className="text-white/70 text-sm 2k:text-base font-bold font-DMSans uppercase">{t("gas")}</h1>
              <span
                className={classNames("text-xs 2k:text-base font-bold font-DMSans", {
                  "animate-pulse": inHouse?.indicators?.gas == 0,
                })}
              >
                {inHouse?.indicators?.gas}
              </span>
            </div>
            <div className="mt-1 relative h-1 bg-[#D9D9D9]/10 rounded overflow-hidden">
              <div
                className="absolute h-1 bg-[#FFD74A] rounded-md"
                style={{
                  width: `${(inHouse?.indicators?.gas / indicatorSettings?.gas?.maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="bg-1E212C rounded-md pr-4 h-[50px] flex items-center">
          <img src="images/icons/water.svg" alt="water" />
          <div className="w-full">
            <div className="w-full flex items-center justify-between">
              <h1 className="text-white/70 text-sm 2k:text-base font-bold font-DMSans uppercase">{t("water")}</h1>
              <span
                className={classNames("text-xs 2k:text-base font-bold font-DMSans", {
                  "animate-pulse": inHouse?.indicators?.water == 0,
                })}
              >
                {inHouse?.indicators?.water}
              </span>
            </div>
            <div className="mt-1 relative h-1 bg-[#D9D9D9]/10 rounded overflow-hidden">
              <div
                className="absolute h-1 bg-[#55A3FF] rounded-md"
                style={{
                  width: `${(inHouse?.indicators?.water / indicatorSettings?.water?.maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <>
        <Modal show={isShopOpen} closeable onClose={() => setIsShopOpen(false)} className="max-w-md p-4 shadow-sm">
          <>
            <div>
              <h1 className="text-xl font-bold font-DMSans 2k:text-3xl">{t("shop")}</h1>
              <h1 className="text-white/50 text-sm 2k:text-base">{t("desc_shop")}</h1>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center">
                <div className="w-12 2k:w-16 flex items-center justify-center">
                  <img className="w-full h-full" src="images/icons/electric.svg" alt="electric" />
                </div>
                <div className="w-full">
                  <div className="w-full flex items-center justify-between">
                    <h1 className="text-white/70 text-sm 2k:text-base font-bold font-DMSans uppercase">{t("electricity")}</h1>
                    <span
                      className={classNames("text-xs 2k:text-base font-bold font-DMSans", {
                        "animate-pulse": inHouse?.indicators?.electricity == 0,
                      })}
                    >
                      {inHouse?.indicators?.electricity}
                      <span className="text-white/75">
                        {" / "}
                        {indicatorSettings?.electricity?.maxValue}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 relative h-1 bg-[#D9D9D9]/10 rounded overflow-hidden">
                    <div
                      className="absolute h-1 bg-[#AAD84A] rounded-md"
                      style={{
                        width: `${(inHouse?.indicators?.electricity / indicatorSettings?.electricity?.maxValue) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs 2k:text-base text-white/50 bottom-0 translate-y-2.5">
                    {t("desc_shop_buy", {
                      unit: t("unit_x_money", {
                        unit: indicatorSettings?.electricity?.unitPrice,
                        money_type: t("money_type"),
                      }),
                    })}{" "}
                    [{100 * indicatorSettings?.electricity?.unitPrice} {t("money_type")}]
                  </span>
                </div>
                <div className="ml-2">
                  <button onClick={() => handleBuyIndicator("electricity")} className="relative flex items-center justify-center p-2 rounded-full bg-white/10 border-2 border-white/50 hover:border-white text-white">
                    <GiTwoCoins className="w-5 h-5" />
                    <span className="absolute bottom-0 right-0.5 font-bold">{"+"}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 2k:w-16 flex items-center justify-center">
                  <img className="w-full h-full" src="images/icons/power.svg" alt="power" />
                </div>
                <div className="w-full">
                  <div className="w-full flex items-center justify-between">
                    <h1 className="text-white/70 text-sm 2k:text-base font-bold font-DMSans uppercase">{t("power")}</h1>
                    <span
                      className={classNames("text-xs 2k:text-base font-bold font-DMSans", {
                        "animate-pulse": inHouse?.indicators?.power == 0,
                      })}
                    >
                      {inHouse?.indicators?.power}
                      <span className="text-white/75">
                        {" / "}
                        {indicatorSettings?.power?.maxValue}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 relative h-1 bg-[#D9D9D9]/10 rounded overflow-hidden">
                    <div
                      className="absolute h-1 bg-[#5CE382] rounded-md"
                      style={{
                        width: `${(inHouse?.indicators?.power / indicatorSettings?.power?.maxValue) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs 2k:text-base text-white/50 bottom-0 translate-y-2.5">
                    {t("desc_shop_buy", {
                      unit: t("unit_x_money", {
                        unit: indicatorSettings?.power?.unitPrice,
                        money_type: t("money_type"),
                      }),
                    })}{" "}
                    [{100 * indicatorSettings?.power?.unitPrice} {t("money_type")}]
                  </span>
                </div>
                <div className="ml-2">
                  <button onClick={() => handleBuyIndicator("power")} className="relative flex items-center justify-center p-2 rounded-full bg-white/10 border-2 border-white/50 hover:border-white text-white">
                    <GiTwoCoins className="w-5 h-5" />
                    <span className="absolute bottom-0 right-0.5 font-bold">{"+"}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 2k:w-16 flex items-center justify-center">
                  <ImFire className="text-[#FFD74A]" />
                </div>
                <div className="w-full">
                  <div className="w-full flex items-center justify-between">
                    <h1 className="text-white/70 text-sm 2k:text-base font-bold font-DMSans uppercase">{t("gas")}</h1>
                    <span
                      className={classNames("text-xs 2k:text-base font-bold font-DMSans", {
                        "animate-pulse": inHouse?.indicators?.gas == 0,
                      })}
                    >
                      {inHouse?.indicators?.gas}
                      <span className="text-white/75"> / {indicatorSettings?.gas?.maxValue}</span>
                    </span>
                  </div>
                  <div className="mt-1 relative h-1 bg-[#D9D9D9]/10 rounded overflow-hidden">
                    <div
                      className="absolute h-1 bg-[#FFD74A] rounded-md"
                      style={{
                        width: `${(inHouse?.indicators?.gas / indicatorSettings?.gas?.maxValue) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs 2k:text-base text-white/50 bottom-0 translate-y-2.5">
                    {t("desc_shop_buy", {
                      unit: t("unit_x_money", {
                        unit: indicatorSettings?.gas?.unitPrice,
                        money_type: t("money_type"),
                      }),
                    })}{" "}
                    [{100 * indicatorSettings?.gas?.unitPrice} {t("money_type")}]
                  </span>
                </div>
                <div className="ml-2">
                  <button onClick={() => handleBuyIndicator("gas")} className="relative flex items-center justify-center p-2 rounded-full bg-white/10 border-2 border-white/50 hover:border-white text-white">
                    <GiTwoCoins className="w-5 h-5" />
                    <span className="absolute bottom-0 right-0.5 font-bold">{"+"}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 2k:w-16 flex items-center justify-center">
                  <img className="w-12 h-12 2k:w-16 2k:h-16" src="images/icons/water.svg" alt="water" />
                </div>
                <div className="w-full">
                  <div className="w-full flex items-center justify-between">
                    <h1 className="text-white/70 text-sm 2k:text-base font-bold font-DMSans uppercase">{t("water")}</h1>
                    <span
                      className={classNames("text-xs 2k:text-base font-bold font-DMSans", {
                        "animate-pulse": inHouse?.indicators?.water == 0,
                      })}
                    >
                      {inHouse?.indicators?.water}
                      <span className="text-white/75"> / {indicatorSettings?.water?.maxValue}</span>
                    </span>
                  </div>
                  <div className="mt-1 relative h-1 bg-[#D9D9D9]/10 rounded overflow-hidden">
                    <div
                      className="absolute h-1 bg-[#55A3FF] rounded-md"
                      style={{
                        width: `${(inHouse?.indicators?.water / indicatorSettings?.water?.maxValue) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs 2k:text-base text-white/50 bottom-0 translate-y-2.5">
                    {t("desc_shop_buy", {
                      unit: t("unit_x_money", {
                        unit: indicatorSettings?.water?.unitPrice,
                        money_type: t("money_type"),
                      }),
                    })}{" "}
                    [{100 * indicatorSettings?.water?.unitPrice} {t("money_type")}]
                  </span>
                </div>
                <div className="ml-2">
                  <button onClick={() => handleBuyIndicator("water")} className="relative flex items-center justify-center p-2 rounded-full bg-white/10 border-2 border-white/50 hover:border-white text-white">
                    <GiTwoCoins className="w-5 h-5" />
                    <span className="absolute bottom-0 right-0.5 font-bold">{"+"}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <button onClick={() => setIsShopOpen(false)} className="bg-242732 border border-white/10 hover:brightness-110 w-full p-1.5 rounded-md">
                <h1 className="text-white font-DMSans font-semibold">{t("cancel")}</h1>
              </button>
            </div>
          </>
        </Modal>
      </>
    </>
  );
};
