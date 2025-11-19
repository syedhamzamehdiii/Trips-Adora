# Backend Scripts

Utility scripts for database maintenance and migrations.

## Update Products to Published

### Script: `update_products_to_published.py`

This script updates all existing products (draft, pending_review, etc.) to published status so they become visible to customers globally.

**When to use:**
- After implementing auto-publish feature
- To make existing products visible to customers
- When you need to bulk update product status

**Usage:**

```bash
# From the backend directory
python scripts/update_products_to_published.py

# Or as a module
python -m scripts.update_products_to_published
```

**What it does:**
- Connects to the MongoDB database
- Finds all products that are not already published
- Updates their status to `published`
- Sets `published_at` timestamp to current time
- Updates `updated_at` timestamp

**Output:**
- Shows count of products found
- Lists each product being updated
- Confirms successful completion

**Note:** This script is safe to run multiple times - it only updates products that are not already published.


