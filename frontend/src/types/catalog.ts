export type ItemType = "SERVICE" | "PACKAGE" | "PRODUCT";

export interface CatalogItem {
  id: string;
  name: string;
  description: string | null;
  item_type: ItemType;
  price: number;
  is_active: boolean;
  duration_minutes: number | null;
  session_count: number | null;
}
