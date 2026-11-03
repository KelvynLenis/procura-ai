# Prompt para o backend — alerta de incidente no web

Documento para o time do **`procuraai-web`**. Cobre duas entregas:

1. API de e-mail `POST /api/mobile/send-incident-alert` (já esboçada no web; precisa estar no ar em homolog/prod).
2. UI web que mostra o **rascunho pendente** quando o usuário perde o celular e entra pelo navegador (mesmo fluxo do modal do mobile).

Referências no mobile:

- Modal: `components/PendingIncidentModal.tsx`
- Rascunho Appwrite: `functions/sensors/risk/incident-draft.ts` e `docs/incidente-appwrite.md`
- Chamada de e-mail: `functions/sensors/risk/incident-email.ts`
- Detecção → draft: `persistPossibleIncident` (marca aparelho **Suspeito**, cria notificação inbox, dispara e-mail)

---

## Prompt pronto para colar (agent / desenvolvedor)

```text
Contexto
--------
O app mobile Procura.Aí detecta possível furto ou roubo, salva um rascunho em
Appwrite (collection `incident_drafts`, status=`pending`), marca o device como
`Suspeito`, cria notificação na conta e chama a API web para enviar e-mail.

Quando a pessoa perde o celular, ela precisa:
1) receber e-mail (ela + contatos de confiança);
2) abrir o site Procura.Aí logada e ver o mesmo alerta do mobile, com ações
   equivalentes a "Estou bem" e "Cadastrar ocorrência".

Repositório: procuraai-web (Next.js).
Já existe esboço de:
- `app/api/mobile/send-incident-alert/route.ts`
- `emailService.sendIncidentAlertEmail` em `services/email.ts`
O mobile chama:
  POST {BASE_URL}/api/mobile/send-incident-alert
  (env EXPO_PUBLIC_INCIDENT_EMAIL_ENDPOINT)

Entrega A — API de e-mail (obrigatória em homolog e prod)
--------------------------------------------------------
1. Garantir que a rota `POST /api/mobile/send-incident-alert` está deployada.
2. Body JSON esperado (enviado pelo mobile):

{
  "userName": string,
  "userEmail": string,          // obrigatório
  "kind": "roubo" | "furto",    // obrigatório
  "deviceModel"?: string,
  "deviceBrand"?: string,
  "timeEvent"?: string,         // já formatado pt-BR, ex: "03/11/2026 - 10:15"
  "location"?: string,          // "lat, lng" ou "Local não disponível"
  "emergencyContacts"?: Array<{ "name": string, "email": string }>
}

3. Respostas:
   - 200: { "success": true, "message": "..." }
   - 400: e-mail ou kind inválido
   - 500: falha no nodemailer / Gmail

4. Destinatários: userEmail + emergencyContacts (dedupe por e-mail).
5. Conteúdo do e-mail (alinhado ao modal mobile):
   - Título: "Possível incidente detectado"
   - Texto: atividade suspeita no dispositivo (marca/modelo), pode ser furto/roubo
   - Caixa: Ocorrência sugerida | Data | Local aproximado
   - CTA: abrir o Procura.Aí em outro aparelho (ou no web) para confirmar ou
     marcar que está tudo bem
6. Reusar o layout/footer já usados em `services/email.ts` (verification/recovery).
7. Credenciais: GMAIL_USER / GMAIL_APP_PASSWORD (servidor). Nunca expor no client.
8. CORS: a rota é chamada pelo app React Native (fetch). Aceitar POST JSON.

Entrega B — Alerta de rascunho pendente no web
----------------------------------------------
Objetivo: usuário logado no web vê modal/banner se existir draft `pending`
da conta (mesmo documento que o mobile cria). Caso típico: celular perdido,
pessoa entra no site pelo notebook/outro device.

1. Listar drafts pendentes no Appwrite (mesma collection do mobile):
   - collection: `incident_drafts` (env do web equivalente a
     EXPO_PUBLIC_COLLECTION_INCIDENT_DRAFTS)
   - queries:
     - equal auth_id = user autenticado (mesmo id usado em devices/events)
     - equal status = "pending"
     - orderDesc $createdAt
     - limit 10
   - Ignorar drafts com `expires_at` no passado.

2. Documento (campos relevantes):
   - $id, auth_id, id_device, status, suggested_type, description, time_event
   - location: number[] [latitude, longitude]  (NÃO usar atributos lat/lng)
   - evidence_uri?: "storage:<fileId>"
   - risk_level, incident_state, modalities, reasons, source, expires_at

3. UX (espelhar o mobile `PendingIncidentModal`):
   - Modal ao carregar a área logada (home/devices) se houver pending
   - Ícone de alerta vermelho com "!"
   - Título: "Está tudo bem com você?"
   - Texto: atividade suspeita no dispositivo (buscar brand/phone_model em
     devices pelo id_device)
   - Caixa ciano (#C4F3F2):
       Ocorrência sugerida: {suggested_type}
       Data: {time_event formatado dd/mm/aaaa - HH:mm}
       Local aproximado: lat,lng de location[] ou "—"
   - Texto: "Se você foi furtado ou roubado, confirme a ocorrência."
   - Botões lado a lado:
       a) "Estou bem" (secundário / outline)
       b) "Cadastrar ocorrência" (primário azul #0B7AF5)

4. Ação "Estou bem" (igual clearUserOkIncident do mobile):
   - Apagar o documento do draft (Delete, não só mudar status)
   - Se evidence_uri começar com storage:, apagar o arquivo no bucket de
     incidentes (incidente_storage)
   - Voltar o device (id_device) para status "Regular", is_stolen=false
   - Fechar o modal sem Alert de sucesso obrigatório
   - Em erro, mostrar mensagem de falha

5. Ação "Cadastrar ocorrência":
   - Abrir o formulário de alerta/ocorrência já existente no web,
     pré-preenchido com:
       type = suggested_type
       description = description
       time_event = time_event
       mapa/local = location[0], location[1] quando existir
       device = id_device
       referência ao draftId + evidence_uri para limpar após submit
   - Ao criar o evento oficial (events):
       - status do device = tipo da ocorrência (Roubo/Furto/etc.)
       - is_stolen conforme regra atual do web
       - apagar draft + arquivo de evidência
       - (opcional) POST /feedback no RAG se houver áudio — mesmo contrato
         do mobile em appwrite-bridge

6. Também listar o pending:
   - no sino/notificações, se já houver inbox tipo push com id_device
   - ou banner persistente em "Meus dispositivos" enquanto status=pending

7. Polling / refresh:
   - Ao focar a aba / ao montar o layout autenticado, reconsultar drafts
   - Intervalo opcional (ex.: 30–60s) enquanto logado

8. Segurança:
   - Só drafts do auth_id da sessão
   - Não vazar evidence_uri/áudio para terceiros
   - Permissões Appwrite: Create/Read/Update/Delete em incident_drafts e no
     bucket de incidentes para usuário autenticado (o mobile já depende de Delete)

Critérios de aceite
-------------------
[ ] Em homolog, POST /api/mobile/send-incident-alert com payload válido envia
    e-mail real (usuário + 1 contato).
[ ] Mobile com EXPO_PUBLIC_INCIDENT_EMAIL_ENDPOINT apontando para homolog
    dispara e-mail ao persistir incidente (não quebra se e-mail falhar).
[ ] Usuário A com draft pending vê o modal no web ao logar.
[ ] "Estou bem" no web remove draft, remove áudio e volta device para Regular.
[ ] "Cadastrar ocorrência" no web cria evento e limpa o draft.
[ ] Sem draft pending, nenhum modal aparece.
[ ] Draft expirado (expires_at) não aparece.

Fora de escopo
--------------
- Não reimplementar o detector TFLite no web.
- Não criar colunas lat/lng em incident_drafts (usar location double[]).
- Não enviar e-mail no "Estou bem" nem no submit da ocorrência (só na detecção).
```

---

## Contrato rápido da API (mobile → web)

| Item | Valor |
| --- | --- |
| Método | `POST` |
| Path | `/api/mobile/send-incident-alert` |
| Homolog (exemplo) | `https://procuraai-homolog.secties.pb.gov.br/api/mobile/send-incident-alert` |
| Content-Type | `application/json` |
| Quem chama | App mobile, em `persistPossibleIncident` (após draft + Suspeito) |
| Falha | Mobile só loga; o incidente continua válido |

Variável no mobile:

```bash
EXPO_PUBLIC_INCIDENT_EMAIL_ENDPOINT=https://<host>/api/mobile/send-incident-alert
```

Se vazia, o app deriva `{EXPO_PUBLIC_BASE_URL}/api/mobile/send-incident-alert`.

---

## Checklist de deploy

1. Merge/deploy do `procuraai-web` com a rota e o template de e-mail.
2. Confirmar `GMAIL_USER` / `GMAIL_APP_PASSWORD` no ambiente do web.
3. Testar com `curl` o POST da rota.
4. Atualizar homolog do mobile com o endpoint.
5. Implementar a UI de draft pending no web (Entrega B).
6. Validar fluxo completo: detectar no phone → e-mail chega → abrir web → Estou bem / cadastrar.

---

## curl de teste (e-mail)

```bash
curl -X POST "$BASE_URL/api/mobile/send-incident-alert" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Teste",
    "userEmail": "seu-email@dominio.com",
    "kind": "furto",
    "deviceBrand": "Samsung",
    "deviceModel": "Galaxy",
    "timeEvent": "03/11/2026 - 10:00",
    "location": "-7.11950, -34.84500",
    "emergencyContacts": [
      { "name": "Contato", "email": "contato@dominio.com" }
    ]
  }'
```

Substitua `$BASE_URL` pelo host de homolog ou produção do `procuraai-web`.
