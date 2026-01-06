#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FROST_DIR="/opt/frost"

echo -e "${GREEN}Frost Update Script${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root (sudo)${NC}"
  exit 1
fi

# Check if Frost is installed
if [ ! -d "$FROST_DIR" ]; then
  echo -e "${RED}Frost not found at $FROST_DIR${NC}"
  echo "Run install.sh first"
  exit 1
fi

cd "$FROST_DIR"

# Ensure bun is in PATH
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

echo -e "${YELLOW}Stopping Frost...${NC}"
systemctl stop frost

echo -e "${YELLOW}Pulling latest changes...${NC}"
git pull origin main

echo -e "${YELLOW}Installing dependencies...${NC}"
bun install

echo -e "${YELLOW}Building...${NC}"
bun run build

echo -e "${YELLOW}Starting Frost...${NC}"
systemctl start frost

echo ""
echo -e "${GREEN}Update complete!${NC}"
echo ""
echo "Check status: systemctl status frost"
