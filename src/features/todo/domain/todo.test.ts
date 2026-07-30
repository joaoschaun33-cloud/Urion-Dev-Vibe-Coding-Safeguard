// src/features/todo/domain/todo.test.ts

import { describe, it, expect } from 'vitest';
import { Todo, type TodoProps } from './todo';

describe('Todo (entidade de dominio)', () => {
  it('create aplica defaults do Zod (isCompleted=false, priority=MEDIUM)', () => {
    const todo = Todo.create({ title: 'Estudar FSD' });
    expect(todo.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/);
    expect(todo.title).toBe('Estudar FSD');
    expect(todo.description).toBeUndefined();
    expect(todo.isCompleted).toBe(false);
    expect(todo.priority).toBe('MEDIUM');
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.updatedAt).toBeInstanceOf(Date);
  });

  it('create respeita valores explicitos', () => {
    const todo = Todo.create({
      title: 'X',
      description: 'desc',
      priority: 'HIGH',
      isCompleted: true,
    });
    expect(todo.priority).toBe('HIGH');
    expect(todo.isCompleted).toBe(true);
    expect(todo.description).toBe('desc');
  });

  it('create rejeita titulo vazio (invariante Zod)', () => {
    expect(() => Todo.create({ title: '' })).toThrow();
  });

  it('complete() e imutavel: retorna nova instancia concluida', () => {
    const todo = Todo.create({ title: 'A' });
    const done = todo.complete();
    expect(done).not.toBe(todo);
    expect(done.isCompleted).toBe(true);
    expect(todo.isCompleted).toBe(false);
  });

  it('updateTitle() e imutavel: retorna nova instancia', () => {
    const todo = Todo.create({ title: 'A' });
    const renamed = todo.updateTitle('B');
    expect(renamed.title).toBe('B');
    expect(todo.title).toBe('A');
    expect(renamed).not.toBe(todo);
  });

  it('reconstitute() + toJSON() preservam as props', () => {
    const now = new Date();
    const props: TodoProps = {
      id: '11111111-1111-1111-1111-111111111111',
      title: 'T',
      description: undefined,
      isCompleted: false,
      priority: 'LOW',
      createdAt: now,
      updatedAt: now,
    };
    const todo = Todo.reconstitute(props);
    expect(todo.id).toBe(props.id);
    expect(todo.toJSON()).toEqual(props);
  });
});
