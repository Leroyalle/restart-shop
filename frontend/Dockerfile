FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

RUN bun run build

EXPOSE 3001

CMD ["bun", "run", "preview", "--host", "0.0.0.0", "--port", "3001"]