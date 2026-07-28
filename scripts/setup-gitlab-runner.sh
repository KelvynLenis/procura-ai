#!/bin/bash
#
# Instala e registra GitLab Runner com executor Docker na VM de homolog.
# Execute como root: sudo ./scripts/setup-gitlab-runner.sh
#
# Antes de rodar, obtenha o token em:
#   GitLab → Settings → CI/CD → Runners → Create project runner
#

set -euo pipefail

GITLAB_URL="${GITLAB_URL:-https://gitlab.lavid.ufpb.br}"
RUNNER_NAME="${RUNNER_NAME:-procuraai-homolog-docker}"
RUNNER_TAGS="${RUNNER_TAGS:-homolog,docker}"
DOCKER_IMAGE="${DOCKER_IMAGE:-node:20-alpine}"

if [ "$EUID" -ne 0 ]; then
  echo "Execute como root: sudo $0"
  exit 1
fi

if [ -z "${RUNNER_TOKEN:-}" ]; then
  echo "Defina RUNNER_TOKEN com o token do GitLab."
  echo ""
  echo "   GitLab → Settings → CI/CD → Runners → Create project runner"
  echo "   Copie o token (glrt-...) e rode:"
  echo ""
  echo "   sudo RUNNER_TOKEN=glrt-SEU_TOKEN $0"
  exit 1
fi

echo "Instalando GitLab Runner..."
apt-get update
apt-get install -y curl ca-certificates

if ! command -v gitlab-runner >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://packages.gitlab.com/runner/gitlab-runner/gpgkey" \
    -o /etc/apt/keyrings/gitlab-runner-archive-keyring.asc
  echo "deb [signed-by=/etc/apt/keyrings/gitlab-runner-archive-keyring.asc] https://packages.gitlab.com/runner/gitlab-runner/ubuntu/ noble main" \
    > /etc/apt/sources.list.d/gitlab-runner.list
  apt-get update
  apt-get install -y gitlab-runner
fi

echo "Configurando acesso ao Docker..."
usermod -aG docker gitlab-runner

# GitLab 19+ (token glrt-): tags, run-untagged, protected etc.
# devem ser configurados na UI ao criar o runner, NÃO no register.
# Settings → CI/CD → Runners → Create project runner
#   - Run untagged jobs: OK
#   - Protected: OK

echo "Registrando runner..."
gitlab-runner register \
  --non-interactive \
  --url "$GITLAB_URL" \
  --token "$RUNNER_TOKEN" \
  --executor docker \
  --docker-image "$DOCKER_IMAGE" \
  --description "$RUNNER_NAME"

# Jobs de deploy precisam alcançar o host via SSH (porta 22024)
CONFIG="/etc/gitlab-runner/config.toml"
if [ -f "$CONFIG" ] && ! grep -q 'network_mode = "host"' "$CONFIG"; then
  echo "Ajustando network_mode=host para jobs alcançarem SSH local..."
  sed -i '/\[runners.docker\]/a\    network_mode = "host"' "$CONFIG"
fi

echo "Iniciando GitLab Runner..."
gitlab-runner verify
systemctl enable gitlab-runner
systemctl restart gitlab-runner
systemctl status gitlab-runner --no-pager

echo ""
echo "GitLab Runner instalado e ativo!"
echo "Verifique em: GitLab → Settings → CI/CD → Runners"
echo "Deve aparecer com status verde: $RUNNER_NAME"
