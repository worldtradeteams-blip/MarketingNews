// OPTIONAL serverless proxy (not required for the app to run).
// Deploy this on Netlify to fetch sources server-side and avoid CORS entirely.
// Usage from client: /.netlify/functions/fetch-source?url=<encoded RSS URL>
exports.handler = async (event) => {
  const url = event.queryStringParameters && event.queryStringParameters.url;
  if (!url) return { statusCode: 400, body: "Missing url parameter" };
  try {
    const res = await fetch(url, { headers: { "User-Agent": "GlobalMarketingIntelligence/1.0" } });
    const text = await res.text();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/xml", "Access-Control-Allow-Origin": "*" },
      body: text
    };
  } catch (e) {
    return { statusCode: 502, body: "Fetch failed: " + e.message };
  }
};
