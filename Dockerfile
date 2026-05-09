FROM node:22-alpine

RUN node -v

RUN apk add --no-cache \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libx11 \
    libxcomposite \
    libxdamage \
    libxrandr \
    libxtst \
    libxshmfence \
    alsa-lib \
    cups-libs \
    udev \
    libstdc++ \
    bash
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_OPTIONS=--max-old-space-size=4096
    
WORKDIR /app

COPY . .

RUN yarn
RUN yarn build

EXPOSE 4400

RUN ["chmod", "+x", "./entrypoint.sh"]

ENTRYPOINT [ "sh", "./entrypoint.sh" ]