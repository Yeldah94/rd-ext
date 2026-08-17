gopeed.events.onResolve(async function (ctx) {
  const token = gopeed.settings.api_token;
  const rawUrl = ctx.req.url;

  if (!token) {
    throw new Error("Mangler Real-Debrid API Token i indstillingerne.");
  }

  // Sender URL som standard x-www-form-urlencoded
  const payload = "link=" + encodeURIComponent(rawUrl);

  const res = await gopeed.fetch("https://api.real-debrid.com/rest/1.0/unrestrict/link", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: payload
  });

  if (res.status !== 200) {
    let errText = "HTTP " + res.status;
    try {
      const errData = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      if (errData && errData.message) errText += " - " + errData.message;
      if (errData && errData.error) errText += " - " + errData.error;
    } catch (e) {}
    throw new Error("Real-Debrid fejl: " + errText);
  }

  const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

  if (data.error) {
    throw new Error("Real-Debrid afviste: " + data.error);
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
    throw new Error("Intet download-link modtaget fra Real-Debrid.");

  }
});
