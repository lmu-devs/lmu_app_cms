# LMU App CMS

Content Management System for the LMU App, powered by [Directus](https://directus.io/).

## Prerequisites

- Docker and Docker Compose
- Node.js (recommended for running Directus CLI tools)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/lmu-devs/lmu_app_cms.git
cd lmu_app_cms
```

2. Create your environment file:
```bash
cp .env.example .env
```

3. Start the CMS:
```bash
docker-compose -f docker-compose.directus.yml up -d
```

The CMS will be available at `http://localhost:8055`

## Project Structure

```
.
├── data/           # Database files (auto-generated)
├── extensions/     # Custom Directus extensions
├── uploads/        # User uploaded files
└── docker-compose.directus.yml
```

## Development

The CMS is built on Directus 11.5.1 and uses PostgreSQL with PostGIS support for the database.
