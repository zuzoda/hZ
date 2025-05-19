export type WallColorTypes = { id: number; color: string };

export type vec3 = { x: number; y: number; z: number };
export type vec4 = vec3 & { w: number };

export type indicatorsTypes = "electricity" | "power" | "gas" | "water";

export type iIndicators = {
  [key in indicatorsTypes]: number;
};

export type iIndicatorSettings = {
  [key in indicatorsTypes]: {
    unitPrice: number;
    maxValue: number;
  };
};

export type InHouseTypes = {
  houseId: number;
  type: "square" | "rectangle" | "furnished" | string;
  options: {
    lights: boolean;
    tint: number;
    stairs: boolean;
    rooms: boolean;
  };
  permissions: {
    user: string;
    playerName: string;
  }[];
  furnitures: OwnedFurnitureProps[];
  owner: boolean;
  owner_name: string;
  guest: boolean;
  created_at: string;
  indicators: iIndicators;
};

export interface iHouse {
  houseId: number;
  label: string;
  price: number;
  door_coords: vec4;
  garage_coords: vec4;
  coords_label: string;
  type?: string;
  meta: {
    image: string;
    [key: string]: any;
  };
}

export type FurnitureProps = {
  model: string;
  label: string;
  price: number;
};

export type FurnitureItemsProps = {
  [category: string]: {
    label: string;
    items: FurnitureProps[];
  };
};

export type OwnedFurnitureProps = FurnitureProps & {
  index: number;
  isPlaced: boolean;
  objectId: number;
  model: string;
};
