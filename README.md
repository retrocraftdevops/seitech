# Seitech E-Learning Platform

Odoo 19.0 Enterprise based e-learning platform with custom modules.

## Project Structure

```
seitech/
├── docker-compose.yml      # Main Docker orchestration
├── docker-compose.dev.yml  # Development overrides
├── Dockerfile              # Custom Odoo image
├── .env                    # Environment configuration
├── requirements.txt        # Python dependencies
│
├── custom_addons/          # Seitech custom modules
│   ├── seitech_base/       # Base module
│   ├── seitech_website_theme/  # Website theme
│   └── seitech_elearning/  # E-learning platform
│
├── odoo/                   # Odoo 19.0 source (symlink)
├── enterprise/             # Enterprise addons (optional)
│
├── agent-os/               # Documentation & standards
├── config/                 # Odoo configuration
├── data/filestore/         # Odoo filestore
├── logs/                   # Application logs
├── backups/                # Database backups
│
└── scripts/
    ├── setup.sh            # Initial setup script
    ├── dev.sh              # Development commands
    └── entrypoint.sh       # Docker entrypoint
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- PostgreSQL 14+ (local installation)
- Odoo 19.0 Enterprise source

### Setup

1. **Clone and setup:**
   ```bash
   cd /home/rodrickmakore/projects/seitech
   ./scripts/setup.sh
   ```

2. **Create PostgreSQL user:**
   ```bash
   sudo -u postgres createuser -s odoo
   sudo -u postgres psql -c "ALTER USER odoo PASSWORD 'odoo';"
   sudo -u postgres createdb -O odoo seitech
   ```

3. **Build and start:**
   ```bash
   docker compose build
   docker compose up -d
   ```

4. **Access Odoo:**
   - URL: http://localhost:8069
   - Master Password: admin (change in .env)

### Development

```bash
# Start in development mode (with auto-reload)
./scripts/dev.sh start

# View logs
./scripts/dev.sh logs

# Update modules
./scripts/dev.sh update seitech_elearning

# Install modules
./scripts/dev.sh install seitech_base,seitech_website_theme,seitech_elearning

# Open Odoo shell
./scripts/dev.sh shell

# Backup database
./scripts/dev.sh backup

# Stop
./scripts/dev.sh stop
```

## Custom Modules

### seitech_base
Base module with common functionality and dependencies.

### seitech_website_theme
Modern website theme with:
- Teal/Cyan design system (#0284c7)
- Responsive layouts
- Reusable snippets (hero, features, testimonials)
- Mega menu navigation

### seitech_elearning
Comprehensive e-learning platform extending website_slides:
- Course enrollment system
- Certificate generation with QR verification
- Assignment submissions and grading
- Live class scheduling
- Instructor management
- Gamification (points, badges, leaderboards)

## Documentation

See `agent-os/` for:
- Development standards
- Module specifications
- Architecture documentation

## Deployment

See `custom_addons/DEPLOYMENT.md` for production deployment guide.

## License

LGPL-3 (Odoo compatible)

## Support

Seitech International
- Website: https://www.seitech.co.za
- Email: dev@seitech.co.za
