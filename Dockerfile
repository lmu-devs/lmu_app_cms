FROM directus/directus:11.5.1

# Set environment variables
ARG BUILD_ENV=production
ENV NODE_ENV=${BUILD_ENV}

# Copy extensions
COPY ./extensions /directus/extensions

# Give proper permissions to extensions directory
USER root
RUN chown -R node:node /directus/extensions

# Switch to node user and build extensions
USER node
WORKDIR /directus/extensions/link-with-favicon
RUN npm install && npx @directus/extensions-sdk build

# Set back to the main directory
WORKDIR /directus

# Copy uploads directory if it exists
COPY ./uploads /directus/uploads

# Switch back to root to handle uploads permissions
USER root
RUN chown -R node:node /directus/uploads

# Switch back to node user for running the application
USER node

# Don't copy data directory - this should be a volume in production/staging
# COPY ./data /directus/data
# Set proper ownership and permissions
# RUN chown -R node:node /directus/extensions /directus/uploads