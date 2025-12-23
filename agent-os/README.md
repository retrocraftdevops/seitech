# Seitech International - Agent-OS

Enterprise development framework for Seitech International's Odoo migration project.

## Overview

This agent-os structure provides standards, specifications, and templates for developing:
- **Website Theme Module** - Custom Odoo website theme with modern design
- **E-Learning Module** - Comprehensive LMS extension for Odoo

## Directory Structure

```
agent-os/
├── README.md              # This file
├── config.yml             # Project configuration
├── standards/             # Development standards
│   ├── WORLD_CLASS_DEVELOPMENT_STANDARDS.md
│   ├── odoo/              # Odoo-specific standards
│   ├── frontend/          # Frontend standards
│   └── testing/           # Testing standards
├── specs/                 # Module specifications
│   ├── website-theme-module/
│   └── elearning-module/
└── templates/             # Reusable templates
```

## Project Context

**Source**: PHP CodeIgniter e-learning platform
**Target**: Odoo 19.0 Enterprise
**Design Theme**: Modern enterprise (Teal/Cyan primary)

## Quick Links

- [Development Standards](standards/WORLD_CLASS_DEVELOPMENT_STANDARDS.md)
- [Website Theme Spec](specs/website-theme-module/spec.md)
- [E-Learning Spec](specs/elearning-module/spec.md)
- [Module Template](templates/odoo-module-template.md)

## Getting Started

1. Review the development standards
2. Read the module specifications
3. Use the templates for consistency
4. Follow Odoo best practices

## Related Resources

- Odoo 19.0 Documentation: https://www.odoo.com/documentation/19.0/
- Design Theme Reference: `/ensemble/apps/website/DESIGN_THEME_DESCRIPTION.md`
- Original Prompt: `/seitech/CLAUDE_PROMPT_ODOO_MIGRATION.md`
