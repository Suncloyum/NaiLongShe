import urls from "../urls.json" with { type: "json" };

export default {
  async fetch() {
    const destination = urls[Math.floor(Math.random() * urls.length)];
    return new Response(null, {
      status: 302,
      headers: {
        Location: destination,
        "Cache-Control": "no-store",
      },
    });
  },
};
