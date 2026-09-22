FROM node:24.21.0-bookworm
WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci

ENV NODE_ENV=production
ENV SYNCSPACE_HOST=0.0.0.0
ENV SYNCSPACE_SYNC_PORT=4357
ENV SYNCSPACE_DATA_DIR=/data

VOLUME ["/data"]
EXPOSE 4357

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||process.env.SYNCSPACE_SYNC_PORT||4357)+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "run", "start:hosted", "-w", "@syncspace/sync-server"]
