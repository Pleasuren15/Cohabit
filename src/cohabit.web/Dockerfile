# Build from the repository root:
#   docker build -f src/cohabit.web/Dockerfile -t cohabit-web .
# Optional build args (baked into the bundle at build time): VITE_API_URL,
# VITE_USE_MOCK_DATA, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.

FROM node:22-alpine AS build
WORKDIR /app
COPY ["src/cohabit.web/package.json", "src/cohabit.web/package-lock.json", "src/cohabit.web/.npmrc", "src/cohabit.web/"]
WORKDIR "/app/src/cohabit.web"
RUN npm ci
COPY ["src/cohabit.web/", "."]

ARG VITE_API_URL=""
ARG VITE_USE_MOCK_DATA=""
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ENV VITE_API_URL=$VITE_API_URL \
    VITE_USE_MOCK_DATA=$VITE_USE_MOCK_DATA \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

FROM nginx:alpine AS final
COPY --from=build /app/src/cohabit.web/dist /usr/share/nginx/html
COPY ["src/cohabit.web/nginx.conf", "/etc/nginx/conf.d/default.conf"]
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]