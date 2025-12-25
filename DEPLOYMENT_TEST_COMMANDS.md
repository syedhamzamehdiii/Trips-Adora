# Deployment Test Commands

## Step 1: Commit and Push Changes

```bash
# Check what files were changed
git status

# Add the changed files
git add customer-platform/frontend/src/components/HeroSection.jsx
git add customer-platform/frontend/src/pages/LandingPage.jsx

# Commit with a descriptive message
git commit -m "Test CI/CD: Update customer landing page"

# Push to main branch (this will trigger the deployment)
git push origin main
```

## Step 2: Monitor GitHub Actions

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. You should see a workflow run called **"Deploy Customer Platform"** starting
4. Click on it to see the deployment progress
5. Wait for it to complete (usually 2-5 minutes)

## Step 3: Verify Deployment on Server

SSH into your server and run these commands:

```bash
# SSH into your server
ssh root@your-server-ip

# Check if frontend files were updated
ls -la /var/www/tripsadora/customer/ | head -20

# Check the timestamp of index.html (should be recent)
stat /var/www/tripsadora/customer/index.html

# Verify the service is running
sudo systemctl status customer-api.service --no-pager | head -15

# Check recent deployment logs
sudo journalctl -u customer-api.service -n 20 --no-pager
```

## Step 4: Verify on Website

1. Open your browser and go to: `https://tripsadora.com`
2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R) to clear cache
3. Scroll to the hero section
4. You should see the rocket emoji (🚀) at the end of the tagline: "Start exploring the world and create stories worth telling. 🚀"

## Step 5: Check GitHub Actions Logs

If deployment fails, check the logs:

1. Go to **Actions** tab in GitHub
2. Click on the failed workflow run
3. Expand each step to see error messages
4. Common issues:
   - SSH connection failed → Check SERVER_HOST and SERVER_SSH_KEY secrets
   - Permission denied → Check if SSH user has sudo access
   - Service not found → Verify systemd service name matches

## Troubleshooting Commands

```bash
# On server: Check if files were deployed
cd /var/www/tripsadora/customer
ls -la assets/ | head -10

# Check if backend was updated
cd /var/www/Trips-Adora/customer-platform/backend
git log -1  # If using git, or check file timestamps

# Restart service manually if needed
sudo systemctl restart customer-api.service

# Check Nginx is serving the correct directory
sudo nginx -t
sudo systemctl reload nginx

# View real-time service logs
sudo journalctl -u customer-api.service -f
```

## Success Indicators

✅ **Deployment Successful if:**
- GitHub Actions shows green checkmark
- Frontend files in `/var/www/tripsadora/customer/` have recent timestamps
- Service status shows "active (running)"
- Website shows the rocket emoji in hero section
- No errors in browser console

❌ **Deployment Failed if:**
- GitHub Actions shows red X
- Frontend files are old
- Service is not running
- Website shows old content even after hard refresh

