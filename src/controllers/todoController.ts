import { IncomingMessage, ServerResponse } from "http";
import Todo, { ITodo } from "../models/todoModel";
import { z } from "zod";

const todoSchema = z.object({
  name: z.string().min(1),
  dueDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  completed: z.boolean().optional(),
});

export const handleRequest = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const url = (req.url || "/").split("?")[0].replace(/\/+$/, "");
  const method = req.method || "GET";

  res.setHeader("Content-Type", "application/json");

  try {
    if (url === "" || url === "/") {
      res.writeHead(200);
      return res.end(
        JSON.stringify({ success: true, message: "API is running 🚀" }),
      );
    }

    if (url.startsWith("/todos/") && method === "GET") {
      const id = url.split("/")[2];
      const todo = await Todo.findById(id);

      if (!todo) {
        res.writeHead(404);
        return res.end(
          JSON.stringify({ success: false, message: "Todo not found" }),
        );
      }

      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, data: todo }));
    }

    if (url === "/todos" && method === "GET") {
      const todos = await Todo.find();
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, data: todos }));
    }

    if (url === "/todos" && method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));

      req.on("end", async () => {
        const parsed = todoSchema.parse(JSON.parse(body));
        const todo = await Todo.create(parsed);
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, data: todo }));
      });

      return;
    }

    if (url.startsWith("/todos/") && method === "DELETE") {
      const id = url.split("/")[2];
      const todo = await Todo.findByIdAndDelete(id);

      if (!todo) {
        res.writeHead(404);
        return res.end(
          JSON.stringify({ success: false, message: "Todo not found" }),
        );
      }

      res.writeHead(200);
      return res.end(
        JSON.stringify({ success: true, message: "Deleted successfully" }),
      );
    }

    if (url.startsWith("/todos/") && (method === "PUT" || method === "PATCH")) {
      const id = url.split("/")[2];
      let body = "";
      req.on("data", (chunk) => (body += chunk));

      req.on("end", async () => {
        const data = JSON.parse(body);

        const todo = await Todo.findByIdAndUpdate(id, data, {
          new: true,
          runValidators: true,
        });

        if (!todo) {
          res.writeHead(404);
          return res.end(
            JSON.stringify({ success: false, message: "Todo not found" }),
          );
        }

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: todo }));
      });

      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ success: false, message: "Route not found" }));
  } catch (err: any) {
    res.writeHead(400);
    res.end(JSON.stringify({ success: false, message: err.message }));
  }
};
