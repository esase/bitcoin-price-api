FROM node:20.11.1

WORKDIR /app

COPY ./dist ./dist
COPY ./node_modules ./node_modules
COPY ./package.json ./package.json

CMD ["npm", "start"]
