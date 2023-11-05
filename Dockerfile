FROM --platform=linux/amd64 node:20

VOLUME ["/root"]

ADD setup-ffmpeg.sh /root

RUN /root/setup-ffmpeg.sh

WORKDIR /usr/src/app

COPY package\*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "start" ]
