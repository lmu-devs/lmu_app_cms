FROM directus/directus:11.5.1

# Set environment variables
ARG BUILD_ENV=production
ENV NODE_ENV=${BUILD_ENV}

# Copy extensions
COPY ./extensions /directus/extensions

# Build extensions
WORKDIR /directus/extensions/link-with-favicon
RUN npm ci && npm run build

# Set back to the main directory
WORKDIR /directus

# Copy uploads directory if it exists
COPY ./uploads /directus/uploads

# Don't copy data directory - this should be a volume in production/staging
# COPY ./data /directus/data
# Set proper ownership and permissions
# RUN chown -R node:node /directus/extensions /directus/uploads

# Use node user for better security (already exists in the base image)
# USER node