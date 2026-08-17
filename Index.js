gopeed.events.onResolve(async function (ctx) {
  const token = gopeed.settings.api_token;
  const rawUrl = ctx.req.url;

  if (!token) {
    throw new Error("Mangler Real-Debrid API Token i indstillingerne.");
  }

  const res = await gopeed.fetch("https://api.real-debrid.com/rest/1.0/unrestrict/link", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: {
      link: rawUrl
    }
  });

  if (res.status !== 200) {
    throw new Error("Real-Debrid API svarede med HTTP " + res.status);
  }

  const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

  if (data.error) {
    throw new Error("Real-Debrid fejl: " + data.error);
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
    throw new Error("Kunne ikke modtage download-link fra Real-Debrid.");
  
}
});
