FROM node:alpine

WORKDIR /app
COPY . .

RUN npm install -g http-server

EXPOSE 4200
CMD ["http-server", "-p", "4200"]
