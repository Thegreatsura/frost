#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FROST_DIR="/opt/frost"
FROST_REPO="https://github.com/elitan/frost.git"

echo -e "${GREEN}Frost Installation Script${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root (sudo)${NC}"
  exit 1
fi

# Check if Linux
if [ "$(uname)" != "Linux" ]; then
  echo -e "${RED}This script only supports Linux${NC}"
  exit 1
fi

# Prompt for configuration
echo -e "${YELLOW}Configuration${NC}"
read -p "Domain (e.g. frost.example.com): " FROST_DOMAIN
read -p "Email (for SSL certificates): " FROST_EMAIL
read -s -p "Admin password (min 8 chars): " FROST_PASSWORD
echo ""

if [ ${#FROST_PASSWORD} -lt 8 ]; then
  echo -e "${RED}Password must be at least 8 characters${NC}"
  exit 1
fi

# Generate JWT secret
FROST_JWT_SECRET=$(openssl rand -base64 32)

echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
else
  echo "Docker already installed"
fi

# Install Caddy if not present
if ! command -v caddy &> /dev/null; then
  echo "Installing Caddy..."
  apt-get update
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  apt-get install -y caddy
else
  echo "Caddy already installed"
fi

# Install Bun if not present
if ! command -v bun &> /dev/null; then
  echo "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
else
  echo "Bun already installed"
fi

# Ensure bun is in PATH for this script
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

echo ""
echo -e "${YELLOW}Setting up Frost...${NC}"

# Clone or update Frost
if [ -d "$FROST_DIR" ]; then
  echo "Updating existing Frost installation..."
  cd "$FROST_DIR"
  git pull origin main
else
  echo "Cloning Frost..."
  git clone "$FROST_REPO" "$FROST_DIR"
  cd "$FROST_DIR"
fi

# Create .env file
cat > "$FROST_DIR/.env" << EOF
FROST_DOMAIN=$FROST_DOMAIN
FROST_EMAIL=$FROST_EMAIL
FROST_JWT_SECRET=$FROST_JWT_SECRET
NODE_ENV=production
EOF

# Install dependencies and build
echo "Installing dependencies..."
bun install

echo "Building..."
bun run build

# Run setup to set admin password
echo "Setting admin password..."
bun run setup "$FROST_PASSWORD"

# Configure Caddy
echo ""
echo -e "${YELLOW}Configuring Caddy...${NC}"

cat > /etc/caddy/Caddyfile << EOF
$FROST_DOMAIN {
    reverse_proxy localhost:3000
}
EOF

# Create systemd service
echo ""
echo -e "${YELLOW}Creating systemd service...${NC}"

cat > /etc/systemd/system/frost.service << EOF
[Unit]
Description=Frost
After=network.target docker.service

[Service]
Type=simple
WorkingDirectory=$FROST_DIR
ExecStart=$HOME/.bun/bin/bun run start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start services
systemctl daemon-reload
systemctl enable frost
systemctl restart frost
systemctl reload caddy

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo -e "Frost is now running at: ${GREEN}https://$FROST_DOMAIN${NC}"
echo ""
echo "Useful commands:"
echo "  systemctl status frost    - check status"
echo "  systemctl restart frost   - restart"
echo "  journalctl -u frost -f    - view logs"
echo "  /opt/frost/update.sh      - update to latest version"
