# API Hotel Quartos - Guia de Implementação

## 📋 Resumo

API completa para gerenciamento de quartos de hotel com:
- ✅ **19 endpoints** (6 por entidade + 1 health check)
- ✅ **Todos os 5 métodos HTTP** (GET, POST, PUT, PATCH, DELETE)
- ✅ **15 consultas Prisma Client** prontas
- ✅ **8 índices de otimização** no banco de dados
- ✅ **Path parameters**, **Query parameters** e **JSON body** definidos

---

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados

Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/hotel_db"
NODE_ENV=development
PORT=3000
```

### 3. Executar Migrações Prisma
```bash
# Criar/atualizar schema
npx prisma migrate dev --name init

# Sincronizar com banco existente
npx prisma db push
```

### 4. Iniciar o Servidor
```bash
npm start
# ou
node src/server.js
```

O servidor iniciará em `http://localhost:3000`

---

## 📊 Estrutura de Arquivos

```
src/
├── server.js                    # Servidor principal (Restify)
├── config/
│   └── prisma.js               # Cliente Prisma
├── controllers/
│   └── quarto.controller.js     # Lógica de todos os endpoints
├── routes/
│   └── quarto.routes.js         # Definição de todas as rotas
└── DOCUMENTACAO_API.js          # Documentação técnica completa

prisma/
└── schema.prisma                # Schema com índices otimizados

Documentação:
├── ESPECIFICACAO_TECNICA.md     # Especificação completa
├── EXEMPLOS_REQUISICOES.json    # Exemplos para Postman
└── README.md                    # Este arquivo
```

---

## 🔗 Endpoints Disponíveis

### TipoQuarto (6 endpoints)
```
GET    /api/tipos-quarto               Listar todos
GET    /api/tipos-quarto/:id           Obter por ID
POST   /api/tipos-quarto               Criar
PUT    /api/tipos-quarto/:id           Atualizar completo
PATCH  /api/tipos-quarto/:id           Atualizar parcial
DELETE /api/tipos-quarto/:id           Deletar
```

### Quarto (6 endpoints)
```
GET    /api/quartos                    Listar com paginação
GET    /api/quartos/:id                Obter por ID com fotos
POST   /api/quartos                    Criar
PUT    /api/quartos/:id                Atualizar completo
PATCH  /api/quartos/:id                Atualizar parcial
DELETE /api/quartos/:id                Deletar (com fotos)
```

### Fotos (6 endpoints)
```
GET    /api/quartos/:quartoId/fotos    Listar fotos de quarto
GET    /api/fotos/:fotoId              Obter foto específica
POST   /api/quartos/:quartoId/fotos    Criar foto
PUT    /api/fotos/:fotoId              Atualizar foto
PATCH  /api/fotos/:fotoId              Atualizar parcial
DELETE /api/fotos/:fotoId              Deletar foto
```

### Utility (1 endpoint)
```
GET    /health                         Verificar saúde da API
```

---

## 📝 Path Parameters

### TipoQuarto
- `:id` (Int) - ID do tipo de quarto

### Quarto
- `:id` (Int) - ID do quarto

### Fotos
- `:quartoId` (Int) - ID do quarto
- `:fotoId` (Int) - ID da foto

---

## 🔍 Query Parameters

### GET /api/quartos
```
?tipoQuartoId=1        Filtrar por tipo
&status=1              Filtrar por status (1=Disponível, 0=Indisponível)
&skip=0                Registros a pular (padrão: 0)
&take=10               Registros a retornar (padrão: 10)
```

Exemplo completo:
```
GET /api/quartos?tipoQuartoId=1&status=1&skip=0&take=10
```

---

## 📦 JSON Body (POST, PUT, PATCH)

### POST /api/tipos-quarto
```json
{
  "descricao": "Quarto Solteiro",
  "status": 1
}
```

### POST /api/quartos
```json
{
  "numero": "101",
  "preco": 150.50,
  "status": 1,
  "tipoQuartoId": 1
}
```

### POST /api/quartos/:quartoId/fotos
```json
{
  "foto_id": 1,
  "foto_nome": "quarto_principal.jpg",
  "foto_extensao": "jpg",
  "foto_status": 1
}
```

### PUT /api/tipos-quarto/:id
```json
{
  "descricao": "Quarto Duplo",
  "status": 1
}
```

### PATCH /api/quartos/:id
```json
{
  "preco": 200.00,
  "status": 0
}
```

---

## 🗄️ Índices de Otimização

Total de 8 índices implementados:

| Tabela | Índice | Campo(s) | Benefício |
|--------|--------|----------|-----------|
| tipo_quarto | idx_tipo_quarto_status | status | Filtros por status |
| quarto | idx_quarto_status | status | Disponibilidade |
| quarto | idx_quarto_numero | numero | Busca por número |
| quarto | idx_quarto_tipo_status | tipo_quarto_id, status | Filtros combinados |
| fotos | idx_fotos_status | foto_status | Fotos ativas |
| fotos | idx_fotos_quarto_status | quarto_id, foto_status | Fotos por quarto |

---

## 💾 Consultas Prisma Client

### TipoQuarto
```javascript
// Listar
const tipos = await prisma.tipoQuarto.findMany({
  where: { status: 1 },
  orderBy: { descricao: 'asc' }
});

// Buscar por ID
const tipo = await prisma.tipoQuarto.findUnique({
  where: { id: 1 },
  include: { quartos: true }
});

// Criar
const novo = await prisma.tipoQuarto.create({
  data: { descricao: "...", status: 1 }
});

// Atualizar
const atualizado = await prisma.tipoQuarto.update({
  where: { id: 1 },
  data: { descricao: "...", status: 1 }
});

// Deletar
await prisma.tipoQuarto.delete({ where: { id: 1 } });
```

### Quarto
```javascript
// Listar com paginação
const quartos = await prisma.quarto.findMany({
  where: { status: 1 },
  include: { tipoQuarto: true },
  skip: 0,
  take: 10
});

// Buscar por ID com fotos
const quarto = await prisma.quarto.findUnique({
  where: { id: 1 },
  include: {
    tipoQuarto: true,
    fotos: { where: { foto_status: 1 } }
  }
});

// Criar
const novo = await prisma.quarto.create({
  data: {
    numero: "101",
    preco: 150.50,
    status: 1,
    tipoQuartoId: 1
  }
});
```

### Fotos
```javascript
// Listar fotos de um quarto
const fotos = await prisma.fotos.findMany({
  where: { quarto_id: 1, foto_status: 1 }
});

// Criar foto
const foto = await prisma.fotos.create({
  data: {
    foto_id: 1,
    foto_nome: "...",
    foto_extensao: "jpg",
    foto_status: 1,
    quarto_id: 1
  }
});
```

---

## 🧪 Exemplos de Requisições

### cURL

```bash
# Listar tipos de quarto
curl -X GET http://localhost:3000/api/tipos-quarto

# Criar tipo
curl -X POST http://localhost:3000/api/tipos-quarto \
  -H "Content-Type: application/json" \
  -d '{"descricao": "Quarto Solteiro", "status": 1}'

# Listar quartos com filtro e paginação
curl -X GET "http://localhost:3000/api/quartos?tipoQuartoId=1&status=1&skip=0&take=10"

# Criar quarto
curl -X POST http://localhost:3000/api/quartos \
  -H "Content-Type: application/json" \
  -d '{"numero": "101", "preco": 150.50, "status": 1, "tipoQuartoId": 1}'

# Atualizar (PATCH)
curl -X PATCH http://localhost:3000/api/quartos/1 \
  -H "Content-Type: application/json" \
  -d '{"preco": 200.00}'

# Deletar
curl -X DELETE http://localhost:3000/api/quartos/1

# Health check
curl -X GET http://localhost:3000/health
```

### JavaScript Fetch

```javascript
// Listar quartos
fetch('http://localhost:3000/api/quartos')
  .then(r => r.json())
  .then(data => console.log(data));

// Criar quarto
fetch('http://localhost:3000/api/quartos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    numero: '101',
    preco: 150.50,
    status: 1,
    tipoQuartoId: 1
  })
})
  .then(r => r.json())
  .then(data => console.log(data));

// Atualizar (PATCH)
fetch('http://localhost:3000/api/quartos/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ preco: 200.00, status: 0 })
})
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## ✅ Resposta de Sucesso

```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero": "101",
    "preco": 150.50,
    "status": 1,
    "tipoQuartoId": 1
  },
  "message": "Quarto criado com sucesso"
}
```

## ❌ Resposta de Erro

```json
{
  "success": false,
  "error": "Campos numero e preco são obrigatórios"
}
```

---

## 📖 Códigos de Status HTTP

| Código | Significado | Quando |
|--------|-------------|--------|
| 200 | OK | Sucesso com resposta |
| 201 | Created | Recurso criado |
| 204 | No Content | Sucesso sem resposta (DELETE) |
| 400 | Bad Request | Dados inválidos |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (tipo com quartos) |
| 500 | Server Error | Erro interno |

---

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar migrations
npx prisma migrate dev

# Sincronizar banco
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# Iniciar servidor
npm start

# Studio Prisma (visualizar dados)
npx prisma studio

# Validar schema
npx prisma validate
```

---

## 📋 Checklist de Implementação

- ✅ Schema Prisma com 3 entidades
- ✅ 8 índices para otimização
- ✅ Controllers com 18 métodos (3 por endpoint)
- ✅ 19 endpoints (GET, POST, PUT, PATCH, DELETE)
- ✅ Path parameters definidos
- ✅ Query parameters para paginação
- ✅ JSON body para POST, PUT, PATCH
- ✅ 15 consultas Prisma Client
- ✅ Tratamento de erros
- ✅ Resposta padronizada
- ✅ Servidor Restify configurado
- ✅ CORS habilitado
- ✅ Documentação completa

---

## 📚 Documentação Adicional

- **ESPECIFICACAO_TECNICA.md** - Documentação completa com todos os detalhes
- **EXEMPLOS_REQUISICOES.json** - Exemplos prontos para Postman
- **src/DOCUMENTACAO_API.js** - Documentação técnica em código

---

## 🤝 Próximos Passos Recomendados

1. **Autenticação JWT** - Proteger endpoints
2. **Validação robusta** - Usar Joi ou Yup
3. **Logging** - Winston ou Morgan
4. **Cache** - Redis para consultas frequentes
5. **Testes** - Jest ou Mocha
6. **Documentação API** - Swagger/OpenAPI
7. **Rate Limiting** - Restify rate limiter
8. **Versionamento** - /api/v1/, /api/v2/

---

## 🎯 Suporte

Para dúvidas sobre:
- **Endpoints:** Ver ESPECIFICACAO_TECNICA.md (seção 3)
- **Path Parameters:** Ver ESPECIFICACAO_TECNICA.md (seção 2)
- **Body JSON:** Ver ESPECIFICACAO_TECNICA.md (seção 4)
- **Consultas:** Ver ESPECIFICACAO_TECNICA.md (seção 5)
- **Índices:** Ver ESPECIFICACAO_TECNICA.md (seção 6)

---

**Versão:** 1.0.0  
**Data:** 28 de Abril de 2026  
**Status:** ✅ Completo e pronto para uso
