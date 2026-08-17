gopeed.events.onResolve(async function (ctx) {
  const token = gopeed.settings.api_token;
  const rawUrl = ctx.req.url;

  if (!token) {
    throw new Error("Mangler Real-Debrid API Token i indstillingerne.");
  }

  // Sender URL-encoded body i stedet for JSON
  const bodyParams = "link=" + encodeURIComponent(rawUrl);

  const res = await gopeed.fetch("https://api.real-debrid.com/rest/1.0/unrestrict/link", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: bodyParams
  });

  if (res.status !== 200) {
    throw new Error("Real-Debrid API fejl: HTTP " + res.status);
  }

  const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

  if (data.error) {
    throw new Error("RD Fejl: " + data.error);
  }

  if (data.download) {
    ctx.res = {
      name: data.filename || "",
      size: data.filesize || 0,
      req: {
        url: data.download
      }
    };
  } else {
    throw new Error("Ingen download-link modtaget fra Real-Debrid.");
  }
});
