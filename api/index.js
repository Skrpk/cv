const fs = require("node:fs");
const path = require("node:path");

module.exports = function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return response.status(405).send("Method Not Allowed");
  }

  const html = fs.readFileSync(
    path.join(process.cwd(), "standalone.html"),
    "utf8",
  );

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  );

  return response.status(200).send(request.method === "HEAD" ? "" : html);
};
