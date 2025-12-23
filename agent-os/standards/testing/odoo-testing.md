# Odoo Testing Standards

Comprehensive testing guidelines for Seitech Odoo modules.

## Test Types

### 1. Unit Tests (Python)

Test individual model methods and business logic.

```python
# tests/test_enrollment.py

from odoo.tests.common import TransactionCase
from odoo.exceptions import ValidationError, UserError
from datetime import datetime, timedelta

class TestEnrollment(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Create test data
        cls.user = cls.env['res.users'].create({
            'name': 'Test Student',
            'login': 'test_student@example.com',
            'email': 'test_student@example.com',
        })
        cls.course = cls.env['slide.channel'].create({
            'name': 'Test Course',
            'is_published': True,
        })
        cls.instructor = cls.env['res.partner'].create({
            'name': 'Test Instructor',
            'is_instructor': True,
        })

    def test_enrollment_creation(self):
        """Test basic enrollment creation."""
        enrollment = self.env['seitech.enrollment'].create({
            'user_id': self.user.id,
            'course_id': self.course.id,
        })
        self.assertTrue(enrollment.exists())
        self.assertEqual(enrollment.state, 'active')
        self.assertEqual(enrollment.progress, 0)

    def test_enrollment_completion(self):
        """Test enrollment completion logic."""
        enrollment = self.env['seitech.enrollment'].create({
            'user_id': self.user.id,
            'course_id': self.course.id,
        })
        enrollment.update_progress(100)
        self.assertEqual(enrollment.state, 'completed')
        self.assertTrue(enrollment.completion_date)

    def test_enrollment_expiration(self):
        """Test enrollment expiration handling."""
        enrollment = self.env['seitech.enrollment'].create({
            'user_id': self.user.id,
            'course_id': self.course.id,
            'expiration_date': datetime.now() - timedelta(days=1),
        })
        enrollment._check_expiration()
        self.assertEqual(enrollment.state, 'expired')

    def test_duplicate_enrollment_prevention(self):
        """Test that duplicate enrollments are prevented."""
        self.env['seitech.enrollment'].create({
            'user_id': self.user.id,
            'course_id': self.course.id,
        })
        with self.assertRaises(ValidationError):
            self.env['seitech.enrollment'].create({
                'user_id': self.user.id,
                'course_id': self.course.id,
            })

    def test_enrollment_with_prerequisites(self):
        """Test enrollment with course prerequisites."""
        prereq_course = self.env['slide.channel'].create({
            'name': 'Prerequisite Course',
            'is_published': True,
        })
        self.course.write({
            'prerequisite_ids': [(4, prereq_course.id)],
        })
        with self.assertRaises(UserError):
            self.env['seitech.enrollment'].create({
                'user_id': self.user.id,
                'course_id': self.course.id,
            })

    def test_enrollment_access_rights(self):
        """Test enrollment access rights for different users."""
        enrollment = self.env['seitech.enrollment'].create({
            'user_id': self.user.id,
            'course_id': self.course.id,
        })
        # Test as the enrolled user
        enrollment_as_user = enrollment.with_user(self.user)
        self.assertTrue(enrollment_as_user.read(['progress']))

        # Test as another user (should fail)
        other_user = self.env['res.users'].create({
            'name': 'Other User',
            'login': 'other@example.com',
        })
        with self.assertRaises(Exception):
            enrollment.with_user(other_user).read(['progress'])
```

### 2. Integration Tests (Controllers)

Test HTTP controllers and API endpoints.

```python
# tests/test_controllers.py

from odoo.tests.common import HttpCase
import json

class TestCourseController(HttpCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.course = cls.env['slide.channel'].create({
            'name': 'Integration Test Course',
            'is_published': True,
        })

    def test_course_listing_page(self):
        """Test course listing page renders correctly."""
        response = self.url_open('/courses')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Integration Test Course', response.content)

    def test_course_detail_page(self):
        """Test course detail page."""
        response = self.url_open(f'/courses/{self.course.id}')
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.course.name.encode(), response.content)

    def test_enrollment_api(self):
        """Test enrollment API endpoint."""
        self.authenticate('admin', 'admin')
        response = self.url_open(
            '/api/course/enroll',
            data=json.dumps({'course_id': self.course.id}),
            headers={'Content-Type': 'application/json'},
        )
        self.assertEqual(response.status_code, 200)
        result = json.loads(response.content)
        self.assertTrue(result.get('success'))

    def test_progress_tracking_api(self):
        """Test progress tracking API."""
        self.authenticate('admin', 'admin')
        # First enroll
        self.url_open(
            '/api/course/enroll',
            data=json.dumps({'course_id': self.course.id}),
            headers={'Content-Type': 'application/json'},
        )
        # Update progress
        response = self.url_open(
            '/api/course/progress',
            data=json.dumps({
                'course_id': self.course.id,
                'progress': 50,
            }),
            headers={'Content-Type': 'application/json'},
        )
        self.assertEqual(response.status_code, 200)

    def test_unauthenticated_access(self):
        """Test that protected endpoints require authentication."""
        response = self.url_open(
            '/api/course/enroll',
            data=json.dumps({'course_id': self.course.id}),
            headers={'Content-Type': 'application/json'},
        )
        self.assertEqual(response.status_code, 403)
```

### 3. UI Tests (Tours)

Test user interface interactions.

```javascript
// static/tests/tours/enrollment_tour.js

odoo.define('seitech_elearning.tour_enrollment', function (require) {
    "use strict";

    const tour = require('web_tour.tour');

    tour.register('course_enrollment_tour', {
        test: true,
        url: '/courses',
    }, [
        // Step 1: Click on a course
        {
            trigger: '.course-card:first',
            content: "Click on a course to view details",
            run: 'click',
        },
        // Step 2: Click enroll button
        {
            trigger: '.btn-enroll',
            content: "Click the enroll button",
            run: 'click',
        },
        // Step 3: Confirm enrollment modal
        {
            trigger: '.modal .btn-primary',
            content: "Confirm enrollment",
            run: 'click',
        },
        // Step 4: Verify success message
        {
            trigger: '.alert-success:contains("Successfully enrolled")',
            content: "Verify enrollment success",
            run: function () {},  // Just check it exists
        },
        // Step 5: Navigate to my courses
        {
            trigger: 'a:contains("My Courses")',
            content: "Go to My Courses page",
            run: 'click',
        },
        // Step 6: Verify course appears
        {
            trigger: '.my-courses-list .course-item',
            content: "Verify course appears in my courses",
            run: function () {},
        },
    ]);

});
```

Register the tour in Python:

```python
# tests/test_ui.py

from odoo.tests import HttpCase, tagged

@tagged('post_install', '-at_install')
class TestEnrollmentTour(HttpCase):

    def test_course_enrollment_tour(self):
        """Test the complete enrollment flow via UI tour."""
        self.start_tour(
            '/courses',
            'course_enrollment_tour',
            login='admin',
        )
```

## Test Organization

### File Structure

```
tests/
├── __init__.py
├── common.py              # Shared test utilities
├── test_enrollment.py     # Enrollment model tests
├── test_certificate.py    # Certificate model tests
├── test_quiz.py           # Quiz model tests
├── test_controllers.py    # Controller tests
├── test_access_rights.py  # Security tests
└── test_ui.py             # UI tour tests
```

### Common Test Utilities

```python
# tests/common.py

from odoo.tests.common import TransactionCase

class SeitectElearningTestCase(TransactionCase):
    """Base test case with common setup for e-learning tests."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=True))

        # Create common test data
        cls.company = cls.env.ref('base.main_company')

        # Test users
        cls.student = cls._create_user('student', 'seitech_elearning.group_student')
        cls.instructor = cls._create_user('instructor', 'seitech_elearning.group_instructor')
        cls.manager = cls._create_user('manager', 'seitech_elearning.group_manager')

        # Test course
        cls.course = cls.env['slide.channel'].create({
            'name': 'Test Course',
            'is_published': True,
            'instructor_id': cls.instructor.partner_id.id,
        })

        # Test lessons
        cls.lesson = cls.env['slide.slide'].create({
            'name': 'Test Lesson',
            'channel_id': cls.course.id,
            'slide_type': 'video',
        })

    @classmethod
    def _create_user(cls, login, group_xmlid):
        """Create a test user with specific group."""
        group = cls.env.ref(group_xmlid)
        return cls.env['res.users'].create({
            'name': f'Test {login.title()}',
            'login': f'{login}@test.com',
            'email': f'{login}@test.com',
            'groups_id': [(6, 0, [group.id])],
        })

    def assertRecordValues(self, records, expected_values):
        """Assert record values match expected values."""
        for record, expected in zip(records, expected_values):
            for field, value in expected.items():
                self.assertEqual(
                    getattr(record, field),
                    value,
                    f"Field '{field}' mismatch: {getattr(record, field)} != {value}"
                )
```

## Running Tests

### Command Line

```bash
# Run all tests for a module
./odoo-bin -c odoo.conf -d test_db --test-enable -i seitech_elearning --stop-after-init

# Run specific test file
./odoo-bin -c odoo.conf -d test_db --test-enable --test-tags /seitech_elearning.test_enrollment

# Run with coverage
coverage run ./odoo-bin -c odoo.conf -d test_db --test-enable -i seitech_elearning --stop-after-init
coverage report --include="*seitech*"
coverage html

# Run only specific tagged tests
./odoo-bin -c odoo.conf -d test_db --test-enable --test-tags post_install
```

### Test Tags

```python
from odoo.tests import tagged

# Run at install
@tagged('at_install')
class TestAtInstall(TransactionCase):
    pass

# Run after install
@tagged('post_install', '-at_install')
class TestPostInstall(TransactionCase):
    pass

# Custom tags
@tagged('enrollment', 'security')
class TestEnrollmentSecurity(TransactionCase):
    pass
```

## Test Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Models | 90% |
| Controllers | 80% |
| Wizards | 85% |
| Security (ACL) | 100% |
| Critical Paths | 100% |

## Best Practices

1. **Isolate tests**: Each test should be independent
2. **Use transactions**: Tests auto-rollback after each method
3. **Disable tracking**: Use `tracking_disable=True` in context
4. **Mock external services**: Don't call real payment gateways
5. **Test edge cases**: Empty data, invalid input, boundaries
6. **Test security**: Verify access rights work correctly
7. **Name clearly**: Test method names should describe what's tested
8. **Keep it fast**: Avoid unnecessary database operations
9. **Document failures**: Add comments explaining expected failures
10. **Continuous integration**: Run tests on every commit

## Mocking External Services

```python
from unittest.mock import patch, MagicMock

class TestPaymentIntegration(TransactionCase):

    @patch('odoo.addons.seitech_elearning.models.payment.requests.post')
    def test_payment_processing(self, mock_post):
        """Test payment processing with mocked gateway."""
        # Mock successful response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'success': True,
            'transaction_id': 'TXN123',
        }
        mock_post.return_value = mock_response

        # Create payment
        payment = self.env['seitech.payment'].create({
            'amount': 100.00,
            'enrollment_id': self.enrollment.id,
        })
        payment.process_payment()

        # Verify
        self.assertEqual(payment.state, 'completed')
        self.assertEqual(payment.transaction_id, 'TXN123')
        mock_post.assert_called_once()
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Odoo Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: odoo
          POSTGRES_USER: odoo
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: |
          ./odoo-bin -c odoo.conf \
            -d test_db \
            --test-enable \
            -i seitech_elearning \
            --stop-after-init
```
