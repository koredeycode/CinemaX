import { createServer } from "http";
import next from "next";
import { parse } from "url";
import logger from "./src/lib/logger";
import { initSocket } from "./src/lib/socket-server.ts";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      logger.error(`Error occurred handling ${req.url}`, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  initSocket(httpServer);

  httpServer
    .once("error", (err) => {
      logger.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      logger.info(`> Ready on http://${hostname}:${port}`);
    });
});
