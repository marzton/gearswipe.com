#!/bin/bash
#
# Deploy GearSwipe SPA to HostGator via SFTP.
#
# Prerequisites:
#   - HOSTGATOR_USER, HOSTGATOR_HOST, HOSTGATOR_DOCROOT env vars set
#   - .ssh/id_rsa or equivalent SFTP key configured
#   - dist/ directory contains the production build
#
# Usage:
#   export HOSTGATOR_USER=user
#   export HOSTGATOR_HOST=host.example.com
#   export HOSTGATOR_DOCROOT=/public_html/gearswipe.com
#   ./scripts/deploy-hostgator.sh

set -euo pipefail

if [[ ! -d "dist" ]]; then
  echo "Error: dist/ directory not found. Run 'pnpm build' first."
  exit 1
fi

if [[ -z "${HOSTGATOR_USER:-}" || -z "${HOSTGATOR_HOST:-}" || -z "${HOSTGATOR_DOCROOT:-}" ]]; then
  echo "Error: Set HOSTGATOR_USER, HOSTGATOR_HOST, HOSTGATOR_DOCROOT environment variables."
  exit 1
fi

echo "Deploying GearSwipe to HostGator..."
echo "  Host: ${HOSTGATOR_HOST}"
echo "  User: ${HOSTGATOR_USER}"
echo "  Root: ${HOSTGATOR_DOCROOT}"
echo ""

# Build list of files to sync, excluding .git and node_modules.
sftp -b - "${HOSTGATOR_USER}@${HOSTGATOR_HOST}" <<EOF
cd "${HOSTGATOR_DOCROOT}"
mput dist/*
quit
EOF

echo ""
echo "Deployment complete. Verify:"
echo "  - Apex resolves: curl -I https://gearswipe.com"
echo "  - Deep links work: curl -I https://gearswipe.com/browse"
echo "  - .htaccess is in place on the remote server"
