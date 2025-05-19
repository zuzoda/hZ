import {
  FurnitureItemsProps,
  InHouseTypes,
  OwnedFurnitureProps,
  WallColorTypes,
  iHouse,
  iIndicatorSettings,
  vec3,
  vec4,
} from "./BasicTypes";

export type DataContextProps = {
  defaultHouses: iHouse[];
  inHouse: InHouseTypes;
  wallColors: WallColorTypes[];
  indicatorSettings: iIndicatorSettings;
  availableHouses: iHouse[];
  ownedHouses: iHouse[];
  lastPreviewHouse: iHouse | undefined;
  furnitureItems: FurnitureItemsProps;
  ownedFurnitures: OwnedFurnitureProps[];
  hasDlc: { [key: string]: boolean };
  purchaseHouse: (houseId: number, type?: string) => Promise<boolean>;
  updateHouseLights: () => Promise<boolean>;
  updateHouseStairs: () => Promise<boolean>;
  updateHouseRooms: () => Promise<boolean>;
  updateWallColor: (color: number) => Promise<boolean>;
  removePermission: (user: string) => Promise<boolean>;
  addPermission: (sourceId: number) => Promise<boolean>;
  setPreviewHouse: React.Dispatch<React.SetStateAction<iHouse | undefined>>;
  leaveHousePermanently: () => Promise<boolean>;
  houseTypes: {
    [key: string]: {
      label: string;
      door_coords: vec3;
      enter_coords: vec4;
    };
  };
};
