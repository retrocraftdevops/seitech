# QWeb Template Standards

Standards for Odoo QWeb templates (website and portal).

## Template Structure

### Basic Page Template

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <template id="page_name" name="Page Display Name">
        <t t-call="website.layout">
            <t t-set="pageName" t-value="'page_name'"/>
            <t t-set="additional_title">Page Title</t>

            <div id="wrap" class="oe_structure">
                <!-- Page content here -->
            </div>
        </t>
    </template>
</odoo>
```

### Section Pattern

```xml
<section class="s_section_name pt-5 pb-5" data-snippet="s_section_name">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8 text-center mb-5">
                <h2 class="section-title">Section Title</h2>
                <p class="section-subtitle text-muted">
                    Description text for this section
                </p>
            </div>
        </div>
        <div class="row">
            <!-- Section content -->
        </div>
    </div>
</section>
```

## Control Structures

### Conditionals

```xml
<!-- If -->
<t t-if="condition">
    Content shown if true
</t>

<!-- If-Elif-Else -->
<t t-if="state == 'draft'">
    <span class="badge bg-secondary">Draft</span>
</t>
<t t-elif="state == 'active'">
    <span class="badge bg-success">Active</span>
</t>
<t t-else="">
    <span class="badge bg-primary">Other</span>
</t>

<!-- Attribute conditional -->
<div t-att-class="'active' if is_active else 'inactive'">Content</div>

<!-- Conditional attribute -->
<button t-attf-class="btn #{disabled and 'disabled' or ''}">Click</button>
```

### Loops

```xml
<!-- Basic loop -->
<t t-foreach="records" t-as="record">
    <div class="item">
        <span t-esc="record.name"/>
    </div>
</t>

<!-- Loop with index -->
<t t-foreach="items" t-as="item">
    <div t-attf-class="item-#{item_index}">
        <span>Item <t t-esc="item_index + 1"/> of <t t-esc="item_size"/></span>
        <t t-if="item_first">First item</t>
        <t t-if="item_last">Last item</t>
    </div>
</t>

<!-- Loop with enumerate -->
<ul>
    <t t-foreach="enumerate(records)" t-as="enum">
        <li>
            <t t-set="index" t-value="enum[0]"/>
            <t t-set="record" t-value="enum[1]"/>
            <span t-esc="index"/>: <span t-esc="record.name"/>
        </li>
    </t>
</ul>
```

## Output Escaping

```xml
<!-- Escaped output (SAFE - default for security) -->
<span t-esc="user_input"/>
<span t-out="user_input"/>  <!-- Odoo 15+ preferred -->

<!-- Field output (automatic escaping) -->
<span t-field="record.name"/>

<!-- Raw HTML output (ONLY for trusted/sanitized content) -->
<div t-raw="sanitized_html"/>
<div t-out="sanitized_html" t-options="{'widget': 'html'}"/>

<!-- Format options -->
<span t-field="record.date" t-options="{'format': 'MMMM d, yyyy'}"/>
<span t-field="record.amount" t-options="{'widget': 'monetary', 'display_currency': record.currency_id}"/>
```

## Dynamic Attributes

```xml
<!-- Set attribute -->
<div t-att-id="'record-' + str(record.id)">Content</div>

<!-- Format attribute -->
<a t-attf-href="/course/#{record.id}">View Course</a>

<!-- Class conditions -->
<div t-attf-class="card #{record.is_featured and 'featured' or ''}">Card</div>

<!-- Multiple attributes -->
<input type="text"
       t-att-name="field_name"
       t-att-value="field_value"
       t-att-placeholder="placeholder_text"
       t-att-disabled="is_disabled or None"/>
```

## Template Inheritance

### Extending Templates

```xml
<!-- Add content to existing template -->
<template id="course_card_extend" inherit_id="seitech_elearning.course_card">
    <xpath expr="//div[@class='card-body']" position="inside">
        <span class="badge bg-primary" t-if="course.is_new">New</span>
    </xpath>
</template>

<!-- Replace content -->
<template id="header_override" inherit_id="website.layout">
    <xpath expr="//header" position="replace">
        <header class="custom-header">
            <!-- New header content -->
        </header>
    </xpath>
</template>

<!-- Add before/after -->
<template id="add_section" inherit_id="seitech_website.homepage">
    <xpath expr="//section[@id='features']" position="before">
        <section id="intro" class="s_intro">
            <!-- Intro section -->
        </section>
    </xpath>
</template>
```

### XPath Expressions

| Expression | Description |
|------------|-------------|
| `//div[@id='wrap']` | Div with specific ID |
| `//div[@class='container']` | Div with specific class |
| `//t[@t-foreach]` | T element with attribute |
| `//div[1]` | First div |
| `//div[last()]` | Last div |
| `//section[@id='hero']/div` | Child of section |

### Position Values

| Position | Effect |
|----------|--------|
| `inside` | Add as last child |
| `before` | Add before element |
| `after` | Add after element |
| `replace` | Replace element |
| `attributes` | Modify attributes |

## Reusable Components

### Define a Component

```xml
<!-- Component definition -->
<template id="course_card" name="Course Card Component">
    <div class="card h-100 course-card">
        <t t-if="course.image">
            <img t-att-src="'/web/image/slide.channel/%s/image_256' % course.id"
                 class="card-img-top" t-att-alt="course.name"/>
        </t>
        <div class="card-body">
            <h5 class="card-title" t-esc="course.name"/>
            <p class="card-text text-muted" t-esc="course.description[:100] + '...'"/>
            <div class="d-flex justify-content-between align-items-center">
                <span class="badge bg-primary" t-esc="course.slide_category"/>
                <span class="text-muted small">
                    <i class="fa fa-clock-o"/> <t t-esc="course.total_time"/> hrs
                </span>
            </div>
        </div>
        <div class="card-footer">
            <a t-attf-href="/courses/#{course.id}" class="btn btn-primary w-100">
                View Course
            </a>
        </div>
    </div>
</template>
```

### Use Component

```xml
<template id="course_listing">
    <t t-call="website.layout">
        <div class="container py-5">
            <div class="row">
                <t t-foreach="courses" t-as="course">
                    <div class="col-lg-4 col-md-6 mb-4">
                        <t t-call="seitech_elearning.course_card">
                            <t t-set="course" t-value="course"/>
                        </t>
                    </div>
                </t>
            </div>
        </div>
    </t>
</template>
```

## Forms

```xml
<form action="/submit" method="post" class="o_website_form">
    <input type="hidden" name="csrf_token" t-att-value="request.csrf_token()"/>

    <div class="mb-3">
        <label for="name" class="form-label">Name *</label>
        <input type="text" name="name" id="name" class="form-control" required="required"/>
    </div>

    <div class="mb-3">
        <label for="email" class="form-label">Email *</label>
        <input type="email" name="email" id="email" class="form-control" required="required"/>
    </div>

    <div class="mb-3">
        <label for="course_id" class="form-label">Select Course</label>
        <select name="course_id" id="course_id" class="form-select">
            <option value="">Choose...</option>
            <t t-foreach="courses" t-as="course">
                <option t-att-value="course.id" t-esc="course.name"/>
            </t>
        </select>
    </div>

    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

## Best Practices

1. **Use t-out instead of t-esc**: Modern Odoo (15+)
2. **Escape user input**: Always use t-esc/t-out for user data
3. **Use t-field for model data**: Automatic formatting and translation
4. **Keep templates focused**: One purpose per template
5. **Use meaningful IDs**: `module.template_purpose`
6. **Test responsive**: Check all breakpoints
7. **Optimize loops**: Avoid complex computations in loops
8. **Cache templates**: Use `t-cache` for expensive sections
