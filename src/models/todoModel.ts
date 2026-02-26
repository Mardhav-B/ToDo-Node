import { Schema, model, Document } from "mongoose";

export interface ITodo extends Document {
  name: string;
  dueDate: Date;
  completed: boolean;
}

const todoSchema = new Schema<ITodo>({
  name: { type: String, required: true },
  dueDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
});

export default model<ITodo>("Todo", todoSchema);
