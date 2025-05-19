import Modal from "@/components/Modal";
import useData from "@/hooks/useData";
import useRouter from "@/hooks/useRouter";
import { useVisibility } from "@/hooks/useVisibility";
import { vec4 } from "@/types/BasicTypes";
import { fetchNui } from "@/utils/fetchNui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const CreateHouse = () => {
  const { t } = useTranslation();
  const { setRouter } = useRouter();
  const { visible, setVisible } = useVisibility();
  const { houseTypes } = useData();
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "CapsLock") {
        fetchNui("nui:setNuiFocusToFalse", true, true);
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const [_label, setLabel] = useState<string>();
  const [_price, setPrice] = useState<number>(0);
  const [_door_coords, setDoorCoords] = useState<vec4>();
  const [_garage_coords, setGarageCoords] = useState<vec4 | null>();
  const [_coords_label, setCoordsLabel] = useState<string>();
  const [_selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  );
  const [_bgImage, setBgImage] = useState<string>();

  const handleClosePage = () => {
    fetchNui("nui:hideFrame", true, true);
    setVisible(false);
    setRouter("catalog");
    fetchNui("nui:outInCreateHouse", true, true);
  };

  const handleCreateHouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const type = _selectedType
      ? _selectedType != "undefined"
        ? _selectedType
        : null
      : null;

    if (
      !_label ||
      _label.length == 0 ||
      !_price ||
      !_door_coords ||
      !_coords_label ||
      _coords_label.length == 0 ||
      (_bgImage && _bgImage.length == 0)
    ) {
      return fetchNui("nui:sendNotify", {
        message: t("fill_required_fields"),
        type: "error",
      });
    }
    handleClosePage();
    fetchNui(
      "nui:createNewHouse",
      {
        label: _label,
        price: _price,
        door_coords: _door_coords,
        garage_coords: _garage_coords,
        coords_label: _coords_label,
        type: type,
        image: _bgImage,
      },
      true
    );
  };

  const handleGetPlayerCoords = async (
    e: React.MouseEvent<HTMLButtonElement>,
    type: "house" | "garage"
  ) => {
    e.preventDefault();
    const response = await fetchNui("nui:getPlayerCoords", null, {
      coords: { x: 1.0, y: 1.0, z: 1.0, w: 90.0 },
      info: "Coords info",
    });
    if (response.coords) {
      if (type == "house") {
        setDoorCoords(response.coords);
        setCoordsLabel(response.info);
      } else {
        setGarageCoords(response.coords);
      }
    }
  };

  const formatCoords = (coords: vec4) =>
    `${coords.x.toFixed(2)}, ${coords.y.toFixed(2)}, ${coords.z.toFixed(
      2
    )}, ${coords.w.toFixed(2)}`;

  return (
    <>
      <Modal
        show={visible}
        closeable={false}
        onClose={() => setVisible(false)}
        className="max-w-[360px] p-6 pt-5 pb-3 shadow space-y-3"
        position="right"
        noBackground
      >
        <>
          <div>
            <h1 className="text-xl font-bold font-DMSans">
              {t("create_new_house")}
            </h1>
            <h1 className="font-DMSans">{t("desc_new_house")}</h1>
          </div>
          <div className="relative w-full mb-6">
            <label className="block mb-2 text-sm font-medium font-DMSans text-white">
              {t("label")}
            </label>
            <input
              type="text"
              className="block p-2.5 w-full z-20 text-sm bg-[#2b2d38] rounded-lg rounded-s-gray-100 rounded-s-2 border border-white/10 outline-none ring-0"
              placeholder={t("label")}
              value={_label}
              onChange={(e) => setLabel(e.currentTarget.value)}
            />
          </div>
          <div className="relative w-full mb-6">
            <label className="block mb-2 text-sm font-medium font-DMSans text-white">
              {t("price")}
            </label>
            <input
              type="number"
              className="block p-2.5 w-full z-20 text-sm bg-[#2b2d38] rounded-lg rounded-s-gray-100 rounded-s-2 border border-white/10 outline-none ring-0"
              placeholder={t("price")}
              value={_price}
              onChange={(e) =>
                setPrice(
                  e.currentTarget.value ? parseInt(e.currentTarget.value) : 0
                )
              }
            />
          </div>
          <div className="relative w-full mb-6">
            <label className="block mb-2 text-sm font-medium font-DMSans text-white">
              {t("door_coords")}
            </label>
            <div className="relative">
              <input
                disabled
                type="text"
                placeholder={t("door_coords")}
                value={_door_coords ? formatCoords(_door_coords) : ""}
                className="mb-3 w-full flex flex-col justify-between font-DMSans border rounded-md text-white/75 border-white/10 py-2 px-4 bg-[#2b2d38] outline-none ring-0"
              />
              <button
                onClick={(e) => handleGetPlayerCoords(e, "house")}
                className="absolute top-0 end-0 flex items-center justify-center p-2.5 w-10 h-full text-white border border-5AFFCE/50 rounded-e-md bg-5AFFCE/25 hover:bg-5AFFCE/50 ring-0 outline-none"
              >
                <img src="images/icons/location.svg" alt="location" />
              </button>
            </div>
          </div>
          <div className="relative w-full mb-6">
            <label className="block mb-2 text-sm font-medium font-DMSans text-white">
              {t("garage_coords")}
              <span
                onClick={() => setGarageCoords(null)}
                className="float-right cursor-pointer text-white/45"
              >
                [{t("cancel")}]
              </span>
            </label>
            <div className="relative">
              <input
                disabled
                type="text"
                placeholder={t("garage_coords")}
                value={_garage_coords ? formatCoords(_garage_coords) : ""}
                className="mb-3 w-full flex flex-col justify-between font-DMSans border rounded-md text-white/75 border-white/10 py-2 px-4 bg-[#2b2d38] outline-none ring-0"
              />
              <button
                onClick={(e) => handleGetPlayerCoords(e, "garage")}
                className="absolute top-0 end-0 flex items-center justify-center p-2.5 w-10 h-full text-white border border-5AFFCE/50 rounded-e-md bg-5AFFCE/25 hover:bg-5AFFCE/50 ring-0 outline-none"
              >
                <img src="images/icons/location.svg" alt="location" />
              </button>
            </div>
          </div>
          <div className="relative w-full mb-6">
            <label className="block mb-2 text-sm font-medium font-DMSans text-white">
              {t("coords_label")}
            </label>
            <input
              type="text"
              className="block p-2.5 w-full z-20 text-sm bg-[#2b2d38] rounded-lg rounded-s-gray-100 rounded-s-2 border border-white/10 outline-none ring-0"
              placeholder={t("coords_label")}
              value={_coords_label}
              onChange={(e) => setCoordsLabel(e.currentTarget.value)}
            />
          </div>
          <div className="relative w-full mb-6">
            <label className="block mb-2 text-sm font-medium font-DMSans text-white">
              {t("type")}
            </label>
            <select
              value={_selectedType}
              onChange={(e) => setSelectedType(e.currentTarget.value as any)}
              className="p-3 w-full text-sm bg-[#2b2d38] rounded-md border border-white/10 outline-none ring-0"
              defaultValue={"undefined"}
            >
              <option value={"undefined"}>{t("can_choose_player")}</option>
              {Object.entries(houseTypes)?.map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div className="relative w-full mb-6">
            <label className="block mb-2 text-sm font-medium font-DMSans text-white">
              {t("image")}
            </label>
            <input
              type="text"
              className="block p-2.5 w-full z-20 text-sm bg-[#2b2d38] rounded-lg rounded-s-gray-100 rounded-s-2 border border-white/10 outline-none ring-0"
              placeholder={
                t("image") + " " + " (folder: images/houses/** or url)"
              }
              value={_bgImage}
              onChange={(e) => setBgImage(e.currentTarget.value)}
            />
          </div>
          <button
            onClick={handleCreateHouse}
            className="bg-5AFFCE/15 border border-5AFFCE w-full p-1.5 rounded-md hover:bg-5AFFCE/25"
          >
            <h1 className="text-white font-DMSans font-bold">{t("create")}</h1>
          </button>
          <button
            onClick={handleClosePage}
            className="bg-[#2b2d38] border border-white/10 hover:brightness-110 w-full p-1.5 rounded-md"
          >
            <h1 className="text-white font-DMSans font-semibold">
              {t("cancel")}
            </h1>
          </button>
          <div className="flex items-end justify-end text-white/40 font-medium text-13">
            <h1 className="bg-white/[0.07] p-2 rounded-l">[Caps]</h1>
            <h1 className="bg-white/[0.09] p-2 rounded-r">
              {t("lFurniture.switch_mode", { mode: "Game/UI" })}
            </h1>
          </div>
        </>
      </Modal>
    </>
  );
};
