import { Order, Product, User } from "../types";

const BASE_URL = "https://dummyjson.com";

async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(
      `Yêu cầu API thất bại: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

function mapUser(item: any): User {
  return {
    id: item.id,
    name: `${item.firstName ?? "Người dùng"} ${item.lastName ?? ""}`.trim(),
    email: item.email ?? "unknown@example.com",
    role: item.company?.title ?? "Thành viên",
    status: item.id % 4 === 0 ? "Không hoạt động" : "Hoạt động",
    lastLogin: item.birthDate ?? "2026-01-01",
  };
}

export async function fetchUsers(): Promise<User[]> {
  const data = await fetchJson<{ users: any[] }>(`${BASE_URL}/users?limit=30`);
  return data.users.map(mapUser);
}

export async function fetchUserById(id: number): Promise<User> {
  const data = await fetchJson<any>(`${BASE_URL}/users/${id}`);
  return mapUser(data);
}

export async function createUser(user: Omit<User, "id">): Promise<User> {
  const [firstName, ...rest] = user.name.trim().split(" ");
  const lastName = rest.join(" ") || firstName;
  const payload = {
    firstName,
    lastName,
    email: user.email,
    company: { title: user.role },
    birthDate: user.lastLogin,
  };
  const data = await fetchJson<any>(`${BASE_URL}/users/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapUser(data);
}

export async function updateUser(
  id: number,
  user: Partial<User>,
): Promise<User> {
  const payload: any = {};
  if (user.name) {
    const [firstName, ...rest] = user.name.trim().split(" ");
    payload.firstName = firstName;
    payload.lastName = rest.join(" ") || firstName;
  }
  if (user.email) payload.email = user.email;
  if (user.role) payload.company = { title: user.role };
  if (user.lastLogin) payload.birthDate = user.lastLogin;

  const data = await fetchJson<any>(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapUser(data);
}

function normalizeProduct(item: any): Product {
  return {
    id: item.id,
    name: item.title,
    category: item.category,
    price: item.price,
    stock: item.stock,
    status:
      item.stock === 0 ? "Hết hàng" : item.stock < 20 ? "Sắp hết" : "Còn hàng",
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await fetchJson<{ products: any[] }>(
    `${BASE_URL}/products?limit=30`,
  );
  return data.products.map(normalizeProduct);
}

export async function fetchProductById(id: number): Promise<Product> {
  const data = await fetchJson<any>(`${BASE_URL}/products/${id}`);
  return normalizeProduct(data);
}

export async function createProduct(
  product: Omit<Product, "id">,
): Promise<Product> {
  const [title, ...rest] = product.name.split(" ");
  const payload = {
    title: product.name,
    description: `Sản phẩm ${product.name}`,
    price: product.price,
    stock: product.stock,
    category: product.category,
  };
  const data = await fetchJson<any>(`${BASE_URL}/products/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return normalizeProduct(data);
}

export async function updateProduct(
  id: number,
  product: Partial<Product>,
): Promise<Product> {
  const payload: any = {};
  if (product.name) payload.title = product.name;
  if (product.category) payload.category = product.category;
  if (typeof product.price === "number") payload.price = product.price;
  if (typeof product.stock === "number") payload.stock = product.stock;
  if (product.status) payload.status = product.status;

  const data = await fetchJson<any>(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return normalizeProduct(data);
}

export async function fetchOrders(): Promise<Order[]> {
  const [cartData, userData, productData] = await Promise.all([
    fetchJson<{ carts: any[] }>(`${BASE_URL}/carts?limit=20`),
    fetchJson<{ users: any[] }>(`${BASE_URL}/users?limit=30`),
    fetchJson<{ products: any[] }>(`${BASE_URL}/products?limit=100`),
  ]);

  const userMap = new Map(
    userData.users.map((user) => [
      user.id,
      `${user.firstName} ${user.lastName}`,
    ]),
  );
  const productMap = new Map(
    productData.products.map((product) => [product.id, product.title]),
  );

  return cartData.carts.map((cart) => {
    const productSummary = cart.products
      .slice(0, 2)
      .map(
        (entry: any) => productMap.get(entry.productId) ?? "Sản phẩm không rõ",
      )
      .join(", ");

    return {
      id: cart.id,
      orderId: `ORD-${1000 + cart.id}`,
      customer: userMap.get(cart.userId) ?? `Người dùng ${cart.userId}`,
      product: productSummary || `${cart.products.length} sản phẩm`,
      total: cart.total,
      status:
        cart.id % 3 === 0
          ? "Đang xử lý"
          : cart.id % 2 === 0
            ? "Đang vận chuyển"
            : "Đã giao",
      date: new Date(Date.now() - cart.id * 86400000)
        .toISOString()
        .slice(0, 10),
    };
  });
}
