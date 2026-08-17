export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

export interface Order {
  id: number;
  orderId: string;
  customer: string;
  product: string;
  total: number;
  status: string;
  date: string;
}
