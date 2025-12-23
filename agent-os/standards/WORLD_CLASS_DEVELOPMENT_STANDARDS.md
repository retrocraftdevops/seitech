# World-Class Development Standards

Seitech International development standards for Odoo module development.

## Core Principles

### 1. Code Quality
- **PEP 8 Compliance**: All Python code must follow PEP 8
- **Odoo Guidelines**: Follow official Odoo development guidelines
- **Clean Code**: Self-documenting, minimal complexity, DRY
- **Type Hints**: Use Python type hints where beneficial

### 2. Security First
- **OWASP Top 10**: Guard against common vulnerabilities
- **Access Rights**: Proper ir.model.access.csv for all models
- **Record Rules**: Row-level security via record rules
- **Input Validation**: Validate all user inputs
- **SQL Injection Prevention**: Use ORM methods, never raw SQL

### 3. Performance
- **Query Optimization**: Avoid N+1 queries
- **Prefetching**: Use prefetch_related and mapped()
- **Caching**: Implement caching where appropriate
- **Lazy Loading**: Load data only when needed
- **Database Indexing**: Index frequently queried fields

### 4. Maintainability
- **Modular Design**: Small, focused modules
- **Clear Naming**: Descriptive model, field, and method names
- **Documentation**: Docstrings for all public methods
- **Version Control**: Semantic versioning (MAJOR.MINOR.PATCH)

### 5. Testing
- **Unit Tests**: Test all business logic
- **Integration Tests**: Test controller endpoints
- **UI Tests**: Test critical user flows
- **Coverage**: Aim for 80%+ code coverage

## Odoo-Specific Standards

### Model Development
```python
from odoo import models, fields, api

class MyModel(models.Model):
    _name = 'my.model'
    _description = 'My Model Description'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, id'

    # Fields with proper ordering: char, text, integer, float, boolean, date, selection, relational
    name = fields.Char(string='Name', required=True, tracking=True)
    description = fields.Text(string='Description')
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('done', 'Done'),
    ], default='draft', tracking=True)

    # Relational fields
    partner_id = fields.Many2one('res.partner', string='Partner')
    line_ids = fields.One2many('my.model.line', 'parent_id', string='Lines')

    # Computed fields
    total = fields.Float(compute='_compute_total', store=True)

    @api.depends('line_ids.amount')
    def _compute_total(self):
        for record in self:
            record.total = sum(record.line_ids.mapped('amount'))

    # Constraints
    @api.constrains('name')
    def _check_name(self):
        for record in self:
            if not record.name or len(record.name) < 3:
                raise ValidationError(_("Name must be at least 3 characters"))
```

### XML Views
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Always include noupdate="0" or "1" appropriately -->
    <data noupdate="0">

        <!-- Form View -->
        <record id="my_model_view_form" model="ir.ui.view">
            <field name="name">my.model.form</field>
            <field name="model">my.model</field>
            <field name="arch" type="xml">
                <form string="My Model">
                    <header>
                        <button name="action_confirm" type="object" string="Confirm"
                                class="btn-primary" invisible="state != 'draft'"/>
                        <field name="state" widget="statusbar"/>
                    </header>
                    <sheet>
                        <group>
                            <group>
                                <field name="name"/>
                                <field name="partner_id"/>
                            </group>
                            <group>
                                <field name="active"/>
                                <field name="total"/>
                            </group>
                        </group>
                        <notebook>
                            <page string="Lines">
                                <field name="line_ids"/>
                            </page>
                        </notebook>
                    </sheet>
                    <chatter/>
                </form>
            </field>
        </record>

    </data>
</odoo>
```

### Security Files

**ir.model.access.csv**:
```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_my_model_user,my.model.user,model_my_model,base.group_user,1,1,1,0
access_my_model_manager,my.model.manager,model_my_model,base.group_system,1,1,1,1
```

**record_rules.xml**:
```xml
<odoo>
    <data noupdate="1">
        <record id="my_model_rule_user" model="ir.rule">
            <field name="name">My Model: User Own Records</field>
            <field name="model_id" ref="model_my_model"/>
            <field name="domain_force">[('create_uid', '=', user.id)]</field>
            <field name="groups" eval="[(4, ref('base.group_user'))]"/>
            <field name="perm_read" eval="True"/>
            <field name="perm_write" eval="True"/>
            <field name="perm_create" eval="True"/>
            <field name="perm_unlink" eval="False"/>
        </record>
    </data>
</odoo>
```

## File Naming Conventions

| File Type | Convention | Example |
|-----------|------------|---------|
| Models | `model_name.py` | `slide_channel.py` |
| Views | `model_views.xml` | `course_views.xml` |
| Templates | `template_name.xml` | `homepage.xml` |
| SCSS | `_component.scss` | `_buttons.scss` |
| JavaScript | `component_name.js` | `course_player.js` |

## Commit Messages

Format: `[MODULE] type: description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Adding tests
- `style`: Formatting, no code change

Example: `[seitech_elearning] feat: add certificate generation`

## Code Review Checklist

- [ ] Follows PEP 8 and Odoo guidelines
- [ ] Security rules implemented
- [ ] No hardcoded strings (use _() for translations)
- [ ] Error handling in place
- [ ] Tests included
- [ ] Documentation updated
- [ ] No commented-out code
- [ ] No debug statements
