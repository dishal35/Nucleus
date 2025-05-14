FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies including socket.io-client
RUN npm install
RUN npm install socket.io-client@4.7.2

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"] 