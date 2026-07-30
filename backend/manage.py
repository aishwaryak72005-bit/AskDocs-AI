"""
manage.py

Django's command-line utility for administrative tasks.

Common commands:
  python manage.py runserver       → Start the development server
  python manage.py makemigrations  → Create database migration files
  python manage.py migrate         → Apply migrations to database
  python manage.py createsuperuser → Create an admin user
"""

import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'askdocs.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Make sure it's installed and you've "
            "activated your virtual environment."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
