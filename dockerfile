FROM node:16

ENV NODE_ENVIRONMENT=production

WORKDIR /app
COPY ["package.json", "package-lock.json", "./"];
RUN npm install --production
COPY . .

CMD ["npm", "run", "serve"]