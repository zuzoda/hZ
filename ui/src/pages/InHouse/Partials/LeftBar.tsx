import Modal from "@/components/Modal";
import useData from "@/hooks/useData";
import { fetchNui } from "@/utils/fetchNui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegLightbulb } from "react-icons/fa";
import { GiSofa } from "react-icons/gi";
import { IoIosArrowDown, IoMdLogOut } from "react-icons/io";
import { MdOutlineTransferWithinAStation, MdRebaseEdit } from "react-icons/md";
import { BiSolidCctv } from "react-icons/bi";
import { FaWarehouse } from "react-icons/fa";
import classNames from "classnames";

export const LeftBar = () => {
  const { inHouse, updateHouseLights, updateHouseStairs, updateHouseRooms, wallColors, updateWallColor, leaveHousePermanently, hasDlc } = useData();
  const { t } = useTranslation();

  const [isColorOpen, setColorOpen] = useState<boolean>(false);
  const [isGarageColorOpen, setGarageColorOpen] = useState<boolean>(false);
  const [isDesignSeedOpen, setDesignSeedOpen] = useState<boolean>(false);
  const [isHouseTransferOpen, setHouseTransferOpen] = useState<boolean>(false);
  const [playerForTransfer, setPlayerForTransfer] = useState<string>("choose_player");
  const [lastGeneratedDesignSeed, setLastGeneratedSeed] = useState<string>();
  const [usedDesignSeed, setUsedDesignSeed] = useState<string>();

  const handleChangeWallColor = async (color: number) => {
    await updateWallColor(color);
  };

  const handleChangeHouseLights = async () => {
    await updateHouseLights();
  };

  const handleChangeHouseStairs = async () => {
    if (!inHouse.owner) return;
    if (inHouse.type == "furnished") return;
    await updateHouseStairs();
  };

  const handleChangeHouseRooms = async () => {
    if (!inHouse.owner) return;
    if (inHouse.type == "furnished") return;
    await updateHouseRooms();
  };

  const handleLeaveHousePermanently = async () => {
    if (!inHouse.owner) return;
    await leaveHousePermanently();
  };

  const handleOpenFurniture = async () => {
    if (!inHouse.owner && !inHouse.guest) return;
    fetchNui("nui:openDecorationMode", null, true);
  };

  const handleOpenCCTV = async () => {
    fetchNui("nui:openCCTV", null, true);
  };

  const handleHouseTransfer = async () => {
    if (!inHouse.owner) return;
    if (playerForTransfer) {
      const selectedValue = playerForTransfer;
      if (selectedValue !== "choose_player") {
        setHouseTransferOpen(false);
        fetchNui("nui:ownerTransfer", selectedValue, true);
      }
    }
  };

  const handleGenerateDesignSeed = async () => {
    if (!inHouse.owner) return;
    if (inHouse.type == "furnished") return;
    if (lastGeneratedDesignSeed) return;
    const response = await fetchNui("nui:generateDesignSeed", null, {
      state: "new-seed",
    });
    if (response?.state) {
      setLastGeneratedSeed(response.state);
    }
  };

  const handleUseDesignSeed = async () => {
    if (!inHouse.owner) return;
    if (inHouse.type == "furnished") return;
    if (usedDesignSeed) {
      const selectedValue = usedDesignSeed;
      if (selectedValue.length > 0) {
        const response = await fetchNui("nui:useDesignSeed", selectedValue, {
          result: true,
        });
        if (response.result) {
          setDesignSeedOpen(false);
          setUsedDesignSeed(undefined);
        }
      }
    }
  };

  const handleChangeGarageWallColor = async (color: number) => {
    await fetchNui("nui:changeGarageWallColor", color, {
      result: true,
      state: color,
    });
  };

  const handleClickDlcStore = () => {
    const url = "https://store.0resmonstudio.com/";
    window.invokeNative("openUrl", url);
  };

  return (
    <>
      <div className="relative overflow-hidden w-full h-full overflow-y-auto">
        <div className="p-4">
          <h1 className="font-DMSans font-bold text-2xl">
            {t("setup")} {t("your")}
          </h1>
          <h1 className="font-DMSans font-medium text-md text-white/50">{t("house_system")}</h1>
        </div>
        <div className="p-4 flex flex-col gap-4 h-min overflow-y-auto">
          {/* <div className={classNames("items-center gap-3 flex")}>
            <div className="w-10 h-10 bg-5AE1FF/15 border border-5AFFCE rounded-md flex items-center justify-center">
              <img
                className="ml-1 mt-0.5 -rotate-45"
                src="images/icons/brush.svg"
                alt="brush"
              />
            </div>
            <div className="text-sm font-DMSans">
              <h1 className="text-5AFFCE font-bold">{t("wall_color")}</h1>
              <h1 className="text-white/50">{t("customize_your_walls")}</h1>
            </div>
            <button
              onClick={() => setColorOpen((p) => !p)}
              className="w-[76px] ml-auto border bg-[#2b2d38] hover:bg-white/15 border-white/15 px-3 py-2 rounded-md"
            >
              <h1 className="uppercase text-sm font-bold font-DMSans">
                {t("select")}
              </h1>
            </button>
          </div> */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-5AE1FF/15 border border-5AFFCE rounded-md flex items-center justify-center relative">
              <FaWarehouse className="text-white" />
            </div>
            <div className="text-sm font-DMSans">
              <h1 className="text-white font-bold">{t("garage_wall_color")}</h1>
              <h1 className="text-white/50">{t("customize_your_walls")}</h1>
            </div>
            <button onClick={() => setGarageColorOpen((p) => !p)} className="w-[76px] ml-auto border bg-[#2b2d38] hover:bg-white/15 border-white/15 px-3 py-2 rounded-md">
              <h1 className="uppercase text-sm font-bold font-DMSans">{t("select")}</h1>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-5AE1FF/15 border border-5AFFCE rounded-md flex items-center justify-center">
              <GiSofa className="text-white" />
            </div>
            <div className="text-sm font-DMSans">
              <h1 className="text-white font-bold">{t("furniture")}</h1>
              <h1 className="text-white/50">{t("customize_your_house")}</h1>
            </div>
            <button onClick={handleOpenFurniture} className="w-[76px] ml-auto border bg-[#2b2d38] hover:bg-white/15 border-white/15 px-3 py-2 rounded-md">
              <h1 className="uppercase text-sm font-bold font-DMSans">{t("select")}</h1>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-5AE1FF/15 border border-5AFFCE rounded-md flex items-center justify-center">
              <BiSolidCctv className="text-white" />
            </div>
            <div className="text-sm font-DMSans">
              <h1 className="text-white font-bold">{t("cctv")}</h1>
              <h1 className="text-white/50">{t("desc_cctv")}</h1>
            </div>
            <button onClick={handleOpenCCTV} className="w-[76px] ml-auto border bg-[#2b2d38] hover:bg-white/15 border-white/15 px-3 py-2 rounded-md">
              <h1 className="uppercase text-sm font-bold font-DMSans">{t("select")}</h1>
            </button>
          </div>
          <div
            className={classNames("items-center gap-3", {
              flex: inHouse.type == "square" || inHouse.type == "rectangle",
              hidden: inHouse.type != "square" && inHouse.type != "rectangle",
            })}
          >
            <div className="w-10 h-10 bg-5AE1FF/15 border border-5AFFCE rounded-md flex items-center justify-center">
              <img className="ml-0.5 mt-0.5" src="images/icons/stairs.svg" alt="stairs" />
            </div>
            <div className="text-sm font-DMSans">
              <h1 className="text-white font-bold">{t("stairs")}</h1>
              <h1 className="text-white/50">{t("add_or_remove_stairs")}</h1>
            </div>
            <div className="relative w-[76px] ml-auto h-[34px]">
              <label className="switch w-full cursor-pointer">
                <input className="w-full" type="checkbox" checked={typeof inHouse?.options?.stairs == "undefined" ? true : inHouse?.options.stairs} onChange={handleChangeHouseStairs} />
                <>
                  <h1 className="absolute top-1/2 -translate-y-1/2 right-3 text-xs font-medium font-DMSans uppercase">{t("on")}</h1>
                  <h1 className="absolute top-1/2 -translate-y-1/2 left-2 text-xs font-medium font-DMSans uppercase">{t("off")}</h1>
                </>
              </label>
            </div>
          </div>
          <div
            className={classNames("items-center gap-3", {
              flex: inHouse.type == "square" || inHouse.type == "rectangle",
              hidden: inHouse.type != "square" && inHouse.type != "rectangle",
            })}
          >
            <div className="w-10 h-10 bg-5AE1FF/15 border border-5AFFCE rounded-md flex items-center justify-center">
              <img className="ml-0.5 mt-0.5" src="images/icons/guard-house.svg" alt="rooms" />
            </div>
            <div className="text-sm font-DMSans">
              <h1 className="text-white font-bold">{t("rooms")}</h1>
              <h1 className="text-white/50">{t("add_or_remove_rooms")}</h1>
            </div>
            <div className="relative w-[76px] ml-auto h-[34px]">
              <label className="switch w-full cursor-pointer">
                <input className="w-full" type="checkbox" checked={typeof inHouse?.options?.rooms == "undefined" ? true : inHouse?.options.rooms} onChange={handleChangeHouseRooms} />
                <>
                  <h1 className="absolute top-1/2 -translate-y-1/2 right-3 text-xs font-medium font-DMSans uppercase">{t("on")}</h1>
                  <h1 className="absolute top-1/2 -translate-y-1/2 left-2 text-xs font-medium font-DMSans uppercase">{t("off")}</h1>
                </>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-5AE1FF/15 border border-5AFFCE rounded-md flex items-center justify-center">
              <FaRegLightbulb className=" text-white" />
            </div>
            <div className="text-sm font-DMSans">
              <h1 className="text-white font-bold">{t("lights")}</h1>
              <h1 className="text-white/50">{t("toggle_lights")}</h1>
            </div>
            <div className="relative w-[76px] ml-auto h-[34px]">
              <label className="switch w-full cursor-pointer">
                <input className="w-full" type="checkbox" checked={typeof inHouse?.options?.lights == "undefined" ? true : inHouse?.options.lights} onChange={handleChangeHouseLights} />
                <>
                  <h1 className="absolute top-1/2 -translate-y-1/2 right-3 text-xs font-medium font-DMSans uppercase">{t("on")}</h1>
                  <h1 className="absolute top-1/2 -translate-y-1/2 left-2 text-xs font-medium font-DMSans uppercase">{t("off")}</h1>
                </>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD74A]/15 border border-[#FFD74A] rounded-md flex items-center justify-center">
              <img className="ml-0.5 mt-0.5 w-5" src="images/icons/guard-house-dlc.svg" alt="guard-house" />
            </div>
            <div className="text-sm font-DMSans">
              <h1 className="text-[#FFD74A] font-bold">{t("DLC_Weed")}</h1>
              <h1 className="text-white/50">{t("desc_buy_dlc")}</h1>
            </div>
            <div className="relative w-[76px] ml-auto h-[34px]">
              <label className="switch w-full cursor-pointer">
                <input className="w-full dlc" type="checkbox" onClick={!hasDlc.weed ? handleClickDlcStore : () => {}} defaultChecked={hasDlc.weed} disabled />
                <>
                  <h1 className="absolute top-1/2 -translate-y-1/2 right-3 text-xs font-medium font-DMSans uppercase">{t("on")}</h1>
                  <h1 className="absolute top-1/2 -translate-y-1/2 left-2 text-xs font-medium font-DMSans uppercase">{t("off")}</h1>
                </>
              </label>
            </div>
          </div>
          <div
            className={classNames("items-center gap-3", {
              flex: inHouse.type != "furnished",
              hidden: inHouse.type == "furnished",
            })}
          >
            <div className="w-10 h-10 bg-5AE1FF/15 border border-5AFFCE rounded-md flex items-center justify-center">
              <MdRebaseEdit className="text-white w-[22px] h-[22px]" />
            </div>
            <div className="text-sm font-DMSans">
              <h1 className="text-white font-bold">{t("design_seed")}</h1>
              <h1 className="text-white/50">{t("desc_design_seed")}</h1>
            </div>
            <button onClick={() => setDesignSeedOpen((p) => !p)} className="w-[76px] ml-auto border bg-[#2b2d38] hover:bg-white/15 border-white/15 px-3 py-2 rounded-md">
              <h1 className="uppercase text-sm font-bold font-DMSans">{t("select")}</h1>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-5AE1FF/15 border border-5AFFCE rounded-md flex items-center justify-center">
              <MdOutlineTransferWithinAStation className="text-white w-[22px] h-[22px]" />
            </div>
            <div className="text-sm font-DMSans">
              <h1 className="text-white font-bold">{t("owner_transfer")}</h1>
              <h1 className="text-white/50">{t("desc_transfer")}</h1>
            </div>
            <button onClick={() => setHouseTransferOpen((p) => !p)} className="w-[76px] ml-auto border bg-[#2b2d38] hover:bg-white/15 border-white/15 px-3 py-2 rounded-md">
              <h1 className="uppercase text-sm font-bold font-DMSans">{t("select")}</h1>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CF4E5B]/30 border border-[#CF4E5B] rounded-md flex items-center justify-center">
              <IoMdLogOut className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-DMSans">
              <h1 className="text-white font-bold">
                {t("moved_out")} <span className="text-white/50 text-xs font-medium">[{t("double_click")}]</span>
              </h1>
              <h1 className="text-white/50">{t("desc_moved_out")}</h1>
            </div>
            <button onDoubleClick={handleLeaveHousePermanently} className="w-[76px] ml-auto border bg-5AFFCE/50 hover:bg-5AFFCE border-white/15 px-3 py-2 rounded-md">
              <h1 className="uppercase text-sm font-bold font-DMSans whitespace-nowrap">{t("out")}</h1>
            </button>
          </div>
        </div>
        <>
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[203px] h-[203px] border border-5AFFCE/10 rounded-full flex items-center justify-center">
            <div className="w-[155px] h-[155px] border border-5AFFCE/30 rounded-full flex items-center justify-center">
              <div
                className="w-[101px] h-[101px] border border-5AFFCE rounded-full opacity-60"
                style={{
                  boxShadow: "0 0 8px 0 #5AFFCE",
                }}
              ></div>
            </div>
          </div>
        </>
        <>
          <Modal key={"color"} show={isColorOpen} closeable onClose={() => setColorOpen(false)} className="max-w-sm !shadow-none !bg-transparent !rounded-none space-y-3">
            <div className="flex items-center gap-3 bg-[#0B0A17] p-3 rounded-lg border border-white/10">
              <div className="w-10 h-10 bg-5AE1FF/15 border border-5AFFCE rounded-md flex items-center justify-center">
                <img className="ml-1 mt-0.5 -rotate-45" src="images/icons/brush.svg" alt="brush" />
              </div>
              <div className="text-sm font-DMSans">
                <h1 className="text-5AFFCE font-bold">{t("wall_color")}</h1>
                <h1 className="text-white/50">{t("customize_your_walls")}</h1>
              </div>
              <IoIosArrowDown className="ml-auto text-white/50 w-5 h-5" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 bg-[#0B0A17] py-4 rounded-lg border border-white/10">
              {wallColors.map((v, k) => (
                <button
                  key={k}
                  className="w-8 h-8 rounded-md"
                  style={{ backgroundColor: v.color }}
                  onClick={() => {
                    handleChangeWallColor(v.id);
                  }}
                ></button>
              ))}
            </div>
          </Modal>
          <Modal key={"garage-color"} show={isGarageColorOpen} closeable onClose={() => setGarageColorOpen(false)} className="max-w-sm !shadow-none !bg-transparent !rounded-none space-y-3">
            <div className="flex items-center gap-3 bg-[#0B0A17] p-3 rounded-lg border border-white/10">
              <div className="w-10 h-10 bg-5AFFCE/15 border border-5AFFCE rounded-md flex items-center justify-center">
                <img className="ml-1 mt-0.5 -rotate-45" src="images/icons/brush.svg" alt="brush" />
              </div>
              <div className="text-sm font-DMSans">
                <h1 className="text-white font-bold">{t("garage_wall_color")}</h1>
                <h1 className="text-white/50">{t("customize_your_walls")}</h1>
              </div>
              <IoIosArrowDown className="ml-auto text-white/50 w-5 h-5" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 bg-[#0B0A17] py-4 rounded-lg border border-white/10">
              {[...Array(40)].map((_, k) => (
                <button
                  key={"garage-color-" + (k + 1)}
                  className="w-8 h-8 rounded-md border border-5AFFCE bg-5AFFCE/15"
                  onClick={() => {
                    handleChangeGarageWallColor(k + 1);
                  }}
                >
                  <h1 className="font-bold font-DMSans text-white">{k + 1}</h1>
                </button>
              ))}
            </div>
          </Modal>
          <Modal key={"transfer"} show={isHouseTransferOpen} closeable onClose={() => setHouseTransferOpen(false)} className="max-w-sm p-6 pt-5 shadow space-y-3">
            <div>
              <h1 className="text-xl font-bold font-DMSans">{t("owner_transfer")}</h1>
              <h1 className="grd font-DMSans text-sm">{t("desc_transfer")}</h1>
            </div>
            <select value={playerForTransfer} onChange={(e) => setPlayerForTransfer(e.target.value)} className="w-full font-DMSans border rounded-md border-white/10 py-2 px-4 bg-[#2b2d38] ring-0 outline-none text-sm">
              <option disabled value={"choose_player"}>
                {t("choose_player")}
              </option>
              {inHouse?.permissions?.map((perm, i) => (
                <option key={i} value={perm.user}>
                  {perm.playerName}
                </option>
              ))}
            </select>
            <div>
              <button onDoubleClick={handleHouseTransfer} className="bg-5AFFCE/15 border border-5AFFCE w-full p-2.5 rounded-md hover:bg-5AFFCE/25 relative">
                <h1 className="text-5AFFCE font-DMSans font-bold first-letter:uppercase">{t("transfer")}</h1>
              </button>
              <span className="text-9 text-white/75 uppercase float-right">[{t("double_click")}]</span>
            </div>
            <button onClick={() => setHouseTransferOpen(false)} className="bg-[#2b2d38] border border-white/10 hover:brightness-110 w-full p-2.5 rounded-md">
              <h1 className="text-white font-DMSans font-semibold">{t("cancel")}</h1>
            </button>
          </Modal>
          <Modal key={"design_seed"} show={isDesignSeedOpen} closeable onClose={() => setDesignSeedOpen(false)} className="max-w-sm p-6 pt-5 shadow">
            <div className="mb-3">
              <h1 className="text-xl font-bold font-DMSans">{t("design_seed")}</h1>
              <h1 className="grd font-DMSans text-sm">{t("desc_design_seed")}</h1>
            </div>
            <div className="relative w-full mb-6">
              <input type="text" className="block p-2.5 w-full z-20 text-sm bg-[#2b2d38] rounded-lg rounded-s-gray-100 rounded-s-2 border border-white/10 outline-none ring-0" placeholder={t("design_seed")} value={usedDesignSeed} onChange={(e) => setUsedDesignSeed(e.target.value)} />
              <div>
                <button onDoubleClick={handleUseDesignSeed} type="submit" className="absolute top-0 end-0 p-2.5 h-full text-sm font-medium font-DMSans text-white border border-5AFFCE/50 rounded-e-md bg-5AFFCE/25 hover:bg-5AFFCE/50 ring-0 outline-none">
                  <h1 className="text-5AFFCE font-DMSans font-bold first-letter:uppercase">{t("use")}</h1>
                </button>
                <span className="text-9 text-white/75 uppercase float-left">[{t("double_click")}]</span>
              </div>
            </div>
            <hr className="border-white/10 mb-3" />
            <div className="relative w-full mb-3">
              <input disabled type="text" placeholder={t("seed")} value={lastGeneratedDesignSeed} className="placeholder:lowercase placeholder:first-letter:uppercase uppercase mb-3 w-full flex flex-col justify-between font-DMSans border rounded-md text-white/75 border-white/10 py-2 px-4 bg-[#2b2d38] outline-none ring-0" />
              <button onClick={handleGenerateDesignSeed} className="bg-5AFFCE/15 border border-5AFFCE w-full p-1.5 rounded-md hover:bg-5AFFCE/25 relative">
                <h1 className="text-white font-DMSans font-bold first-letter:uppercase">{t("generate")}</h1>
              </button>
            </div>
            <hr className="border-white/10 mb-3" />
            <button onClick={() => setDesignSeedOpen(false)} className="bg-[#2b2d38] border border-white/10 hover:brightness-110 w-full p-1.5 rounded-md">
              <h1 className="text-white font-DMSans font-semibold">{t("cancel")}</h1>
            </button>
          </Modal>
        </>
      </div>
    </>
  );
};
