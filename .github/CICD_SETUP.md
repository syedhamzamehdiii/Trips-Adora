# CI/CD Setup Guide for TripsAdora

This guide explains how to set up automated deployment using GitHub Actions.

## Overview

The CI/CD pipeline automatically deploys your code to the production server whenever you push to the `main` or `master` branch. Each platform (Customer, Supplier, Admin) has its own workflow that only runs when files in that platform's directory change.

## Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **Server Access**: SSH access to your production server
3. **SSH Key**: A private SSH key for authentication

## Step 1: Generate SSH Key Pair

On your local machine, generate an SSH key pair if you don't have one:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

This creates two files:
- `~/.ssh/github_actions_deploy` (private key - keep secret!)
- `~/.ssh/github_actions_deploy.pub` (public key)

## Step 2: Add Public Key to Server

Copy the public key to your server:

```bash
# Copy the public key content
cat ~/.ssh/github_actions_deploy.pub

# On your server, add it to authorized_keys
ssh root@your-server-ip
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

**Alternative**: If you want GitHub Actions to run commands with sudo, you can add the key to a user that has passwordless sudo access:

```bash
# On server, edit sudoers (use visudo for safety)
sudo visudo

# Add this line (replace 'deploy' with your username):
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart customer-api.service, /usr/bin/systemctl restart supplier-api.service, /usr/bin/systemctl restart admin-api.service, /usr/bin/systemctl status *
```

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

### Required Secrets

1. **`SERVER_HOST`**
   - Value: Your server IP address or domain (e.g., `srv1085013.hostinger.com` or `123.45.67.89`)

2. **`SERVER_USER`**
   - Value: SSH username (e.g., `root` or `deploy`)

3. **`SERVER_SSH_KEY`**
   - Value: The **private key** content from `~/.ssh/github_actions_deploy`
   - Copy the entire content including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`

4. **`SERVER_PORT`** (Optional)
   - Value: SSH port (default: `22`)

### Optional Frontend API URL Secrets

These are only needed if you want to override the default API URLs during build:

- **`CUSTOMER_FRONTEND_API_BASE_URL`**: Default: `https://tripsadora.com/api`
- **`SUPPLIER_FRONTEND_API_BASE_URL`**: Default: `https://supplier.tripsadora.com/api`
- **`ADMIN_FRONTEND_API_BASE_URL`**: Default: `https://admin.tripsadora.com/api`

## Step 4: Verify Systemd Services

Make sure your systemd services are set up correctly on the server. The workflows expect these service names:

- `customer-api.service` (port 8001)
- `supplier-api.service` (port 8000)
- `admin-api.service` (port 8002)

Verify they exist:
```bash
sudo systemctl list-units | grep -E "(customer|supplier|admin)-api"
```

## Step 5: Test the Deployment

### Option 1: Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select a workflow (e.g., "Deploy Customer Platform")
3. Click **Run workflow**
4. Select branch and click **Run workflow**

### Option 2: Push to Main Branch

Make a small change to any file in a platform directory and push:

```bash
# Example: Update a comment in customer platform
echo "# Updated" >> customer-platform/frontend/src/App.jsx
git add .
git commit -m "Test deployment"
git push origin main
```

## How It Works

### Workflow Triggers

Each workflow runs when:
- Files in that platform's directory change (e.g., `customer-platform/**`)
- You manually trigger it from GitHub Actions
- The workflow file itself changes

### Deployment Process

1. **Checkout**: Clones your repository
2. **Build Frontend**: Installs dependencies and builds production bundle
3. **Deploy Frontend**: Copies `dist/` files to `/var/www/tripsadora/{platform}/`
4. **Set Permissions**: Sets correct ownership and permissions
5. **Deploy Backend**: Copies backend files to `/var/www/Trips-Adora/{platform}/backend/`
6. **Install Dependencies**: Creates/updates virtual environment and installs Python packages
7. **Restart Service**: Restarts the systemd service
8. **Verify**: Checks service status

### Path-Based Deployment

The workflows use `paths` filters, so:
- Changes to `customer-platform/**` → Only customer platform deploys
- Changes to `supplier-platform/**` → Only supplier platform deploys
- Changes to `admin-platform/**` → Only admin platform deploys
- Changes to multiple platforms → All affected platforms deploy

## Troubleshooting

### Deployment Fails with "Permission Denied"

**Solution**: Make sure the SSH user has sudo access for systemctl commands, or add the public key to root's authorized_keys.

### Frontend Not Updating

**Solution**: 
1. Check if build completed successfully in GitHub Actions logs
2. Verify files were copied: `ls -la /var/www/tripsadora/{platform}/`
3. Check Nginx is serving the correct directory

### Backend Service Not Restarting

**Solution**:
1. Check service name matches: `sudo systemctl list-units | grep api`
2. Verify sudo access: `sudo systemctl status customer-api.service`
3. Check service logs: `sudo journalctl -u customer-api.service -n 50`

### "Module not found" Errors

**Solution**: The virtual environment might not have all dependencies. Check the workflow logs for pip install errors.

### SSH Connection Timeout

**Solution**:
1. Verify `SERVER_HOST` is correct
2. Check firewall allows SSH (port 22)
3. Verify `SERVER_PORT` if using non-standard port
4. Test SSH manually: `ssh -i ~/.ssh/github_actions_deploy user@host`

## Security Best Practices

1. **Never commit private keys** to the repository
2. **Use GitHub Secrets** for all sensitive information
3. **Rotate SSH keys** periodically
4. **Limit sudo access** to only necessary commands
5. **Use a dedicated deploy user** instead of root if possible
6. **Enable 2FA** on your GitHub account

## Customization

### Change Deployment Branch

Edit the workflow files and change:
```yaml
branches:
  - main
  - master
```
to your preferred branch name.

### Add Pre-deployment Tests

Add a test step before deployment:
```yaml
- name: Run tests
  working-directory: customer-platform/backend
  run: |
    pip install pytest
    pytest tests/
```

### Add Notifications

Add Slack/Discord notifications on deployment success/failure using actions like `8398a7/action-slack`.

## Support

If you encounter issues:
1. Check GitHub Actions logs for detailed error messages
2. Verify all secrets are set correctly
3. Test SSH connection manually
4. Check server logs: `sudo journalctl -u {service-name} -f`

