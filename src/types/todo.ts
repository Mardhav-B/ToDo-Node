export interface ITodoInput {
  name: string;
  dueDate: Date;
  completed?: boolean;
}

export interface IUpdateTodo {
  name?: string;
  dueDate?: Date;
  completed?: boolean;
}
