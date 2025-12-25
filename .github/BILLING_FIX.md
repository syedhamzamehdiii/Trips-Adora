# Fixing GitHub Actions Billing Issue

## The Problem

GitHub Actions workflows are failing with:
> "The job was not started because recent account payments have failed or your spending limit needs to be increased."

## Solution Options

### Option 1: Fix GitHub Billing (Recommended for CI/CD)

1. **Go to GitHub Settings:**
   - Click your profile picture → **Settings**
   - Or go to: `https://github.com/settings/billing`

2. **Check Billing Status:**
   - Look for any payment failures
   - Update your payment method if needed
   - Check spending limits

3. **For Free Accounts:**
   - GitHub provides **2,000 free minutes/month** for private repos
   - Public repos have **unlimited free minutes**
   - If you exceeded the limit, you need to:
     - Wait for the next billing cycle, OR
     - Upgrade to a paid plan

4. **For Private Repos:**
   - You need a paid GitHub plan or
   - Make the repo public (if possible)

### Option 2: Use Manual Deployment Scripts (No Billing Required)

I've created deployment scripts you can run manually on your server:

#### Quick Deploy Commands:

```bash
# On your server, navigate to the repo
cd /var/www/Trips-Adora

# Pull latest changes
git pull origin main

# Run deployment script for customer platform
sudo bash scripts/deploy-customer.sh

# Or for supplier platform
sudo bash scripts/deploy-supplier.sh

# Or for admin platform
sudo bash scripts/deploy-admin.sh
```

#### Make Scripts Executable:

```bash
# On your server
chmod +x /var/www/Trips-Adora/scripts/*.sh
```

### Option 3: Use GitHub Webhooks (Semi-Automated)

1. **Set up a webhook endpoint on your server** that receives GitHub push events
2. **The webhook triggers the deployment script** automatically
3. **No GitHub Actions billing required**

Example webhook setup:
```bash
# Install a simple webhook server (e.g., webhook)
# When GitHub sends a push event, it runs deploy-customer.sh
```

### Option 4: Use Self-Hosted Runners (Advanced)

1. Install GitHub Actions runner on your server
2. Configure workflows to use `runs-on: self-hosted`
3. No billing for self-hosted runner minutes

## Immediate Action: Manual Deployment

Since you've already pushed the changes, deploy manually:

```bash
# SSH into your server
ssh root@your-server-ip

# Navigate to repo
cd /var/www/Trips-Adora

# Pull latest code
git pull origin main

# Deploy customer platform
cd customer-platform/frontend
npm ci
npm run build
sudo cp -rv dist/* /var/www/tripsadora/customer/
sudo chown -R www-data:www-data /var/www/tripsadora/customer
sudo chmod -R 755 /var/www/tripsadora/customer

# Update backend
cd ../backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart customer-api.service

# Verify
sudo systemctl status customer-api.service
```

## Check Your GitHub Usage

1. Go to: `https://github.com/settings/billing`
2. Click **"Actions and Packages"** tab
3. See your current usage vs. limits

## Recommendation

**For now:** Use the manual deployment scripts until billing is fixed.

**Long-term:** 
- If repo is private → Fix billing or make it public
- If repo is public → Check why it's using paid minutes
- Consider self-hosted runners for unlimited deployments

