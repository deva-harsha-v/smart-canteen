export type Role = "student" | "owner";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "rejected";

export interface AppUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
}

export interface Stall {
  id: string;
  owner_id: string;
  stall_name: string;
  status: "open" | "closed";
  created_at?: string;
}

export interface MenuItem {
  id: string;
  stall_id: string;
  name: string;
  price: number;
  description?: string | null;
  category?: string | null;
  created_at?: string;
}

export interface CartItem {
  id: string; // menu item id
  name: string;
  price: number;
  quantity: number;
  stall_id: string;
  stall_name?: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  name?: string;
  price?: number;
}

export interface Order {
  id: string;
  stall_id: string;
  student_id: string;
  status: OrderStatus;
  created_at: string;
  total?: number;
  stall_name?: string;
  items: OrderItemRow[];
}

export const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "completed",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready for pickup",
  completed: "Completed",
  rejected: "Rejected",
};
