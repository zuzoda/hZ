import Modal from "@/components/Modal";
import Header from "./Partials/Header";
import { useEffect, useState } from "react";
import useData from "@/hooks/useData";
import { useTranslation } from "react-i18next";
import { iHouse, vec3 } from "@/types/BasicTypes";
import { fetchNui } from "@/utils/fetchNui";
import { formatNumber, isEnvBrowser } from "@/utils/misc";
import { useVisibility } from "../../hooks/useVisibility";

export const Catalog: React.FC = () => {
  const { t } = useTranslation();
  const { visible, setVisible } = useVisibility();
  const { purchaseHouse, availableHouses, houseTypes } = useData();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedHouse, setSelectedHouse] = useState<iHouse>({} as iHouse);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!visible) return;
    const keyHandler = (e: KeyboardEvent) => {
      if (!isEnvBrowser() && ["Escape"].includes(e.code)) {
        setSelectedType(undefined);
        fetchNui("nui:hideFrame", true, true);
        setVisible(false);
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [visible, setVisible]);

  const close = () => {
    setShowModal(false);
    setSelectedType(undefined);
    fetchNui("nui:hideFrame", true, true);
    setVisible(false);
  };

  const handlePurchaseHouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!selectedHouse.houseId) return;
    let type = selectedType;
    if (!type) {
      if (!selectedHouse.type) return;
      type = selectedHouse.type;
    }
    e.preventDefault();
    close();
    purchaseHouse(selectedHouse.houseId, type);
  };

  const handlePreviewHouse = (house: iHouse) => {
    setSelectedHouse(house);
    setShowModal(true);
  };

  const handleSetWayPoint = (e: React.MouseEvent<HTMLButtonElement>, coords: vec3) => {
    e.preventDefault();
    if (coords) {
      fetchNui("nui:setNewWayPoint", coords);
    }
  };

  const handleVisitHouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    let type = selectedType;
    if (!type) {
      if (!selectedHouse.type) return;
      type = selectedHouse.type;
    }
    e.preventDefault();
    close();
    fetchNui(
      "nui:visitHouse",
      {
        houseId: selectedHouse.houseId,
        type: type,
      },
      true
    );
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <>
      <div className="w-full h-full px-4 py-4 md:py-8 lg:py-14 md:px-10 lg:px-20 bg-242732/50">
        <div className="flex flex-col max-w-screen-xl mx-auto w-full h-full z-10 relative">
          <Header />
          <div className="bg-1E212C mt-4 rounded-lg w-full h-full overflow-auto scrollbar-hide">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {availableHouses?.map((house, i) => {
                const backgroundImage = house.meta?.image;

                const finalImage = isValidUrl(backgroundImage) ? encodeURI(backgroundImage) : `images/houses/${backgroundImage || "index.png"}`;
                return (
                  <div key={i} className="relative overflow-hidden bg-242732 rounded-lg">
                    <div
                      className="relative h-[160px] bg-center bg-cover flex items-end"
                      style={{
                        backgroundImage: `url(${finalImage})`,
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(180deg, rgba(36, 39, 50, 0.5) 50%, #242732 89.39%)",
                        }}
                      ></div>
                      <div className="px-4 mb-4 flex items-center gap-4 relative z-10">
                        <button onClick={(e) => handleSetWayPoint(e, house?.door_coords)} className="w-9 h-9 bg-5AFFCE/15 border border-5AFFCE p-3 rounded-md flex items-center justify-center">
                          <img src="images/icons/location.svg" alt="icon-location" />
                        </button>
                        <div>
                          <h1 className="font-DMSans font-bold">{house.label}</h1>
                          <h1 className="text-sm opacity-45">{house?.coords_label}</h1>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 space-y-4 pb-4">
                      <div className="flex items-center justify-between font-DMSans border rounded-md border-white/10 p-3 px-4 bg-[#2b2d38]">
                        <h1 className="text-white text-sm">{t("market_price")}</h1>
                        <div className="flex items-center justify-center gap-2">
                          <h1 className="font-bold text-sm">{formatNumber(house.price.toString())}</h1>
                          <img src="images/icons/coin.svg" alt="icon-coin" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between font-DMSans border rounded-md border-white/10 p-3 px-4 bg-[#2b2d38]">
                        <h1 className="text-white text-sm">{t("type")}</h1>
                        <div className="flex items-center justify-center gap-2">
                          <h1 className="font-bold text-sm first-letter:uppercase">{house.type}</h1>
                        </div>
                      </div>
                      <button onClick={() => handlePreviewHouse(house)} className="bg-5AFFCE/15 border border-5AFFCE w-full p-3 rounded-md hover:bg-5AFFCE/25">
                        <h1 className="text-white font-DMSans font-bold uppercase text-sm">{t("purchase")}</h1>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <>
        <Modal show={showModal} onClose={close} closeable className="max-w-[327px] px-6 pt-5 pb-2 shadow">
          <>
            <div className="mb-3">
              <h1 className="text-xl font-bold font-DMSans">{t("you_buying_house")}</h1>
              <h1 className="font-DMSans">
                {selectedHouse.label} #{selectedHouse.houseId}
              </h1>
            </div>
            <div className="mb-3 flex justify-between font-DMSans border rounded-md border-white/10 p-3 bg-[#2b2d38]">
              <h1 className="font-medium text-sm">{t("market_price")}</h1>
              <div className="flex items-center gap-2 text-sm">
                <img src="images/icons/coin.svg" alt="icon-coin" />
                <h1 className="font-bold">{formatNumber(selectedHouse?.price?.toString())}</h1>
              </div>
            </div>
            <>
              {!selectedHouse?.type ? (
                <div className="relative w-full mb-3">
                  <label className="sr-only">{t("type")}</label>
                  <select value={selectedType} onChange={(e) => setSelectedType(e.currentTarget.value as any)} className="p-3 w-full text-sm bg-[#2b2d38] rounded-md border border-white/10 outline-none ring-0" defaultValue={""}>
                    <option disabled value={""}>
                      {t("type")}
                    </option>
                    {Object.entries(houseTypes)?.map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="relative w-full mb-3 p-3 text-sm bg-[#2b2d38] rounded-md border border-white/10 select-none">
                  <div className="flex items-center justify-between">
                    <h1 className="font-medium">{t("type")}</h1>
                    <h1 className="text-5AFFCE font-medium">{t(selectedHouse.type)}</h1>
                  </div>
                </div>
              )}
            </>
            <button disabled={selectedHouse?.type ? false : !selectedType} onClick={handlePurchaseHouse} className="mb-3 bg-5AFFCE/15 border border-5AFFCE w-full p-1.5 rounded-md hover:bg-5AFFCE/25 disabled:opacity-50 disabled:bg-5AFFCE/15">
              <h1 className="text-white font-DMSans font-bold">{t("purchase")}</h1>
            </button>
            <button onClick={close} className="bg-[#2b2d38] border border-white/10 hover:brightness-110 w-full p-1.5 rounded-md">
              <h1 className="text-white font-DMSans font-semibold">{t("cancel")}</h1>
            </button>
            <button onClick={handleVisitHouse} className="text-white/35 hover:text-white">
              <h1 className="text-xs 2k:text-sm font-DMSans font-medium underline">{t("visit_house")}</h1>
            </button>
          </>
        </Modal>
      </>
    </>
  );
};
