# 🚀 Quick Start — Seus Primeiros 5 Minutos

> Clone, configure, rode. Em 5 minutos voce tem uma API REST funcionando.

---

## 1. Clone e Entre

```bash
git clone https://github.com/seu-usuario/vibe-coding-template-repo.git meu-app
cd meu-app
```

## 2. Suba o Banco (Docker)

```bash
docker-compose up -d
```

Isso sobe PostgreSQL 16 + Redis 7. Prontos em 10 segundos.

## 3. Instale Dependencias

```bash
npm install
```

## 4. Configure o Banco

```bash
# Copie o .env
cp .env.example .env

# O .env ja vem configurado para o Docker local
# DATABASE_URL=postgresql://vibeuser:vibepass@localhost:5432/vibedb

# Rode as migrations
npm run db:migrate

# (Opcional) Popule com dados de exemplo
npm run db:seed
```

## 5. Rode a API

```bash
npm run dev
```

Acesse: http://localhost:3000/api/v1/health

---

## 🧪 Teste a API

### Criar um Todo
```bash
curl -X POST http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aprender Vibe Coding",
    "description": "Estudar este template repo",
    "priority": "HIGH"
  }'
```

### Listar Todos
```bash
curl "http://localhost:3000/api/v1/todos?page=1&limit=10"
```

---

## ✅ Verifique a Saude

```bash
# Smoke tests (~1 segundo)
npm run test:smoke

# Testes unitarios
npm run test:unit

# Diagnostico completo
npm run cursor-doctor
```

---

## 🧠 Proximos Passos

1. **Leia a BIBLIA**: `.cursor/rules/honesty.mdc` e `AGENTS.md`
2. **Entenda a arquitetura**: `docs/architecture.md`
3. **Adicione uma feature**: `bash scripts/generate-feature.sh minha-feature`
4. **Vibe coding**: Abra o Cursor, mencione `@AGENTS.md`, e comece a construir

---

## 🆘 Problemas Comuns

### "Cannot find module '@/shared/...'"
Verifique se `tsconfig.json` esta na raiz e os paths estao configurados.

### "Prisma Client not found"
Rode `npm run db:generate` para gerar o client do Prisma.

### "Port 3000 already in use"
Mude a porta no `.env`: `PORT=3001`

### "Database connection refused"
Verifique se o Docker esta rodando: `docker-compose ps`
