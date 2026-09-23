import { describe, it, expect } from 'vitest';
import { detectNPlusOne } from '../../application/detect-n-plus-one';

const scan = (content: string, path = 'r.ts') => detectNPlusOne([{ path, content }]);

describe('detectNPlusOne (roadmap 3.2)', () => {
  it('flag prisma.findUnique dentro de for...of e reporta a linha da consulta', () => {
    const src = [
      'for (const id of ids) {',
      '  const u = await prisma.user.findUnique({ where: { id } });',
      '}',
    ].join('\n');
    const f = scan(src);
    expect(f).toHaveLength(1);
    expect(f[0].ruleId).toBe('N_PLUS_ONE');
    expect(f[0].severity).toBe('WARNING');
    expect(f[0].line).toBe(2);
  });

  it('flag consulta dentro de Promise.all(ids.map(...))', () => {
    const f = scan('await Promise.all(ids.map((id) => prisma.post.findMany({ where: { id } })));');
    expect(f).toHaveLength(1);
  });

  it('flag for de instrucao unica, sem chaves', () => {
    expect(scan('for (const id of ids) await repo.findById(id);')).toHaveLength(1);
  });

  it('flag repository.find* dentro de forEach', () => {
    const src = [
      'items.forEach(async (i) => {',
      '  await userRepository.findByEmail(i.email);',
      '});',
    ].join('\n');
    expect(scan(src)).toHaveLength(1);
  });

  it('flag while com consulta no corpo', () => {
    const src = ['while (queue.length) {', '  await db.query("SELECT 1");', '}'].join('\n');
    expect(scan(src)).toHaveLength(1);
  });

  it('nao flag consulta fora do loop', () => {
    const src = [
      'const users = await prisma.user.findMany({ where: { id: { in: ids } } });',
      'users.map((u) => u.id);',
    ].join('\n');
    expect(scan(src)).toHaveLength(0);
  });

  it('nao flag escrita em loop (isso nao e N+1)', () => {
    const src = ['for (const d of data) {', '  await prisma.user.create({ data: d });', '}'].join(
      '\n'
    );
    expect(scan(src)).toHaveLength(0);
  });

  it('respeita o opt-out // N+1-OK na linha anterior', () => {
    const src = [
      'for (const id of [1, 2, 3]) {',
      '  // N+1-OK: 3 itens fixos',
      '  await prisma.user.findUnique({ where: { id } });',
      '}',
    ].join('\n');
    expect(scan(src)).toHaveLength(0);
  });

  it('ignora consulta que esta so em comentario', () => {
    const src = [
      'for (const id of ids) {',
      '  // await prisma.user.findUnique({ where: { id } });',
      '}',
    ].join('\n');
    expect(scan(src)).toHaveLength(0);
  });

  it('nao duplica o achado em loops aninhados', () => {
    const src = [
      'for (const a of as) {',
      '  for (const b of bs) {',
      '    await prisma.x.findFirst({ where: { b } });',
      '  }',
      '}',
    ].join('\n');
    expect(scan(src)).toHaveLength(1);
  });

  it('nao corta URLs ao remover comentarios (linha continua correta)', () => {
    const src = [
      "const url = 'https://example.com';",
      'for (const id of ids) {',
      '  await prisma.user.findUnique({ where: { id } });',
      '}',
    ].join('\n');
    const f = scan(src);
    expect(f).toHaveLength(1);
    expect(f[0].line).toBe(3);
  });

  it('ignora arquivos que nao sao JS/TS', () => {
    expect(scan('for (const id of ids) { prisma.user.findMany() }', 'notes.md')).toHaveLength(0);
  });

  it('nao quebra com parenteses/chaves desbalanceados', () => {
    expect(scan('for (const id of ids {')).toHaveLength(0);
    expect(scan('items.map((x) => {')).toHaveLength(0);
  });
});
