# GitHub Actions Workflow Troubleshooting

## Why Workflow Didn't Trigger After Making Repo Public

### Check 1: Workflows Must Be in Default Branch

**Problem:** Workflow files must exist in your default branch (usually `main` or `master`).

**Solution:**
```bash
# Make sure you're on the default branch
git branch  # Check current branch

# If not on main/master, switch to it
git checkout main
git pull origin main

# Verify workflow files are there
ls -la .github/workflows/
```

### Check 2: Enable GitHub Actions in Repository Settings

**Problem:** GitHub Actions might be disabled for your repository.

**Solution:**
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Actions** → **General**
4. Under "Actions permissions":
   - Select **"Allow all actions and reusable workflows"**
   - Or **"Allow local actions and reusable workflows"**
5. Click **Save**

### Check 3: Verify Workflow File Syntax

**Problem:** YAML syntax errors prevent workflows from being recognized.

**Solution:**
- Go to **Actions** tab in GitHub
- If you see "No workflow runs found", the workflow files might not be recognized
- Check for YAML syntax errors (indentation, colons, etc.)

### Check 4: Check Branch Name

**Problem:** Workflow triggers on `main` or `master`, but you might be pushing to a different branch.

**Solution:**
```bash
# Check which branch you're on
git branch

# Make sure you're pushing to main/master
git push origin main  # or master
```

### Check 5: Path Filters

**Problem:** The workflow only triggers when files in `customer-platform/**` change.

**Solution:**
- Make sure you're changing files inside `customer-platform/` directory
- Or remove the `paths` filter temporarily to test

### Check 6: Manual Trigger Test

**Solution:** Try manually triggering the workflow:

1. Go to **Actions** tab in GitHub
2. Select **"Deploy Customer Platform"** workflow
3. Click **"Run workflow"** button
4. Select branch and click **"Run workflow"**

If this works, the workflow is set up correctly but push triggers might be disabled.

## Quick Fix: Test Workflow Manually

1. **Go to GitHub → Actions tab**
2. **Select "Deploy Customer Platform"**
3. **Click "Run workflow"**
4. **Select your branch (main/master)**
5. **Click "Run workflow"**

This will help you determine if:
- ✅ Workflow is valid (runs successfully)
- ❌ Workflow has errors (check logs)
- ❌ Workflow doesn't exist (check if file is in correct branch)

## Enable Workflow Logs

If workflows ran but didn't show up:
1. Go to **Settings** → **Actions** → **General**
2. Scroll to **"Workflow permissions"**
3. Select **"Read and write permissions"**
4. Enable **"Allow GitHub Actions to create and approve pull requests"**
5. Click **Save**

## Force Re-recognition of Workflows

Sometimes GitHub needs a push to recognize workflows:

```bash
# Make a small change to trigger recognition
echo "# Workflow test" >> README.md
git add README.md
git commit -m "Trigger workflow recognition"
git push origin main

# Or touch the workflow file
touch .github/workflows/deploy-customer.yml
git add .github/workflows/deploy-customer.yml
git commit -m "Update workflow file"
git push origin main
```

## Verify Workflow File Location

Workflow files MUST be in:
```
.github/workflows/*.yml
```

NOT in:
- `.github/workflows/` (with different extension)
- `.github/` (root level)
- Any other location

## Check Repository Settings

1. **Settings** → **Actions** → **General**
2. **Workflow permissions**: Should be enabled
3. **Actions and reusable workflows**: Should be allowed
4. **Artifact and log retention**: Can be default (90 days)

