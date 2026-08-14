# Security Policy

## Supported versions

Security fixes are applied to the current production branch and active integration branches.

## Reporting a vulnerability

Do not open a public issue for suspected vulnerabilities, exposed credentials, authentication bypasses, payment/checkout issues, or customer-data exposure.

Contact the repository owner privately through GitHub and include:

- affected component or route
- reproduction steps
- impact assessment
- logs or screenshots with secrets redacted
- suggested remediation, if known

## Secrets and credentials

Never commit Shopify tokens, Cloudflare API tokens, account IDs, private keys, webhook secrets, `.env` files, customer data, or production credentials. Use provider-managed secrets and local environment files excluded from Git.

## Deployment safety

Production changes should flow through a pull request and a preview/staging deployment before the `main` branch is promoted to production.
