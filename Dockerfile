# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
# Copy only the package.json and yarn.lock files for dependency installation
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Stage 2: Build the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app
# Copy all the source code into the container
COPY . .
# Copy the dependencies installed in the previous stage
COPY --from=deps /app/node_modules ./node_modules
# Run the build command to generate the .next folder
RUN yarn build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set the environment to production
ENV NODE_ENV production

# Copy the build artifacts and necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["yarn", "start"]
