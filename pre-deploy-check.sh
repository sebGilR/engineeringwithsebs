#!/bin/bash

# Pre-deployment check script
# Verifies that everything is ready before deploying to Vercel

set -e

echo "======================================"
echo "  Pre-Deployment Checklist           "
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗${NC} Not in engineeringwithsebs directory"
    exit 1
fi

echo -e "${GREEN}✓${NC} In correct directory"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Dependencies not installed - run: npm install"
fi

# Check if build works
echo ""
echo "Checking if build succeeds..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build succeeds"
    # Clean up build
    rm -rf .next
else
    echo -e "${RED}✗${NC} Build fails - fix errors before deploying"
    ERRORS=$((ERRORS + 1))
fi

# Check TypeScript
echo ""
echo "Checking TypeScript..."
if npm run typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript checks pass"
else
    echo -e "${YELLOW}⚠${NC} TypeScript errors found - consider fixing before deploy"
fi

# Check if vercel.json exists
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC} vercel.json configured"
else
    echo -e "${RED}✗${NC} vercel.json missing"
    ERRORS=$((ERRORS + 1))
fi

# Check .env.local.example
if [ -f ".env.local.example" ]; then
    echo -e "${GREEN}✓${NC} .env.local.example exists"
else
    echo -e "${YELLOW}⚠${NC} .env.local.example missing"
fi

# Check git status
echo ""
echo "Checking git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${GREEN}✓${NC} No uncommitted changes"
    else
        echo -e "${YELLOW}⚠${NC} Uncommitted changes detected"
        echo "   Consider committing before deploying"
    fi

    # Check if on main branch
    BRANCH=$(git branch --show-current)
    if [ "$BRANCH" = "main" ]; then
        echo -e "${GREEN}✓${NC} On main branch"
    else
        echo -e "${YELLOW}⚠${NC} On branch: $BRANCH (Vercel will deploy from main by default)"
    fi
else
    echo -e "${RED}✗${NC} Not a git repository"
    ERRORS=$((ERRORS + 1))
fi

# Check backend
echo ""
echo "Checking backend (Fly.io)..."
BACKEND_URL="https://baas-dry-sun-7571.fly.dev/up"
if curl -s -f "$BACKEND_URL" > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend is accessible: $BACKEND_URL"
else
    echo -e "${RED}✗${NC} Backend is not accessible - deploy backend first"
    ERRORS=$((ERRORS + 1))
fi

# Check if Vercel CLI is installed
echo ""
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel -v)
    echo -e "${GREEN}✓${NC} Vercel CLI installed: $VERCEL_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Vercel CLI not installed (optional)"
    echo "   Install with: npm i -g vercel"
fi

# Summary
echo ""
echo "======================================"
echo "  Summary                             "
echo "======================================"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "You're ready to deploy!"
    echo ""
    echo "Next steps:"
    echo "  1. Review: DEPLOYMENT_SUMMARY.md"
    echo "  2. Quick deploy: QUICK_DEPLOY.md"
    echo "  3. Full checklist: DEPLOYMENT_CHECKLIST.md"
    echo ""
    echo "Deploy with:"
    echo "  • Vercel Dashboard: https://vercel.com/new"
    echo "  • Vercel CLI: vercel --prod"
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    echo ""
    echo "Fix the errors above before deploying."
fi

echo ""
