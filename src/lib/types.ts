export interface Warehouse {
  id: string;
  name: string;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
}

export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  status: string;
}