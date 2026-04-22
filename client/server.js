const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const parsedPort = Number(process.env.PORT ?? 4173);
const PORT =
  Number.isInteger(parsedPort) && parsedPort >= 0 && parsedPort <= 65535
    ? parsedPort
    : 4173;
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = path.resolve(__dirname);

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);
  let requestedPath = decodeURIComponent(requestUrl.pathname);

  if (requestedPath === "/") {
    requestedPath = "/index.html";
  }

  const safePath = path.resolve(ROOT, requestedPath.replace(/^\/+/, ""));
  const relativePath = path.relative(ROOT, safePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.stat(safePath, (statError, stats) => {
    const finalPath =
      !statError && stats.isDirectory() ? path.join(safePath, "index.html") : safePath;

    fs.readFile(finalPath, (readError, file) => {
      if (readError) {
        const fallbackPath = path.join(ROOT, "index.html");
        fs.readFile(fallbackPath, (fallbackError, fallbackFile) => {
          if (fallbackError) {
            response.writeHead(404);
            response.end("Not found");
            return;
          }

          response.writeHead(200, {
            "Content-Type": CONTENT_TYPES[".html"],
            "Cache-Control": "no-cache",
          });
          response.end(fallbackFile);
        });
        return;
      }

      const extension = path.extname(finalPath).toLowerCase();
      response.writeHead(200, {
        "Content-Type":
          CONTENT_TYPES[extension] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      response.end(file);
    });
  });
});

server.on("error", (error) => {
  console.error(`Failed to start Sidewalk Iced Tea Plan B server: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  const address = server.address();
  const boundPort =
    typeof address === "object" && address ? address.port : PORT;
  const urlHost = formatHostForUrl(HOST);
  console.log(`Sidewalk Iced Tea Plan B available at http://${urlHost}:${boundPort}`);
});

function formatHostForUrl(host) {
  if (host === "0.0.0.0" || host === "::") {
    return "localhost";
  }

  if (host.includes(":") && !host.startsWith("[")) {
    return `[${host}]`;
  }

  return host;
}
