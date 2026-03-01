FROM node:20 AS dev

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# React dev server runs on port 3000
EXPOSE 5173

# Start React development server
CMD ["npm", "run", "dev"]


####### BEGIN BUILD VERSIOn
#
#FROM node:20 as build
#
#WORKDIR /app
#
#COPY package*.json ./
#RUN npm install
#
#COPY . .
#
#RUN npm run build
#
#FROM nginx:alpine
#
#COPY --from=build /app/dist /usr/share/nginx/html
#COPY default.conf /etc/nginx/conf.d/default.conf
#
#
#EXPOSE 80
#
#CMD ["nginx", "-g", "daemon off;"]