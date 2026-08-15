import { getStore } from "@netlify/blobs";

const store = getStore({
  name: "banh-trung-thu-data",
  consistency: "strong"
});

const KEY = "database";

const emptyDatabase = {
  products: [],
  orders: []
};

async function readDatabase() {
  const data = await store.get(KEY, { type: "json" });
  return data || emptyDatabase;
}

async function saveDatabase(database) {
  await store.setJSON(KEY, database);
  return database;
}

export default async (request) => {
  try {
    // Lấy toàn bộ dữ liệu
    if (request.method === "GET") {
      const database = await readDatabase();

      return new Response(JSON.stringify(database), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      });
    }

    // Chỉ cho phép POST để thay đổi dữ liệu
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const body = await request.json();
    const database = await readDatabase();

    // =========================
    // THÊM / SỬA SẢN PHẨM
    // =========================
    if (body.kind === "product") {
      const product = body.data;

      const index = database.products.findIndex(
        item => item.id === product.id
      );

      if (index >= 0) {
        database.products[index] = product;
      } else {
        database.products.push(product);
      }
    }

    // =========================
    // THÊM ĐƠN HÀNG
    // =========================
    else if (body.kind === "order") {
      database.orders.push(body.data);
    }

    // =========================
    // GIAO / HOÀN TÁC ĐƠN
    // =========================
    else if (body.kind === "toggleOrder") {
      const order = database.orders.find(
        item => item.id === body.data.id
      );

      if (order) {
        order.status =
          order.status === "done"
            ? "pending"
            : "done";
      }
    }

    // =========================
    // XÓA SẢN PHẨM
    // =========================
    else if (body.kind === "deleteProduct") {
      database.products =
        database.products.filter(
          item => item.id !== body.data.id
        );
    }

    // =========================
    // XÓA ĐƠN HÀNG
    // =========================
    else if (body.kind === "deleteOrder") {
      database.orders =
        database.orders.filter(
          item => item.id !== body.data.id
        );
    }

    else {
      return new Response(
        JSON.stringify({
          error: "Unknown action"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const updatedDatabase =
      await saveDatabase(database);

    return new Response(
      JSON.stringify(updatedDatabase),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );

  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: "Server error",
        message: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }
};
