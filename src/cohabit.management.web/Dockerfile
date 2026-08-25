# Build from the repository root:
#   docker build -f src/cohabit.management.web/Dockerfile -t cohabit-management-web .

FROM node:22-alpine AS build
WORKDIR /app
COPY ["src/cohabit.management.web/package.json", "src/cohabit.management.web/.npmrc", "src/cohabit.management.web/"]
WORKDIR "/app/src/cohabit.management.web"
RUN npm install
COPY ["src/cohabit.management.web/", "."]

ARG VITE_API_URL=""
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ENV VITE_API_URL=$VITE_API_URL \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

FROM nginx:alpine AS final
COPY --from=build /app/src/cohabit.management.web/dist /usr/share/nginx/html
COPY ["src/cohabit.management.web/nginx.conf", "/etc/nginx/conf.d/default.conf"]
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
