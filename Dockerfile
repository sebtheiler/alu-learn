FROM node:18-alpine AS base

# Prune (Isolate the specific app)
FROM base AS pruner
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune --scope=alu-learn --docker

# Install, Build, & Run
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g pnpm
WORKDIR /app

# Copy lockfile and json
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --from=pruner /app/out/full/ .

# Generate Prisma Client
RUN cd apps/alu-learn && npx prisma generate

# --- BUILD ARGUMENTS ---
ARG NEXT_PUBLIC_GOOGLE_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_APP_ROOT_URL
ARG NEXT_PUBLIC_ALU_PRO_TRIAL_DAYS

# Fallback defaults to prevent crash if args are missing
ENV NEXT_PUBLIC_GOOGLE_ID=${NEXT_PUBLIC_GOOGLE_ID:-"build_dummy"}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-"build_dummy"}
ENV NEXT_PUBLIC_APP_ROOT_URL=${NEXT_PUBLIC_APP_ROOT_URL:-"http://localhost:3000"}
ENV NEXT_PUBLIC_ALU_PRO_TRIAL_DAYS=${NEXT_PUBLIC_ALU_PRO_TRIAL_DAYS:-"14"}

# Hardcode internal build vars
ENV DEBUG="false"
ENV ANALYZE_BUNDLE_SIZE="false"
ENV EMAIL_FROM="noreply@example.com"
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV SECRET="dummy_secret"
ENV PARTNERED_DOMAINS="[]"

# Mock secrets to pass build validation
ENV GOOGLE_SECRET="dummy"
ENV EMAIL_SERVER_HOST="dummy"
ENV EMAIL_SERVER_PORT="587"
ENV EMAIL_SERVER_USER="dummy"
ENV EMAIL_SERVER_PASSWORD="dummy"
ENV CRON_SECRET_SIGNING_KEY="dummy"
ENV OPENAI_API_KEY="dummy"
# ENV SLACK_SIGNING_SECRET="dummy"
ENV ALU_BOT_OAUTH_TOKEN="dummy"
ENV STRIPE_SECRET_KEY="dummy"

# Build the project
RUN pnpm run build --filter=alu-learn

# Expose port
EXPOSE 3000

# Set Runtime Env Defaults
ENV NODE_ENV=production
ENV PORT=3000

CMD ["pnpm", "start", "--filter=alu-learn"]
