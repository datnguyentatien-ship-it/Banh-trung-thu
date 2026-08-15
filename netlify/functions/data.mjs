import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("moon-cake-data");
  const key = "database.json";

  if (req.method === "GET") {
    const data = await store.get(key, { type: "json" });

    if (data) {
      return new Response(JSON.stringify(data), {
        headers: {
          "content-type": "application/json"
        }
      });
    }

    const initial = {
      products: [
        {
          id: 1,
          name: "Bánh thập cẩm trứng muối",
          filling: "Thập cẩm",
          weight: "200g",
          price: 120000,
          stock: 30
        },
        {
          id: 2,
          name: "Bánh đậu xanh",
          filling: "Đậu xanh",
          weight: "200g",
          price: 90000,
          stock: 25
        },
        {
          id: 3,
          name: "Bánh sen trứng muối",
          filling: "Hạt sen",
          weight: "200g",
          price: 110000,
          stock: 20
        }
      ],
      customers: [],
      orders: []
    };

    await store.setJSON(key, initial);

    return new Response(JSON.stringify(initial), {
      headers: {
        "content-type": "application/json"
      }
    });
  }

  if (req.method === "POST") {
    const body = await req.json();

    await store.setJSON(key, body);

    return new Response(
      JSON.stringify({ ok: true }),
      {
        headers: {
          "content-type": "application/json"
        }
      }
    );
  }

  return new Response("Method Not Allowed", {
    status: 405
  });
};
