# CI/CD — ProcuraAI Web (GitLab)

Documentação do pipeline GitLab CI/CD para sincronizar `develop` → `homolog.secties` e fazer deploy automático no servidor de homologação.

Repositório: `https://gitlab.lavid.ufpb.br/procuraai/procuraai-web.git`

---

## Visão geral do fluxo

```
Push / Merge em develop
        │
        ▼
   ┌─────────┐
   │  build  │  npm ci + npm run build
   └────┬────┘
        │ (sucesso)
        ▼
   ┌──────────────────┐
   │ sync_to_homolog  │  merge develop → homolog.secties
   └────────┬─────────┘
            │ (push na branch homolog.secties)
            ▼
   ┌─────────────────────┐
   │ deploy_homolog_ssh  │  SSH no servidor + ./deploy.sh
   └─────────────────────┘
            │
            ▼
   https://procuraai-homolog.secties.pb.gov.br/
```

### Branches envolvidas

| Branch | Função |
|--------|--------|
| `develop` | Branch de integração; dispara build + sync |
| `homolog.secties` | Branch de homologação; dispara build + deploy |

> **Nota:** a branch de homolog no repositório é `homolog.secties` (com ponto), não `homolog-secties`.

---

## Arquivo de pipeline

O pipeline está definido em [`.gitlab-ci.yml`](.gitlab-ci.yml).

### Stages

| Stage | Job | Quando roda |
|-------|-----|-------------|
| `validate` | `build` | MR, `develop`, `homolog.secties`, `main` |
| `sync` | `sync_to_homolog` | Apenas push em `develop` |
| `deploy` | `deploy_homolog_ssh` | Apenas push em `homolog.secties` |

### O que cada job faz

**`build`**
- Instala dependências com `npm ci`
- Executa `npm run build`
- Gera artifact `.next/` (expira em 1 dia)

**`sync_to_homolog`**
- Faz merge de `origin/develop` em `homolog.secties`
- Faz push usando o token `SYNC_TOKEN`
- Só roda se o `build` passou

**`deploy_homolog_ssh`**
- Conecta no servidor via SSH
- Executa `git pull` na branch `homolog.secties`
- Roda `./deploy.sh` (Docker Compose build + up)

---

## Servidor de homologação

Configuração identificada no ambiente atual:

| Item | Valor |
|------|-------|
| Hostname | `procura-ai` |
| Domínio | `procuraai-homolog.secties.pb.gov.br` |
| IP público | `200.129.85.133` |
| Usuário SSH | `procuraai` |
| Porta SSH | **22024** (não é a porta 22 padrão) |
| Caminho do projeto | `/home/procuraai/procuraai-web` |
| Chave SSH existente | `~/.ssh/gitlab-ci` (privada) / `~/.ssh/gitlab-ci.pub` (pública) |
| Chave autorizada | Sim, em `~/.ssh/authorized_keys` |
| Docker | Usuário `procuraai` no grupo `docker` |
| `.env` | Configurado localmente no servidor (não vai pelo CI) |

Deploy manual local (referência): ver [README-DEPLOY.md](README-DEPLOY.md).

---

## Configuração no GitLab

### 1. Enviar o `.gitlab-ci.yml`

O pipeline só funciona depois que o arquivo estiver no repositório remoto, preferencialmente em `develop`:

```bash
git add .gitlab-ci.yml README-CI-CD.md
git commit -m "ci: adiciona pipeline develop → homolog.secties → deploy"
git push origin develop
```

### 2. Variáveis CI/CD

**Settings → CI/CD → Variables → Add variable**

| Key | Valor | Type | Visibilidade | Protect | Expand |
|-----|-------|------|--------------|---------|--------|
| `SYNC_TOKEN` | Project Access Token (ver abaixo) | Variable | **Mascarado e oculto** | ✅ | ❌ |
| `SSH_PRIVATE_KEY` | Conteúdo de `~/.ssh/gitlab-ci` | **File** | **Visível** | ✅ | ❌ |
| `DEPLOY_HOST` | `procuraai-homolog.secties.pb.gov.br` | Variable | Visível | ✅ | ❌ |
| `DEPLOY_USER` | `procuraai` | Variable | Visível | ✅ | ❌ |
| `DEPLOY_PATH` | `/home/procuraai/procuraai-web` | Variable | Visível | ✅ | ❌ |
| `DEPLOY_SSH_PORT` | `22024` | Variable | Visível | ✅ | ❌ |

**Environment scope:** `All` (padrão) para todas.

#### Visibilidade das variáveis

| Opção | Quando usar |
|-------|-------------|
| **Visível** | Host, usuário, caminho, porta e chave SSH (Type File) |
| **Mascarado** | Tokens em uma linha, se não puder usar oculto |
| **Mascarado e oculto** | `SYNC_TOKEN` — segredo que não precisa ser lido depois |

**Por que a chave SSH não pode ser mascarada?**

Chaves SSH contêm quebras de linha e espaços. O GitLab exige que valores mascarados sejam uma única linha sem whitespace. Por isso:

- `SSH_PRIVATE_KEY` → Type **File** + Visibilidade **Visível** + **Protect** ✅
- O conteúdo da chave não aparece nos logs; o pipeline usa o arquivo temporário

**Erro comum:**

> "O valor não pode conter os seguintes caracteres: espaços em branco."

Isso ocorre ao tentar mascarar a chave SSH. Use **Visível** com Type **File**.

#### Flags das variáveis

Ao cadastrar cada variável, o GitLab exibe duas flags adicionais:

##### Protect variable

> *Export variable to pipelines running on protected branches and tags only.*

**O que faz:** a variável **só fica disponível** em pipelines que rodam em **branches ou tags protegidas**. Pipelines em branches de feature (ex.: `@kel/issue-123`) **não recebem** essa variável.

**Quando marcar ✅ (recomendado para este projeto):**

- Em **todas** as variáveis do CI/CD (`SYNC_TOKEN`, `SSH_PRIVATE_KEY`, `DEPLOY_*`)
- Quando `develop` e `homolog.secties` estiverem marcadas como protegidas em **Settings → Repository → Protected branches**

**Quando NÃO marcar ❌:**

- Se a branch `develop` ou `homolog.secties` **não** estiver protegida — o pipeline não verá a variável e o job falhará com erro de variável ausente
- Se quiser testar o pipeline em branches de feature com as mesmas credenciais (não recomendado por segurança)

**Pré-requisito:** antes de marcar Protect, confirme que estas branches estão protegidas:

```
Settings → Repository → Protected branches
  develop         → Protected ✅
  homolog.secties → Protected ✅
```

##### Expand variable reference

> *$ will be treated as the start of a reference to another variable.*

**O que faz:** se o valor contiver `$`, o GitLab interpreta como referência a outra variável.

Exemplo com **Expand ✅**:
```
Valor de DEPLOY_PATH = /home/$DEPLOY_USER/procuraai-web
Resultado final      = /home/procuraai/procuraai-web
```

Exemplo com **Expand ❌**:
```
Valor de SYNC_TOKEN = glpat-xxxx$yyyy
Resultado final     = glpat-xxxx$yyyy  (literal, sem substituição)
```

**Quando marcar ✅:**

- Quando o valor **deve** compor outras variáveis (ex.: path dinâmico com `$DEPLOY_USER`)
- Quando você **quer** reutilizar variáveis dentro de outras

**Quando NÃO marcar ❌ (recomendado para este projeto):**

- **`SYNC_TOKEN`** — tokens do GitLab podem conter `$`; expandir quebraria o valor
- **`SSH_PRIVATE_KEY`** — chaves nunca devem passar por substituição
- **`DEPLOY_HOST`**, **`DEPLOY_USER`**, **`DEPLOY_PATH`**, **`DEPLOY_SSH_PORT`** — valores fixos e literais

**Regra prática para o ProcuraAI:**

| Variável | Protect | Expand | Motivo |
|----------|---------|--------|--------|
| `SYNC_TOKEN` | ✅ | ❌ | Segredo; token pode conter `$` |
| `SSH_PRIVATE_KEY` | ✅ | ❌ | Segredo; nunca expandir |
| `DEPLOY_HOST` | ✅ | ❌ | Valor fixo |
| `DEPLOY_USER` | ✅ | ❌ | Valor fixo |
| `DEPLOY_PATH` | ✅ | ❌ | Caminho fixo (não usa `$DEPLOY_USER`) |
| `DEPLOY_SSH_PORT` | ✅ | ❌ | Valor numérico fixo |

##### Resumo: configuração completa por variável

| Variável | Type | Visibilidade | Protect | Expand |
|----------|------|--------------|---------|--------|
| `SYNC_TOKEN` | Variable | Mascarado e oculto | ✅ | ❌ |
| `SSH_PRIVATE_KEY` | File | Visível | ✅ | ❌ |
| `DEPLOY_HOST` | Variable | Visível | ✅ | ❌ |
| `DEPLOY_USER` | Variable | Visível | ✅ | ❌ |
| `DEPLOY_PATH` | Variable | Visível | ✅ | ❌ |
| `DEPLOY_SSH_PORT` | Variable | Visível | ✅ | ❌ |

### 3. Criar o `SYNC_TOKEN`

**Settings → Access Tokens → Add new token**

| Campo | Valor |
|-------|-------|
| Token name | `ci-sync-homolog` |
| Role | `Maintainer` |
| Scopes | `write_repository` |

Copie o token e cadastre como variável `SYNC_TOKEN`.

Esse token permite ao job `sync_to_homolog` fazer push na branch `homolog.secties`.

### 4. Branches protegidas

**Settings → Repository → Protected branches**

| Branch | Recomendação |
|--------|--------------|
| `develop` | Protegida; merge via MR |
| `homolog.secties` | Protegida; permitir push do token CI / Maintainers |

Se o sync falhar com *"not allowed to push"*, ajuste as permissões da branch protegida ou use token com role `Maintainer`.

### 5. GitLab Runner (instalar na VM com Docker)

**Settings → CI/CD → Runners**

É necessário **pelo menos 1 runner ativo** (status verde). Sem runner, os jobs ficam em `pending`.

Esta VM (`procura-ai`) já tem **Docker** instalado. Falta instalar o **GitLab Runner**.

#### Passo A — Criar o runner no GitLab (interface)

> **Atenção (GitLab 17+ / LAVID):** a mensagem *"Creating runners with runner registration tokens is disabled"* significa que o **token de registro antigo** (copiado da página Runners) **não funciona mais**. Use o fluxo **Create project runner** abaixo.

1. Acesse o projeto: `https://gitlab.lavid.ufpb.br/procuraai/procuraai-web`
2. **Settings → CI/CD → Runners**
3. Clique em **New project runner** ou **Create project runner** (botão azul — **não** use o "registration token" no final da página)
4. Configure:

| Campo | Valor |
|-------|-------|
| Tags | `homolog,docker` (opcional) |
| Run untagged jobs | ✅ **Marcado** (obrigatório — jobs não têm tags) |
| Protected | ✅ **Marcado** (variáveis CI usam Protect) |
| Locked | ❌ Desmarcado |
| Maximum job timeout | padrão ou `3600` |
| Paused | ❌ Desmarcado |

> **GitLab 19+:** tags, run-untagged e protected são definidos **aqui na UI**, não no comando `gitlab-runner register`. Se faltar "Run untagged jobs", o runner ignorará os jobs.

4. Clique em **Create runner**
5. **Copie o token** exibido (formato `glrt-...`) — ele só aparece uma vez

#### Passo B — Instalar na VM (terminal)

Conecte na VM e execute:

```bash
cd /home/procuraai/procuraai-web
chmod +x scripts/setup-gitlab-runner.sh

sudo RUNNER_TOKEN=glrt-SEU_TOKEN_AQUI ./scripts/setup-gitlab-runner.sh
```

O script faz automaticamente:
- Instala o GitLab Runner (Ubuntu 24.04)
- Adiciona `gitlab-runner` ao grupo `docker`
- Registra com **executor Docker**
- Configura `network_mode = "host"` (para jobs de deploy alcançarem SSH na porta 22024)
- Inicia e habilita o serviço

#### Passo C — Instalação manual (alternativa)

Se preferir instalar passo a passo:

```bash
# 1. Instalar GitLab Runner
sudo apt-get update
sudo apt-get install -y curl ca-certificates
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL "https://packages.gitlab.com/runner/gitlab-runner/gpgkey" \
  -o /etc/apt/keyrings/gitlab-runner-archive-keyring.asc
echo "deb [signed-by=/etc/apt/keyrings/gitlab-runner-archive-keyring.asc] https://packages.gitlab.com/runner/gitlab-runner/ubuntu/ noble main" | \
  sudo tee /etc/apt/sources.list.d/gitlab-runner.list
sudo apt-get update
sudo apt-get install -y gitlab-runner

# 2. Permitir Docker para o runner
sudo usermod -aG docker gitlab-runner

# 3. Registrar (substitua glrt-SEU_TOKEN)
# GitLab 19+: NÃO use --tag-list, --run-untagged etc. (configure na UI)
sudo gitlab-runner register \
  --non-interactive \
  --url "https://gitlab.lavid.ufpb.br" \
  --token "glrt-SEU_TOKEN" \
  --executor "docker" \
  --docker-image "node:20-alpine" \
  --description "procuraai-homolog-docker"

# 4. Rede host (deploy via SSH na porta 22024)
sudo sed -i '/\[runners.docker\]/a\    network_mode = "host"' /etc/gitlab-runner/config.toml

# 5. Iniciar
sudo gitlab-runner verify
sudo systemctl enable gitlab-runner
sudo systemctl restart gitlab-runner
sudo systemctl status gitlab-runner
```

#### Passo D — Verificar

**No GitLab:**
- **Settings → CI/CD → Runners** → runner com **bolinha verde**
- Deve aparecer: `procuraai-homolog-docker`

**Na VM:**
```bash
sudo gitlab-runner status
sudo gitlab-runner list
```

**Teste:** faça push em `develop` e veja **Build → Pipelines** — jobs não devem ficar em `pending`.

#### Configuração do executor Docker

| Item | Valor | Motivo |
|------|-------|--------|
| Executor | `docker` | Jobs rodam em containers isolados |
| Imagem padrão | `node:20-alpine` | Usada pelo job `build` |
| `run-untagged` | `true` (na UI do GitLab) | Jobs do `.gitlab-ci.yml` não têm tags |
| `network_mode` | `host` | Deploy SSH alcança a VM na porta 22024 |

#### Erros comuns do Runner

| Problema | Solução |
|----------|---------|
| Job `pending` forever | Runner offline — `sudo systemctl restart gitlab-runner` |
| `Cannot connect to Docker daemon` | `sudo usermod -aG docker gitlab-runner` + restart |
| Runner não pega jobs protegidos | Em Runners, marque **Protected** no runner |
| SSH deploy falha do container | Confirme `network_mode = "host"` no `config.toml` |
| `permission denied` no register | Token expirado — crie novo runner no GitLab |
| `FATAL: Runner configuration other than name...` | GitLab 19+: remova `--tag-list`, `--run-untagged` do register; configure na UI |
| `Creating runners with runner registration tokens is disabled` | Token antigo — use **Create project runner** e token `glrt-` |
| `Verifying runner... is not valid` | Token errado (`glpat-` em vez de `glrt-`) ou expirado — crie runner novo na UI |

#### Arquivo de configuração

Após registro, o runner fica em:

```
/etc/gitlab-runner/config.toml
```

Exemplo esperado:

```toml
[[runners]]
  name = "procuraai-homolog-docker"
  url = "https://gitlab.lavid.ufpb.br"
  token = "..."
  executor = "docker"
  [runners.docker]
    network_mode = "host"
    image = "node:20-alpine"
    privileged = false
```

### 6. Validar o pipeline

**Build → Pipeline editor**
- Selecione a branch `develop`
- Valide ou confira o YAML

**Build → Pipelines**
- Acompanhe execuções após push em `develop` ou `homolog.secties`

**Build → Jobs**
- Veja logs de `build`, `sync_to_homolog`, `deploy_homolog_ssh`

---

## Chave SSH (já configurada)

O servidor já possui par de chaves dedicado ao CI:

```bash
# Chave privada (cadastrar no GitLab como SSH_PRIVATE_KEY, Type File)
~/.ssh/gitlab-ci

# Chave pública (já está em authorized_keys)
~/.ssh/gitlab-ci.pub
```

Testar conexão localmente:

```bash
ssh -i ~/.ssh/gitlab-ci -p 22024 procuraai@127.0.0.1
```

Para cadastrar no GitLab:

```bash
cat ~/.ssh/gitlab-ci
```

Copie o conteúdo completo (incluindo `BEGIN` e `END`).

---

## Abas do GitLab — o que usar

| Aba | Uso neste projeto |
|-----|-------------------|
| **Build → Pipelines** | Ver status e histórico |
| **Build → Jobs** | Logs de cada etapa |
| **Build → Pipeline editor** | Editar/validar `.gitlab-ci.yml` |
| **Build → Pipeline schedules** | Não necessário (sync é no push) |
| **Build → Artifacts** | Artefatos do build (`.next/`) |
| **Deploy → Environments** | Ambiente `homolog` após deploy |
| **Deploy → Releases** | Não obrigatório |
| **Deploy → Feature flags** | Não usado |
| **Deploy → Package registry** | Não usado |
| **Deploy → Model registry** | Não usado |

Configuração principal: **Settings → CI/CD** (Variables, Runners) e **Settings → Access Tokens**.

---

## Checklist de finalização

```
[ ] .gitlab-ci.yml commitado e presente em develop
[ ] SYNC_TOKEN criado (Access Token + variável)
[ ] SSH_PRIVATE_KEY cadastrada (Type File, Visível, Protect)
[ ] DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH, DEPLOY_SSH_PORT cadastrados
[ ] develop e homolog.secties protegidas
[ ] Runner ativo no projeto
[ ] .env configurado no servidor (fora do CI)
[ ] Push em develop → pipeline verde
[ ] homolog.secties atualizada automaticamente
[ ] Deploy concluído → site no ar
```

---

## Teste end-to-end

1. Faça merge de uma alteração em `develop`
2. Verifique pipeline em **Build → Pipelines**:
   - `build` ✅
   - `sync_to_homolog` ✅
3. Confira em **Repository → Branches** se `homolog.secties` recebeu merge
4. Novo pipeline em `homolog.secties`:
   - `build` ✅
   - `deploy_homolog_ssh` ✅
5. Acesse: https://procuraai-homolog.secties.pb.gov.br/

---

## Erros comuns

| Erro | Causa provável | Solução |
|------|----------------|---------|
| Pipeline não aparece | `.gitlab-ci.yml` ausente na branch | Commit + push do arquivo |
| Job `pending` forever | Sem runner ativo | Configurar runner |
| `SYNC_TOKEN` não definido | Variável não criada | Criar em CI/CD Variables |
| Push denied no sync | Branch protegida / token sem permissão | Ajustar protected branch ou role do token |
| SSH connection refused | Porta errada (22 vs 22024) | Definir `DEPLOY_SSH_PORT=22024` |
| Permission denied (publickey) | Chave errada ou não autorizada | Verificar `SSH_PRIVATE_KEY` e `authorized_keys` |
| `./deploy.sh` falha | `.env` ausente ou sem permissão Docker | Configurar `.env` e grupo `docker` |
| Variável mascarada rejeitada | Valor com espaços/quebras de linha | Usar Visível + Type File para chave SSH |
| Variável vazia no job (Protect ✅) | Branch não está protegida | Proteger `develop` e `homolog.secties`, ou desmarcar Protect |
| Token/chave corrompido (Expand ✅) | `$` no valor foi interpretado como variável | Desmarcar **Expand variable reference** |
| Merge conflict no sync | `homolog.secties` divergiu de `develop` | Resolver conflito manualmente na branch |

---

## Alternativa: Runner no servidor (sem SSH)

Se preferir não usar deploy via SSH, edite [`.gitlab-ci.yml`](.gitlab-ci.yml):

1. Comente o job `deploy_homolog_ssh`
2. Descomente `deploy_homolog_runner`
3. Registre um GitLab Runner no servidor com tag `homolog`

Nesse modelo, o job roda diretamente na máquina de homolog.

---

## Variáveis de ambiente da aplicação

O arquivo `.env` **não** é gerenciado pelo CI/CD. Ele fica apenas no servidor:

```bash
cd /home/procuraai/procuraai-web
nano .env
docker compose -f docker-compose.yaml up -d --force-recreate
```

Referência de variáveis: [`.env.example`](.env.example).

---

## Referências

- [`.gitlab-ci.yml`](.gitlab-ci.yml) — definição do pipeline
- [README-DEPLOY.md](README-DEPLOY.md) — deploy manual com Docker
- [deploy.sh](deploy.sh) — script executado no servidor
- [docker-compose.yaml](docker-compose.yaml) — orquestração do container
