# Seitech Odoo 19.0 Enterprise Docker Image
# Lightweight image that uses mounted Odoo source
FROM python:3.12-slim-bookworm

LABEL maintainer="Seitech International <dev@seitech.co.za>"
LABEL version="19.0"
LABEL description="Odoo 19.0 Enterprise with Seitech custom modules"

# Set locale
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Odoo configuration
ENV ODOO_USER=odoo
ENV ODOO_HOME=/opt/odoo

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build tools
    build-essential \
    # Libraries for Python packages
    libxml2-dev \
    libxslt1-dev \
    libldap2-dev \
    libsasl2-dev \
    libjpeg-dev \
    libpng-dev \
    libfreetype6-dev \
    zlib1g-dev \
    # PostgreSQL client
    libpq-dev \
    postgresql-client \
    # Node.js for asset compilation
    nodejs \
    npm \
    # Utilities
    git \
    curl \
    wget \
    # For PDF generation (wkhtmltopdf)
    wkhtmltopdf \
    fontconfig \
    fonts-liberation \
    fonts-dejavu \
    # For QR codes
    libzbar0 \
    # For python-magic
    libmagic1 \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g rtlcss less less-plugin-clean-css

# Create Odoo user and directories
RUN useradd -m -d ${ODOO_HOME} -s /bin/bash ${ODOO_USER} \
    && mkdir -p ${ODOO_HOME}/{odoo,custom_addons,data,config,logs} \
    && chown -R ${ODOO_USER}:${ODOO_USER} ${ODOO_HOME}

WORKDIR ${ODOO_HOME}

# Install Python dependencies from requirements
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Copy and setup entrypoint
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh

USER ${ODOO_USER}

# Expose ports
EXPOSE 8069 8071 8072

# Volumes
VOLUME ["${ODOO_HOME}/data", "${ODOO_HOME}/custom_addons", "${ODOO_HOME}/logs"]

ENTRYPOINT ["/entrypoint.sh"]
CMD ["odoo"]
