export type CategoryItem = {
  id: string;
  name: string;
  level: number;
  key: string;
  parentId: string;
  path: string;
  sortIndex: number;
  children?: Category[];
  metadata: DataItem[];
};

export type DataItem = {
  id: string;
  name: string;
  required: number;
  valueType: string;
};