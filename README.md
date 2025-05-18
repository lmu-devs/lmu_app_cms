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

## Extensions

Directus is a highly extensible open-source platform that can be customized in various ways. The platform is built with Vue.js 3, allowing developers to create custom extensions using Vue.js components and the Directus Extension SDK. You can learn more about creating extensions in the [official documentation](https://docs.directus.io/extensions/creating-extensions.html).

When developing extensions, you can utilize Directus' comprehensive UI component library. These components are documented and showcased in the [Directus UI Components Library](https://components.directus.io/), which serves as a valuable resource for maintaining consistency with the Directus interface.

### Custom Extensions

#### Link with Favicon Interface

Our repository includes a custom interface extension called "Favicon Link". This interface extension lets you save a favicon link and display a preview of the favicon. It also allows you to generate a favicon url based on a related field containing a URL.
