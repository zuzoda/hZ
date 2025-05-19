import Modal from "@/components/Modal";
import useData from "@/hooks/useData";
import useRouter from "@/hooks/useRouter";
import { useVisibility } from "@/hooks/useVisibility";
import { fetchNui } from "@/utils/fetchNui";
import { formatNumber } from "@/utils/misc";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const PurchaseHouse = () => {
  const { t } = useTranslation();
  const { setRouter } = useRouter();
  const { visible, setVisible } = useVisibility();
  const { lastPreviewHouse, setPreviewHouse, purchaseHouse, houseTypes } = useData();
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  const handleClosePage = () => {
    setSelectedType(undefined);
    fetchNui("nui:hideFrame", true, true);
    setVisible(false);
    setRouter("catalog");
  };

  const handlePurchaseHouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!lastPreviewHouse) return;
    let type = selectedType;
    if (!type) {
      if (!lastPreviewHouse.type) return;
      type = lastPreviewHouse.type;
    }
    e.preventDefault();
    handleClosePage();
    purchaseHouse(lastPreviewHouse.houseId, type);
  };

  const handleVisitHouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!lastPreviewHouse) return;
    let type = selectedType;
    if (!type) {
      if (!lastPreviewHouse.type) return;
      type = lastPreviewHouse.type;
    }
    e.preventDefault();
    handleClosePage();
    fetchNui(
      "nui:visitHouse",
      {
        houseId: lastPreviewHouse.houseId,
        type: type,
      },
      true
    );
  };

  return (
    <>
      <Modal show={visible} closeable={false} onClose={() => setPreviewHouse(undefined)} className="max-w-[327px] p-6 pt-5 shadow space-y-3">
        <>
          <div>
            <h1 className="text-xl font-bold font-DMSans">{t("you_buying_house")}</h1>
            <h1 className="grd font-DMSans">
              {lastPreviewHouse?.label} #{lastPreviewHouse?.houseId}
            </h1>
          </div>
          <div className="flex flex-col justify-between font-DMSans border rounded-md border-white/10 py-2 px-4 bg-[#2b2d38]">
            <h1 className="font-medium text-sm">{t("market_price")}</h1>
            <div className="flex items-center gap-2 text-sm">
              <img src="images/icons/coin.svg" alt="icon-coin" />
              {lastPreviewHouse?.price && <h1 className="font-bold">{formatNumber(lastPreviewHouse.price.toString())}</h1>}
            </div>
          </div>
          <>
            {!lastPreviewHouse?.type ? (
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
                  <h1 className="text-5AFFCE font-medium">{t(lastPreviewHouse.type)}</h1>
                </div>
              </div>
            )}
          </>
          <button disabled={lastPreviewHouse?.type ? false : !selectedType} onClick={handlePurchaseHouse} className="bg-5AFFCE/15 border border-5AFFCE w-full p-2.5 rounded-md hover:bg-5AFFCE/25 disabled:opacity-50 disabled:bg-5AFFCE/15">
            <h1 className="text-white font-DMSans font-bold">{t("purchase")}</h1>
          </button>
          <button onClick={handleClosePage} className="bg-[#2b2d38] border border-white/10 hover:brightness-110 w-full p-2.5 rounded-md">
            <h1 className="text-white font-DMSans font-semibold">{t("cancel")}</h1>
          </button>
          <button onClick={handleVisitHouse} className="text-white/35 hover:text-white">
            <h1 className="text-xs 2k:text-sm font-DMSans font-medium underline">{t("visit_house")}</h1>
          </button>
        </>
      </Modal>
    </>
  );
};
