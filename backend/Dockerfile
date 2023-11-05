FROM --platform=linux/amd64 node:20

VOLUME ["/root"]

ADD ./scripts/ffmpeg-setup.sh /root

RUN /root/ffmpeg-setup.sh

WORKDIR /usr/src/app

COPY package\*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "start" ]
