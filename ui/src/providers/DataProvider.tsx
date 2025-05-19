import React, { createContext, useEffect, useState } from "react";
import { DataContextProps } from "@/types/DataProviderTypes";
import {
  FurnitureItemsProps,
  InHouseTypes,
  OwnedFurnitureProps,
  WallColorTypes,
  iHouse,
  iIndicatorSettings,
  iIndicators,
  vec3,
  vec4,
} from "@/types/BasicTypes";
import { useNuiEvent } from "@/hooks/useNuiEvent";
import { fetchNui } from "@/utils/fetchNui";
import { useTranslation } from "react-i18next";
import "./debug.g";

export const DataCtx = createContext<DataContextProps>({} as DataContextProps);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wallColors, setWallColors] = useState<WallColorTypes[]>([]);
  const [indicatorSettings, setIndicatorSettings] =
    useState<iIndicatorSettings>({} as iIndicatorSettings);
  const [inHouse, setInHouse] = useState<InHouseTypes>({} as InHouseTypes);
  const [defaultHouses, setDefaultHouses] = useState<iHouse[]>([]);
  const [soldHouses, setSoldHouses] = useState<iHouse[]>([]);
  const [availableHouses, setAvailableHouses] = useState<iHouse[]>([]);
  const [ownedHouses, setOwnedHouses] = useState<iHouse[]>([]);
  const [lastPreviewHouse, setPreviewHouse] = useState<iHouse>();
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItemsProps>(
    {} as FurnitureItemsProps
  );
  const [ownedFurnitures, setOwnedFurnitures] = useState<OwnedFurnitureProps[]>(
    []
  );
  const [hasDlc, setHasDlc] = useState<{ [key: string]: boolean }>({
    weed: false,
  });
  const [houseTypes, setHouseTypes] = useState<{
    [key: string]: {
      label: string;
      door_coords: vec3;
      enter_coords: vec4;
    };
  }>({});

  useNuiEvent("ui:setupUI", (data) => {
    if (data.setLocale) {
      i18n.addResourceBundle(
        data.setLocale.locale,
        "translation",
        data.setLocale.languages
      );
    }
    if (data.setWallColors) {
      setWallColors(data.setWallColors);
    }
    if (data.setIndicatorSettings) {
      setIndicatorSettings(data.setIndicatorSettings);
    }
    if (data.setDefaultHouses) {
      const houses = Object.values(data.setDefaultHouses as iHouse[]);
      setDefaultHouses(
        houses.filter((element) => element !== null && element !== undefined)
      );
    }
    if (data.setFurnitureItems) {
      setFurnitureItems(data.setFurnitureItems);
    }
    if (data.setHasDlc) {
      const DLC = data.setHasDlc as {
        [key: number]: { dlc: string; value: boolean };
      };
      Object.keys(DLC).forEach((key) => {
        const item = DLC[+key];
        setHasDlc((p) => ({
          ...p,
          [item.dlc]: item.value,
        }));
      });
    }
    if (data.setSoldHouses) {
      const houses = Object.values(data.setSoldHouses as iHouse[]);
      setSoldHouses(
        houses.filter((element) => element !== null && element !== undefined)
      );
    }
    if (data.setOwnedHouses) {
      setOwnedHouses(data.setOwnedHouses);
    }
    if (data.setHouseTypes) {
      setHouseTypes(data.setHouseTypes);
    }
  });

  useNuiEvent("ui:setPreviewHouse", setPreviewHouse);

  useNuiEvent("ui:setInHouse", (house: InHouseTypes) => {
    function setDefaultIndicators(indicators: iIndicators): iIndicators {
      return {
        electricity: indicators?.electricity ?? 0,
        gas: indicators?.gas ?? 0,
        power: indicators?.power ?? 0,
        water: indicators?.water ?? 0,
      };
    }

    if (!house) {
      setInHouse({} as InHouseTypes);
      return;
    }
    house.indicators = setDefaultIndicators(house.indicators);
    if (house.furnitures) setOwnedFurnitures(house.furnitures);
    setInHouse(house);
  });

  useEffect(() => {
    const soldHousesIds = soldHouses
      ?.filter((element) => element !== null && element !== undefined)
      ?.map((house) => house?.houseId);
    const updatedAvailableHouses = defaultHouses
      .filter((element) => element !== null && element !== undefined)
      .filter(
        (house) =>
          house && house?.houseId && !soldHousesIds.includes(house.houseId)
      );
    setAvailableHouses(updatedAvailableHouses);
  }, [defaultHouses, soldHouses]);

  const purchaseHouse = async (
    houseId: number,
    type?: string
  ): Promise<boolean> => {
    if (isLoading) return true;
    setIsLoading(true);
    const response = await fetchNui(
      "nui:purchaseHouse",
      {
        houseId: houseId,
        type: type,
      },
      true
    );
    setIsLoading(false);
    return response;
  };

  const updateHouseLights = async (): Promise<boolean> => {
    if (isLoading) return true;
    setIsLoading(true);
    const state =
      typeof inHouse.options.lights == "undefined"
        ? true
        : inHouse.options.lights;
    const response = await fetchNui("nui:toggleHouseLights", !state, {
      result: true,
      state: !state,
    });
    if (response.result) {
      setInHouse((p) => ({
        ...p,
        options: {
          ...p.options,
          lights: response.state,
        },
      }));
    }
    setIsLoading(false);
    return response.state;
  };

  const updateHouseStairs = async (): Promise<boolean> => {
    if (isLoading) return true;
    setIsLoading(true);
    const state =
      typeof inHouse.options.stairs == "undefined"
        ? true
        : inHouse.options.stairs;
    const response = await fetchNui("nui:toggleHouseStairs", !state, {
      result: true,
      state: !state,
    });
    if (response.result) {
      setInHouse((p) => ({
        ...p,
        stairs: response.state,
      }));
    }
    setIsLoading(false);
    return response.state;
  };

  const updateHouseRooms = async (): Promise<boolean> => {
    if (isLoading) return true;
    setIsLoading(true);
    const state =
      typeof inHouse.options.rooms == "undefined"
        ? true
        : inHouse.options.rooms;
    const response = await fetchNui("nui:toggleHouseRooms", !state, {
      result: true,
      state: !state,
    });
    if (response.result) {
      setInHouse((p) => ({
        ...p,
        rooms: response.state,
      }));
    }
    setIsLoading(false);
    return response.state;
  };

  const updateWallColor = async (color: number): Promise<boolean> => {
    if (isLoading) return true;
    setIsLoading(true);
    const response = await fetchNui("nui:changeWallColor", color, {
      result: true,
      state: color,
    });
    if (response.result) {
      setInHouse((p) => ({
        ...p,
        options: {
          ...p.options,
          tint: response.state,
        },
      }));
    }
    setIsLoading(false);
    return true;
  };

  const removePermission = async (user: string): Promise<boolean> => {
    if (isLoading) return true;
    setIsLoading(true);
    await fetchNui("nui:removePermission", user, {
      result: true,
      state: user,
    });
    setIsLoading(false);
    return true;
  };

  const addPermission = async (sourceId: number): Promise<boolean> => {
    if (isLoading) return true;
    setIsLoading(true);
    await fetchNui("nui:addPermission", sourceId, {
      result: true,
      state: {
        user: "selim_mes",
        playerName: "Selim Mes",
      },
    });
    setIsLoading(false);
    return true;
  };

  const leaveHousePermanently = async (): Promise<boolean> => {
    if (isLoading) return true;
    setIsLoading(true);
    await fetchNui("nui:leaveHousePermanently", null, {
      result: true,
    });
    setIsLoading(false);
    return true;
  };

  const value = {
    defaultHouses,
    wallColors,
    indicatorSettings,
    ownedHouses,
    availableHouses,
    inHouse,
    lastPreviewHouse,
    furnitureItems,
    ownedFurnitures,
    hasDlc,
    purchaseHouse,
    updateHouseLights,
    updateHouseStairs,
    updateHouseRooms,
    updateWallColor,
    removePermission,
    addPermission,
    setPreviewHouse,
    leaveHousePermanently,
    houseTypes,
  };

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
};
