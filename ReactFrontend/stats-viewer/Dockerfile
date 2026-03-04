FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# React dev server runs on port 3000
EXPOSE 5173
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]