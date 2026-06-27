import { createServer } from "node:http";
import compression from "compression";
import next from "next";

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "localhost";
const production = process.argv.includes("--production");
const dev = process.argv.includes("--dev") || !production;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const compress = compression();

app.prepare().then(() => {
  createServer((req, res) => {
    compress(req, res, (error) => {
      if (error) {
        res.statusCode = 500;
        res.end("Compression error");
        return;
      }

      handle(req, res);
    });
  }).listen(port, hostname, () => {
    console.log(
      `> Server listening at http://${hostname}:${port} as ${
        dev ? "development" : "production"
      }`
    );
  });
});
