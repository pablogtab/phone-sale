FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:production

FROM nginx:stable-alpine
COPY deploy/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/phone-sale/browser /usr/share/nginx/html
EXPOSE 80
