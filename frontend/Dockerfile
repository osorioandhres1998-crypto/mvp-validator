FROM node:20-alpine

WORKDIR /app

# Instalar dependencias (si existe package-lock se aprovecha la caché).
COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Modo desarrollo para el placeholder. En producción usar `npm run build && start`.
CMD ["npm", "run", "dev"]
