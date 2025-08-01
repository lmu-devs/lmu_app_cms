# Stage 1: Build third-party extensions
FROM node:20-alpine AS third-party-ext
RUN apk add python3 g++ make
WORKDIR /extensions
COPY extensions/package.json ./
RUN npm install
# Move all extensions that start with directus-extension- to the directus folder
RUN mkdir -p ./directus
RUN cd node_modules && find . -maxdepth 1 -type d -name "directus-extension-*" -exec mv {} ../directus \;

# Stage 2: Build custom extensions
FROM node:20-alpine AS custom-ext
RUN apk add python3 g++ make
WORKDIR /extensions
COPY extensions/link-with-favicon ./link-with-favicon
WORKDIR /extensions/link-with-favicon
RUN npm install && npx @directus/extensions-sdk build

# Stage 3: Final image
FROM directus/directus:11.10.0

# Set environment variables
ARG BUILD_ENV=production
ENV NODE_ENV=${BUILD_ENV}

# Copy third-party extensions
COPY --from=third-party-ext /extensions/directus ./extensions

# Copy custom extensions (complete directory with package.json and dist)
COPY --from=custom-ext /extensions/link-with-favicon ./extensions/link-with-favicon

# Copy uploads directory and set permissions
COPY ./uploads /directus/uploads
USER root
RUN mkdir -p /directus/uploads && chown -R node:node /directus/uploads /directus/extensions && chmod -R 755 /directus/uploads

# Switch back to node user for running the application
USER node