import useData from "@/hooks/useData";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaUserLarge } from "react-icons/fa6";
import { MdGroupRemove } from "react-icons/md";
import { SiAuthelia } from "react-icons/si";

export const Permissions = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  const { inHouse, removePermission, addPermission } = useData();
  const addPermissionRef = useRef<HTMLInputElement>(null);

  const handleAddPermission = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoading) return;
    if (inHouse.owner) {
      setIsLoading(true);
      const targetId = addPermissionRef.current?.value;
      if (targetId) {
        await addPermission(parseInt(targetId));
      }
      setIsLoading(false);
    }
  };

  const handleRemovePermission = async (e: React.MouseEvent<HTMLButtonElement>, user: string) => {
    e.preventDefault();
    if (isLoading) return;
    if (inHouse.owner) {
      setIsLoading(true);
      await removePermission(user);
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-medium text-md text-white/50">{t("desc_permissions")}</h1>
      <div className="h-full mt-4 bg-1E212C p-3 overflow-auto rounded-md scrollbar-hide">
        <label htmlFor="player_id" className="sr-only">
          {t("player_id")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <FaUserLarge className="text-white/35" />
          </div>
          <input ref={addPermissionRef} type="number" id="player_id" className="block w-full bg-242732 p-4 ps-10 text-sm text-white/70 placeholder:text-white/70 rounded-md ring-0 outline-none" placeholder={t("player_id")} />
          <button onClick={handleAddPermission} className="shadow text-white absolute end-2 bottom-2 bg-[#2b2d38] hover:bg-white/15 border border-white/15 font-bold uppercase rounded-md text-sm px-4 py-2">
            {t("add")}
          </button>
        </div>
        {inHouse?.permissions && (
          <div className="mt-3 flex flex-col gap-3 overflow-auto">
            <div className="p-3 flex items-center justify-between bg-242732 rounded-md">
              <div>
                <h1 className="text-sm text-white font-DMSans font-bold">{inHouse.owner_name}</h1>
                <h1 className="text-sm text-white/50 font-DMSans font-bold">{t("owner")}</h1>
              </div>
              <div className="text-white rounded-md p-[7px]">
                <SiAuthelia className="w-6 h-6 text-white" />
              </div>
            </div>
            {inHouse.permissions.map((v, i) => (
              <div key={i} className="p-3 flex items-center justify-between bg-242732 rounded-md">
                <div>
                  <h1 className="text-sm text-white font-DMSans font-bold">{v.playerName}</h1>
                  <h1 className="text-sm text-white/50 font-DMSans font-bold">{t("guest")}</h1>
                </div>
                <button onClick={(e) => handleRemovePermission(e, v.user)} className="shadow text-white bg-5AFFCE/80 hover:bg-opacity-90 rounded-md p-2">
                  <MdGroupRemove className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
