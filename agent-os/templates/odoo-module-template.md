# Odoo Module Template

Template for creating new Seitech Odoo modules.

## Module Structure

```
module_name/
├── __manifest__.py
├── __init__.py
├── models/
│   ├── __init__.py
│   └── model_name.py
├── views/
│   ├── model_views.xml
│   └── menus.xml
├── security/
│   ├── ir.model.access.csv
│   └── record_rules.xml
├── data/
│   └── data.xml
├── controllers/
│   ├── __init__.py
│   └── main.py
├── static/
│   ├── description/
│   │   └── icon.png
│   └── src/
│       ├── scss/
│       ├── js/
│       └── xml/
└── tests/
    ├── __init__.py
    └── test_model.py
```

## __manifest__.py

```python
{
    'name': 'Module Name',
    'version': '19.0.1.0.0',
    'category': 'Seitech/Category',
    'summary': 'Short description of the module',
    'description': """
        Module Name
        ===========

        Detailed description of module functionality.

        Features:
        - Feature 1
        - Feature 2
        - Feature 3
    """,
    'author': 'Seitech International',
    'website': 'https://www.seitech.co.za',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'web',
        'seitech_base',
    ],
    'data': [
        'security/ir.model.access.csv',
        'security/record_rules.xml',
        'data/data.xml',
        'views/model_views.xml',
        'views/menus.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'module_name/static/src/scss/backend.scss',
            'module_name/static/src/js/backend.js',
        ],
        'web.assets_frontend': [
            'module_name/static/src/scss/frontend.scss',
            'module_name/static/src/js/frontend.js',
        ],
    },
    'demo': [],
    'installable': True,
    'application': False,
    'auto_install': False,
}
```

## __init__.py (Root)

```python
from . import models
from . import controllers
```

## models/__init__.py

```python
from . import model_name
```

## models/model_name.py

```python
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

import logging

_logger = logging.getLogger(__name__)


class ModelName(models.Model):
    _name = 'module.model'
    _description = 'Model Description'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, id'
    _rec_name = 'name'

    # -------------------------------------------------------------------------
    # FIELDS
    # -------------------------------------------------------------------------

    name = fields.Char(
        string='Name',
        required=True,
        tracking=True,
    )
    description = fields.Text(string='Description')
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)

    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('done', 'Done'),
    ], string='Status', default='draft', tracking=True)

    # Relational
    partner_id = fields.Many2one(
        'res.partner',
        string='Partner',
        ondelete='restrict',
    )
    line_ids = fields.One2many(
        'module.model.line',
        'parent_id',
        string='Lines',
    )
    company_id = fields.Many2one(
        'res.company',
        string='Company',
        default=lambda self: self.env.company,
    )

    # Computed
    line_count = fields.Integer(
        compute='_compute_line_count',
        string='Line Count',
    )

    # -------------------------------------------------------------------------
    # SQL CONSTRAINTS
    # -------------------------------------------------------------------------

    _sql_constraints = [
        ('name_uniq', 'unique(name, company_id)', 'Name must be unique per company!'),
    ]

    # -------------------------------------------------------------------------
    # COMPUTE METHODS
    # -------------------------------------------------------------------------

    @api.depends('line_ids')
    def _compute_line_count(self):
        for record in self:
            record.line_count = len(record.line_ids)

    # -------------------------------------------------------------------------
    # CONSTRAINS METHODS
    # -------------------------------------------------------------------------

    @api.constrains('name')
    def _check_name(self):
        for record in self:
            if record.name and len(record.name) < 3:
                raise ValidationError(_("Name must be at least 3 characters."))

    # -------------------------------------------------------------------------
    # CRUD METHODS
    # -------------------------------------------------------------------------

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('name'):
                vals['name'] = self.env['ir.sequence'].next_by_code('module.model')
        return super().create(vals_list)

    def write(self, vals):
        if 'state' in vals:
            self._validate_state_change(vals['state'])
        return super().write(vals)

    def unlink(self):
        if any(record.state == 'done' for record in self):
            raise UserError(_("Cannot delete completed records."))
        return super().unlink()

    # -------------------------------------------------------------------------
    # ACTION METHODS
    # -------------------------------------------------------------------------

    def action_activate(self):
        """Activate the record."""
        self.ensure_one()
        if self.state != 'draft':
            raise UserError(_("Only draft records can be activated."))
        self.write({'state': 'active'})
        self.message_post(body=_("Record activated."))
        return True

    def action_done(self):
        """Mark record as done."""
        for record in self:
            record.write({'state': 'done'})
            record.message_post(body=_("Record completed."))
        return True

    def action_view_lines(self):
        """Open lines in a new view."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Lines'),
            'res_model': 'module.model.line',
            'view_mode': 'tree,form',
            'domain': [('parent_id', '=', self.id)],
            'context': {'default_parent_id': self.id},
        }

    # -------------------------------------------------------------------------
    # BUSINESS METHODS
    # -------------------------------------------------------------------------

    def _validate_state_change(self, new_state):
        """Validate state transitions."""
        valid_transitions = {
            'draft': ['active'],
            'active': ['done', 'draft'],
            'done': [],
        }
        for record in self:
            if new_state not in valid_transitions.get(record.state, []):
                raise UserError(_(
                    "Cannot change state from %(old)s to %(new)s.",
                    old=record.state,
                    new=new_state,
                ))
```

## views/model_views.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="0">

        <!-- Form View -->
        <record id="module_model_view_form" model="ir.ui.view">
            <field name="name">module.model.form</field>
            <field name="model">module.model</field>
            <field name="arch" type="xml">
                <form string="Model">
                    <header>
                        <button name="action_activate" type="object"
                                string="Activate" class="btn-primary"
                                invisible="state != 'draft'"/>
                        <button name="action_done" type="object"
                                string="Complete"
                                invisible="state != 'active'"/>
                        <field name="state" widget="statusbar"
                               statusbar_visible="draft,active,done"/>
                    </header>
                    <sheet>
                        <div class="oe_button_box" name="button_box">
                            <button name="action_view_lines" type="object"
                                    class="oe_stat_button" icon="fa-list">
                                <field name="line_count" widget="statinfo"
                                       string="Lines"/>
                            </button>
                        </div>
                        <widget name="web_ribbon" title="Archived"
                                bg_color="bg-danger" invisible="active"/>
                        <div class="oe_title">
                            <h1>
                                <field name="name" placeholder="Name"/>
                            </h1>
                        </div>
                        <group>
                            <group>
                                <field name="partner_id"/>
                            </group>
                            <group>
                                <field name="company_id" groups="base.group_multi_company"/>
                                <field name="active" invisible="1"/>
                            </group>
                        </group>
                        <notebook>
                            <page string="Lines" name="lines">
                                <field name="line_ids">
                                    <tree editable="bottom">
                                        <field name="sequence" widget="handle"/>
                                        <field name="name"/>
                                    </tree>
                                </field>
                            </page>
                            <page string="Description" name="description">
                                <field name="description"/>
                            </page>
                        </notebook>
                    </sheet>
                    <chatter/>
                </form>
            </field>
        </record>

        <!-- Tree View -->
        <record id="module_model_view_tree" model="ir.ui.view">
            <field name="name">module.model.tree</field>
            <field name="model">module.model</field>
            <field name="arch" type="xml">
                <tree string="Models">
                    <field name="sequence" widget="handle"/>
                    <field name="name"/>
                    <field name="partner_id"/>
                    <field name="state" widget="badge"
                           decoration-info="state == 'draft'"
                           decoration-warning="state == 'active'"
                           decoration-success="state == 'done'"/>
                    <field name="company_id" groups="base.group_multi_company"/>
                </tree>
            </field>
        </record>

        <!-- Search View -->
        <record id="module_model_view_search" model="ir.ui.view">
            <field name="name">module.model.search</field>
            <field name="model">module.model</field>
            <field name="arch" type="xml">
                <search string="Search">
                    <field name="name"/>
                    <field name="partner_id"/>
                    <separator/>
                    <filter string="Draft" name="draft" domain="[('state', '=', 'draft')]"/>
                    <filter string="Active" name="active_state" domain="[('state', '=', 'active')]"/>
                    <filter string="Done" name="done" domain="[('state', '=', 'done')]"/>
                    <separator/>
                    <filter string="Archived" name="inactive" domain="[('active', '=', False)]"/>
                    <group expand="0" string="Group By">
                        <filter string="Partner" name="group_partner" context="{'group_by': 'partner_id'}"/>
                        <filter string="State" name="group_state" context="{'group_by': 'state'}"/>
                    </group>
                </search>
            </field>
        </record>

        <!-- Action -->
        <record id="module_model_action" model="ir.actions.act_window">
            <field name="name">Models</field>
            <field name="res_model">module.model</field>
            <field name="view_mode">tree,form</field>
            <field name="search_view_id" ref="module_model_view_search"/>
            <field name="context">{'search_default_active_state': 1}</field>
            <field name="help" type="html">
                <p class="o_view_nocontent_smiling_face">
                    Create your first record
                </p>
            </field>
        </record>

    </data>
</odoo>
```

## security/ir.model.access.csv

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_module_model_user,module.model.user,model_module_model,base.group_user,1,1,1,0
access_module_model_manager,module.model.manager,model_module_model,base.group_system,1,1,1,1
```

## tests/test_model.py

```python
from odoo.tests.common import TransactionCase
from odoo.exceptions import ValidationError, UserError


class TestModuleModel(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.partner = cls.env['res.partner'].create({'name': 'Test Partner'})
        cls.model = cls.env['module.model'].create({
            'name': 'Test Record',
            'partner_id': cls.partner.id,
        })

    def test_create(self):
        """Test record creation."""
        self.assertTrue(self.model.exists())
        self.assertEqual(self.model.state, 'draft')

    def test_activate(self):
        """Test activation workflow."""
        self.model.action_activate()
        self.assertEqual(self.model.state, 'active')

    def test_complete(self):
        """Test completion workflow."""
        self.model.action_activate()
        self.model.action_done()
        self.assertEqual(self.model.state, 'done')

    def test_cannot_delete_done(self):
        """Test that done records cannot be deleted."""
        self.model.action_activate()
        self.model.action_done()
        with self.assertRaises(UserError):
            self.model.unlink()
```

## Usage

1. Copy this template to `/custom_addons/your_module_name/`
2. Rename all files and references
3. Update `__manifest__.py` with your module info
4. Implement your models and views
5. Add security rules
6. Write tests
7. Install and test
