// Regressao da regra XSS_UNSANITIZED, com os casos que a medicao em 81 repositorios
// reais mostrou (benchmarks/real/RESULTS.md): 18 de 20 achados eram falso alarme.
import { describe, expect, it } from 'vitest';
import { VIBE_GUARD_RULES } from '../../domain/vibe-guard-rules';

const xss = VIBE_GUARD_RULES.find((r) => r.id === 'XSS_UNSANITIZED')?.regex as RegExp;

describe('XSS_UNSANITIZED — deve acusar HTML dinamico sem sanitizar', () => {
  it.each([
    ['<div dangerouslySetInnerHTML={{ __html: post.content }} />', 'dinamico'],
    ['<div dangerouslySetInnerHTML={{__html: props.html}} />', 'sem espaco'],
    ['<p dangerouslySetInnerHTML={{ __html: marked(c.body) }} />', 'marked() nao sanitiza'],
    [
      '<div dangerouslySetInnerHTML={{ __html: "<b>" + name + "</b>" }} />',
      'concatenacao com literal',
    ],
    ['el.innerHTML = userComment;', 'innerHTML dinamico'],
    ['el.innerHTML += `<li>${item}</li>`;', 'template com interpolacao'],
    ["document.write(new URLSearchParams(location.search).get('q'));", 'document.write dinamico'],
    ["list.insertAdjacentHTML('beforeend', msg.text);", 'insertAdjacentHTML dinamico'],
  ])('%s  (%s)', (line) => {
    expect(xss.test(line)).toBe(true);
  });

  it('acusa no modo MCP (trecho inteiro, varias linhas)', () => {
    expect(
      xss.test('<div\n  dangerouslySetInnerHTML={{\n    __html: message.body,\n  }}\n/>')
    ).toBe(true);
  });

  it('modo MCP: <style> quebrado em varias linhas (chart.tsx do shadcn/ui) NAO e acusado', () => {
    const chart =
      '<style\n  dangerouslySetInnerHTML={{\n    __html: Object.entries(THEMES).map(([k]) => k).join("\\n"),\n  }}\n/>';
    expect(xss.test(chart)).toBe(false);
  });

  it('modo linha (CLI): "__html:" sozinho numa linha NAO e acusado (limitacao conhecida, medida)', () => {
    expect(xss.test('      __html: Object.entries(THEMES)')).toBe(false);
    expect(xss.test('      __html: message.body,')).toBe(false);
  });
});

describe('XSS_UNSANITIZED — NAO deve acusar o que e inofensivo', () => {
  it.each([
    [
      '<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(x) }} />',
      'DOMPurify com espaco (bug de backtracking)',
    ],
    ['<div dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(x) }} />', 'DOMPurify sem espaco'],
    ['<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(x) }} />', 'sanitizeHtml'],
    [
      '<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />',
      'JSON-LD',
    ],
    ["<span dangerouslySetInnerHTML={{ __html: '<b>Novo</b>' }} />", 'literal estatico'],
    ['<style dangerouslySetInnerHTML={{ __html: globalStyles }} />', 'tag style'],
    ['      __html: JSON.stringify(x),', 'JSON-LD em varias linhas'],
    ["el.innerHTML = '';", 'limpar o conteudo'],
    ['if (a.innerHTML === b) {}', 'comparacao'],
    ["document.write('<p>oi</p>');", 'document.write literal'],
    ["list.insertAdjacentHTML('beforeend', '<hr>');", 'insertAdjacentHTML literal'],
  ])('%s  (%s)', (line) => {
    expect(xss.test(line)).toBe(false);
  });
});
