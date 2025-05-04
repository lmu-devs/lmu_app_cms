FROM directus/directus:11.5.1

# Install Node.js and npm - these are already in the Directus image, but explicitly define for clarity
ENV NODE_ENV=production

# Copy extensions
COPY ./extensions /directus/extensions

# Build extensions
WORKDIR /directus/extensions/link-with-favicon
RUN npm ci && npm run build

# Set back to the main directory
WORKDIR /directus

# Copy uploads directory if it exists
COPY ./uploads /directus/uploads
COPY ./data /directus/data